import tempfile
import os

APP_VERSION = "1.0.0"
MAX_BULK_EMAILS = 10000
BULK_CONCURRENCY_LIMIT = 50
SMTP_TIMEOUT = 10
SMTP_RETRY_COUNT = 3
SMTP_RETRY_WAIT = 5
SMTP_HELO_DOMAIN = os.environ.get("SMTP_HELO_DOMAIN", "emailtesting.vps.webdock.cloud")
SMTP_FROM_EMAIL = os.environ.get("SMTP_FROM_EMAIL", "verify@emailtesting.vps.webdock.cloud")
TMP_FILE_DIR = os.path.join(tempfile.gettempdir(), "email_verifier")
TMP_FILE_EXPIRY_MINUTES = 15

# SMTP Relay Configuration (OFF by default — we connect directly to recipient MX on port 25)
SMTP_RELAY_USE = False
SMTP_RELAY_HOST = os.environ.get("SMTP_RELAY_HOST", "smtp-relay.brevo.com")
SMTP_RELAY_PORT = int(os.environ.get("SMTP_RELAY_PORT", "2525"))
SMTP_RELAY_USER = os.environ.get("SMTP_RELAY_USER", "")
SMTP_RELAY_KEY = os.environ.get("SMTP_RELAY_KEY", "")

# Ports to try (if relay is OFF)
SMTP_PORTS = [25]

FREE_EMAIL_DOMAINS = [
    "gmail.com", "yahoo.com", "hotmail.com", "outlook.com",
    "icloud.com", "aol.com", "protonmail.com", "zoho.com",
    "mail.com", "yandex.com", "gmx.com", "tutanota.com",
    "yahoo.co.in", "rediffmail.com", "live.com",
    "msn.com", "me.com", "mac.com", "googlemail.com", "yahoo.co.uk"
]

DISPOSABLE_DOMAINS = []

ROLE_ACCOUNTS = [
    "admin", "info", "support", "contact", "sales", "noreply",
    "no-reply", "help", "hr", "billing", "team", "hello", "mail",
    "office", "webmaster", "postmaster", "abuse", "security",
    "marketing", "newsletter", "enquiry", "enquiries",
    "careers", "jobs", "press", "media", "legal", "finance",
    "accounts", "reception", "it", "helpdesk", "service",
    "donotreply", "do-not-reply", "notifications", "alerts",
    "mailer", "daemon", "root", "hostmaster"
]

SPAMTRAP_DOMAINS = [
    "spamtrap.ro", "spamtrap.ms", "honeypot.email",
    "black.hole.io", "sp4m.com", "spamtrap.org",
    "trap.mailwash.net", "honeybot.org", "dummy-email.com",
    "sinkhole.org", "spamtrap.at", "spamtrap.be", "spamtrap.ch",
    "spamtrap.cz", "spamtrap.de", "spamtrap.dk", "spamtrap.ee",
    "spamtrap.es", "spamtrap.fi", "spamtrap.fr", "spamtrap.hu",
    "spamtrap.ie", "spamtrap.it", "spamtrap.lt", "spamtrap.lu",
    "spamtrap.lv", "spamtrap.nl", "spamtrap.no", "spamtrap.pl",
    "spamtrap.pt", "spamtrap.se", "spamtrap.si", "spamtrap.sk"
]

SPAMTRAP_KEYWORDS = [
    "spamtrap", "honeypot", "spam-trap", "sinkhole", 
    "blackhole", "trap-address", "decoy-mail"
]

TYPO_TRAP_DOMAINS = [
    "gamil.com", "gmal.com", "gmaill.com", "gmial.com",
    "hotmal.com", "hotmial.com", "hormail.com", "hotamail.com",
    "yaho.com", "yaboo.com", "yahooc.om", "outlok.com",
    "putlook.com", "icloud.co", "iclou.com"
]

# Cleared: catch-all status is now determined dynamically via SMTP fake-email probe.
# Do NOT add major providers here — they are not catch-all.
CATCH_ALL_KNOWN_DOMAINS = []

# Dynamic disposable domain list (downloaded from public sources at startup)
# Uses a maintained public blocklist (~74k domains). Refreshes every 24h.
DYNAMIC_DISPOSABLE_LIST_ENABLED = True
DYNAMIC_DISPOSABLE_LIST_URL = "https://raw.githubusercontent.com/disposable/disposable-email-domains/master/domains.txt"

# Fallback API for domains not caught by heuristics.
# Uses debounce.io free API (no key required). Set to True to enable.
DISPOSABLE_API_FALLBACK_ENABLED = os.environ.get("DISPOSABLE_API_FALLBACK_ENABLED", "false").lower() == "true"
DISPOSABLE_API_FALLBACK_URL = "https://disposable.debounce.io/"

# SMTP_RELAY_DOMAINS: domains that ALWAYS use the relay, even if SMTP_RELAY_USE=false.
# Useful when a provider (e.g., Yahoo) blocks direct MX:25 probes but allows relayed delivery.
# Requires SMTP_RELAY_USER and SMTP_RELAY_KEY to be configured.
SMTP_RELAY_DOMAINS = []

# Domains that are known to block SMTP verification and have no viable relay path
SMTP_BLOCKED_DOMAINS = []

# Domains that are definitively NOT catch-all AND can be verified via direct SMTP.
# For these, the fake-email catch-all probe is skipped and is_catch_all is always False.
# These are major providers known to properly reject non-existent addresses with 550.
NEVER_CATCH_ALL_DOMAINS = [
    # Google — properly rejects non-existent addresses with 550
    "gmail.com", "googlemail.com",
    # Apple — properly rejects with 550
    "icloud.com", "me.com", "mac.com",
    # Microsoft — properly rejects with 550
    "outlook.com", "hotmail.com", "live.com", "msn.com",
    "protection.outlook.com", "office365.com",
    # Other providers with proper rejection
    "protonmail.com", "proton.me",
    "zoho.com",
    "yandex.com", "yandex.ru",
    "rediffmail.com"
]

# SMTP_ACCEPT_ALL_DOMAINS: Providers that return 250 OK for ALL RCPT TO commands
# regardless of whether the mailbox exists (deferred bounce / greylisting behavior).
# Yahoo, AOL etc. accept at SMTP time and bounce later via NDR.
# These CANNOT be verified via direct SMTP — treat as catch-all / unverifiable.
# To properly verify these, a relay with API access would be needed.
SMTP_ACCEPT_ALL_DOMAINS = [
    "yahoo.com", "yahoo.co.in", "yahoo.co.uk", "yahoo.de",
    "yahoo.es", "yahoo.fr", "yahoo.it", "yahoo.ca",
    "yahoo.com.au", "yahoo.co.nz", "yahoo.co.jp", "yahoo.tl",
    "ymail.com", "rocketmail.com",
    "aol.com",
]
