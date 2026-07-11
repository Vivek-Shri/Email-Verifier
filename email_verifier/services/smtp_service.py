import smtplib
import asyncio
import socket
import config
from utils.helpers import random_8_chars

class SMTPResult:
    def __init__(self, connected=False, smtp_code=None, smtp_message=None, status="unknown"):
        self.connected = connected
        self.smtp_code = smtp_code
        self.smtp_message = smtp_message or ""
        self.status = status

def _smtp_check_sync(email, target_host, force_relay=False) -> SMTPResult:
    # Module 5: SMTP ENGINE
    server = None
    use_relay = force_relay or config.SMTP_RELAY_USE
    try:
        if use_relay:
            host = config.SMTP_RELAY_HOST
            port = config.SMTP_RELAY_PORT
        else:
            host = target_host
            port = 25 # Default as per spec
            
        try:
            server = smtplib.SMTP(host, port, timeout=config.SMTP_TIMEOUT)
        except (ConnectionRefusedError, TimeoutError, OSError):
            return SMTPResult(status="blocked", smtp_message="Connection failed: unable to reach mail server")
        
        server.ehlo(config.SMTP_HELO_DOMAIN)
        
        # If using relay, we must authenticate
        if use_relay:
            try:
                server.starttls()
                server.ehlo(config.SMTP_HELO_DOMAIN)
                server.login(config.SMTP_RELAY_USER, config.SMTP_RELAY_KEY)
            except Exception:
                return SMTPResult(status="unknown", smtp_message="Relay authentication failed")
        
        server.mail(config.SMTP_FROM_EMAIL)
        code, message = server.rcpt(email)
        
        return SMTPResult(connected=True, smtp_code=code, smtp_message=message.decode('utf-8', errors='ignore'))
        
    except socket.timeout:
        return SMTPResult(status="unknown", smtp_message="SMTP timeout")
    except Exception:
        return SMTPResult(status="unknown", smtp_message="SMTP verification failed")
    finally:
        if server:
            try:
                server.quit()
            except Exception:
                try:
                    server.close()
                except Exception:
                    pass

async def _smtp_check_with_retry(email, mx_host, force_relay=False) -> SMTPResult:
    last_res = None
    for attempt in range(config.SMTP_RETRY_COUNT + 1):
        res = await asyncio.to_thread(_smtp_check_sync, email, mx_host, force_relay=force_relay)
        
        if res.status == "blocked":
            return res
            
        if res.connected:
            if res.smtp_code in [421, 450, 451]:
                last_res = res
                if attempt < config.SMTP_RETRY_COUNT:
                    await asyncio.sleep(config.SMTP_RETRY_WAIT)
                    continue
                else:
                    res.status = "temporary_failure"
                    return res
            return res
            
        last_res = res
        if attempt < config.SMTP_RETRY_COUNT:
            await asyncio.sleep(config.SMTP_RETRY_WAIT)
        else:
            if "timeout" in res.smtp_message.lower():
                res.status = "temporary_failure"
            return res
            
    return last_res or SMTPResult()

