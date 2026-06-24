import config

import config

# Global cache for list sets to prevent re-parsing on every request
_CACHE = {
    "FREE_EMAIL_DOMAINS": None,
    "DISPOSABLE_DOMAINS": None,
    "ROLE_ACCOUNTS": None,
    "SPAMTRAP_DOMAINS": None,
    "SPAMTRAP_KEYWORDS": None,
    "TYPO_TRAP_DOMAINS": None,
    "CATCH_ALL_KNOWN_DOMAINS": None
}

def get_list(name):
    if _CACHE[name] is None:
        # Fetch from config, default to empty list if missing during reload
        raw = getattr(config, name, [])
        _CACHE[name] = set(raw)
    return _CACHE[name]

def check(parsed: dict) -> dict:
    # Module 3: List Checks
    username = parsed["username"]
    domain = parsed["domain"]
    
    # Heuristic: Keywords in username or domain
    is_trap = domain in get_list("SPAMTRAP_DOMAINS") or domain in get_list("TYPO_TRAP_DOMAINS")
    if not is_trap:
        keywords = get_list("SPAMTRAP_KEYWORDS")
        full_text = f"{username}@{domain}".lower()
        if any(kw in full_text for kw in keywords):
            is_trap = True
            
    return {
        "is_disposable": domain in get_list("DISPOSABLE_DOMAINS"),
        "is_free_email": domain in get_list("FREE_EMAIL_DOMAINS"),
        "is_role_account": username in get_list("ROLE_ACCOUNTS"),
        "is_spamtrap": is_trap,
        "is_known_catch_all": domain in get_list("CATCH_ALL_KNOWN_DOMAINS")
    }
