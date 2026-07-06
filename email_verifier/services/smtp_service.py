import smtplib
import asyncio
import config
from utils.helpers import random_8_chars

class SMTPResult:
    def __init__(self, connected=False, smtp_code=None, smtp_message=None, status="unknown"):
        self.connected = connected
        self.smtp_code = smtp_code
        self.smtp_message = smtp_message or ""
        self.status = status

def _smtp_check_sync(email, target_host) -> SMTPResult:
    # Module 5: SMTP ENGINE
    try:
        if config.SMTP_RELAY_USE:
            host = config.SMTP_RELAY_HOST
            port = config.SMTP_RELAY_PORT
        else:
            host = target_host
            port = 25 # Default as per spec
            
        try:
            # Initialize with host and port to correctly set internal 'host' for STARTTLS
            server = smtplib.SMTP(host, port, timeout=config.SMTP_TIMEOUT)
        except (ConnectionRefusedError, TimeoutError, OSError) as e:
            return SMTPResult(status="blocked", smtp_message=f"Connection failed: {str(e)}")
        
        server.ehlo(config.SMTP_HELO_DOMAIN)
        
        # If using relay, we must authenticate
        if config.SMTP_RELAY_USE:
            try:
                server.starttls()
                server.ehlo(config.SMTP_HELO_DOMAIN)
                server.login(config.SMTP_RELAY_USER, config.SMTP_RELAY_KEY)
            except Exception as e:
                return SMTPResult(status="unknown", smtp_message=f"Relay Auth Failed: {str(e)}")
        
        server.mail(config.SMTP_FROM_EMAIL)
        code, message = server.rcpt(email)
        server.quit()
        
        return SMTPResult(connected=True, smtp_code=code, smtp_message=message.decode('utf-8', errors='ignore'))
        
    except Exception as e:
        return SMTPResult(status="unknown", smtp_message=str(e))

async def _smtp_check_with_retry(email, mx_host) -> SMTPResult:
    last_res = None
    for attempt in range(config.SMTP_RETRY_COUNT + 1):
        res = await asyncio.to_thread(_smtp_check_sync, email, mx_host)
        
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
        "is_catch_all": is_known_catch_all,
        "is_mailbox_verified": None,
        "smtp_status": "unknown",
        "smtp_error_note": None
    }
    
    if not config.SMTP_RELAY_USE and not mx_hosts:
        return res
        
    primary_host = mx_hosts[0] if mx_hosts else None
    
    # Step 1: Catch-all detection
    if not is_known_catch_all:
        domain = email.split('@')[1]
        
        if domain not in config.NEVER_CATCH_ALL_DOMAINS:
            fake_user = f"zz9xfake_{random_8_chars()}"
            fake_email = f"{fake_user}@{domain}"
            
            fake_res = await _smtp_check_with_retry(fake_email, primary_host)
            if fake_res.connected and fake_res.smtp_code in [250, 251]:
                res["is_catch_all"] = True
            
    actual_res = await _smtp_check_with_retry(email, primary_host)
    
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
    
    if res.get("is_deliverable") and not res.get("is_catch_all"):
        res["is_mailbox_verified"] = True
    elif res.get("is_disabled") or res.get("smtp_status") == "blocked":
        res["is_mailbox_verified"] = False
    else:
        res["is_mailbox_verified"] = None
    
    return res