async def verify(email: str, mx_hosts: list, is_known_catch_all: bool) -> dict:
    res = {
        "can_connect_smtp": False,
        "is_deliverable": False,
        "has_inbox_full": False,
        "is_disabled": False,
        "is_catch_all": False,
        "is_mailbox_verified": None,
        "smtp_status": "skipped",
        "smtp_error_note": None
    }

    domain = email.split("@")[-1] if "@" in email else None

    force_relay = domain in config.SMTP_RELAY_DOMAINS

    if domain in config.SMTP_BLOCKED_DOMAINS:
        res["smtp_error_note"] = (
            f"SMTP check skipped for {domain}: mail server actively blocks "
            "verification probes, and no relay is configured for this domain."
        )
        res["is_mailbox_verified"] = None
        return res

    # ----------------------------------------------------------------
    # SMTP_ACCEPT_ALL_DOMAINS: Yahoo, AOL etc. return 250 OK for ALL RCPT TO
    # commands regardless of whether the mailbox actually exists.
    # They perform the real check asynchronously and send NDR bounces later.
    # This makes direct SMTP verification impossible.
    # NOTE: These are NOT true catch-all domains — they just defer bounces.
    #       Mark as smtp_status=unverifiable, is_catch_all=False.
    # ----------------------------------------------------------------
    if domain in config.SMTP_ACCEPT_ALL_DOMAINS:
        res["is_catch_all"] = False
        res["smtp_status"] = "unverifiable"
        res["is_mailbox_verified"] = None
        res["smtp_error_note"] = (
            f"{domain} uses deferred bounce verification — SMTP always returns 250 OK "
            "regardless of whether the mailbox exists. Direct verification is not possible. "
            "Mailbox status is unknown."
        )
        return res

    if not config.SMTP_RELAY_USE and not mx_hosts and not force_relay:
        return res

    primary_host = mx_hosts[0] if mx_hosts else None

    # ----------------------------------------------------------------
    # Step 1: Catch-all detection
    # Strategy:
    #   a) If domain is in NEVER_CATCH_ALL_DOMAINS → skip probe, is_catch_all = False
    #   b) Run SMTP fake-email probe:
    #      - Accepted (250/251)      → is_catch_all = True
    #      - Rejected (5xx)          → is_catch_all = False (definitively not catch-all)
    #      - Cannot connect/timeout  → catch_all_probe_blocked = True (will use heuristic)
    # ----------------------------------------------------------------
    never_catch_all = domain in config.NEVER_CATCH_ALL_DOMAINS
    catch_all_probe_blocked = False  # tracks whether fake probe couldn't connect

    if never_catch_all:
        res["is_catch_all"] = False
    else:
        fake_user = f"zz9xfake_{random_8_chars()}"
        fake_email = f"{fake_user}@{domain}"

        fake_res = await _smtp_check_with_retry(fake_email, primary_host, force_relay=force_relay)

        if fake_res.connected:
            if fake_res.smtp_code in [250, 251]:
                # Server accepted a clearly fake address → it's catch-all
                res["is_catch_all"] = True
            else:
                # Server rejected fake address → NOT catch-all
                res["is_catch_all"] = False
        else:
            # Could not connect for fake probe (port blocked, timeout, etc.)
            # Do not assume catch-all — use heuristic after real probe
            catch_all_probe_blocked = True
            res["is_catch_all"] = False  # optimistic default; may be updated below

    # ----------------------------------------------------------------
    # Step 2: Actual email probe
    # ----------------------------------------------------------------
    actual_res = await _smtp_check_with_retry(email, primary_host, force_relay=force_relay)

    res["smtp_status"] = actual_res.status
    res["smtp_error_note"] = actual_res.smtp_message

    if actual_res.connected:
        res["can_connect_smtp"] = True
        res["smtp_status"] = "connected"

        code = actual_res.smtp_code
        msg = actual_res.smtp_message

        if code in [250, 251]:
            res["is_deliverable"] = True
        elif code == 452:
            res["has_inbox_full"] = True
        elif code == 550:
            if "5.2.1" in msg:
                res["is_disabled"] = True
            else:
                res["is_deliverable"] = False
        elif code in [551, 552, 553]:
            res["is_deliverable"] = False
        elif code in [421, 450, 451]:
            res["smtp_status"] = "temporary_failure"

    # ----------------------------------------------------------------
    # Step 3: Heuristic fallback when catch-all probe was blocked
    # If we couldn't run the fake probe but the real email was delivered:
    #   → Mark as deliverable/safe (SMTP confirmed delivery, catch-all unknown)
    #   → Add a note so the caller knows catch-all status is inconclusive
    # If real probe also couldn't connect → smtp_status = blocked, no penalty
    # ----------------------------------------------------------------
    if catch_all_probe_blocked:
        if res["is_deliverable"]:
            # Real email accepted — treat as safe, catch-all is indeterminate
            res["is_catch_all"] = False
            note = res.get("smtp_error_note") or ""
            res["smtp_error_note"] = (
                (note + " | " if note else "") +
                "Catch-all status could not be verified (SMTP probe blocked on fake address)"
            )
        else:
            # Real probe also failed/blocked — genuinely unknown
            res["is_catch_all"] = False

    # ----------------------------------------------------------------
    # Step 4: Set is_mailbox_verified
    # ----------------------------------------------------------------
    if res.get("is_catch_all"):
        res["is_mailbox_verified"] = False
    elif res.get("is_deliverable"):
        res["is_mailbox_verified"] = True
    elif res.get("is_disabled") or res.get("smtp_status") == "blocked":
        res["is_mailbox_verified"] = False
    elif res.get("smtp_status") == "skipped":
        res["is_mailbox_verified"] = None
    else:
        res["is_mailbox_verified"] = None

    return res
