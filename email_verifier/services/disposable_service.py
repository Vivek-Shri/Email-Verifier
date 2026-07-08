import asyncio
import whois
from datetime import datetime, timezone


_DISPOSABLE_KEYWORDS = {
    "temp", "disposable", "throwaway", "mailinator", "guerrilla",
    "yopmail", "10minute", "trash", "fake", "spam", "inbox",
    "tempmail", "maildrop", "discard", "filzmail", "mailnesia",
    "spamgourmet", "mailnull", "dispostable", "sharklasers",
    "grr.la", "getairmail", "mytemp", "tempinbox", "throwam"
}

_DISPOSABLE_MX_KEYWORDS = {
    "temp", "disposable", "throwaway", "mailinator", "guerrilla",
    "yopmail", "10minute", "trash", "fake", "spam", "inbox",
    "tempmail", "maildrop", "discard", "filzmail", "mailnesia",
    "spamgourmet", "mailnull", "dispostable", "sharklasers",
    "grr.la", "getairmail", "mytemp", "tempinbox", "throwam"
}


def _matches_disposable_keywords(text: str) -> bool:
    text = text.lower()
    return any(kw in text for kw in _DISPOSABLE_KEYWORDS)


def _matches_mx_keywords(mx_host: str) -> bool:
    host = mx_host.lower()
    return any(kw in host for kw in _DISPOSABLE_MX_KEYWORDS)


async def is_disposable(domain: str, mx_hosts: list) -> bool:
    if _matches_disposable_keywords(domain):
        return True

    for mx_host in mx_hosts:
        if _matches_mx_keywords(mx_host):
            return True

    try:
        whois_data = await _fetch_whois(domain)
        if whois_data and _is_recently_registered(whois_data):
            return True
    except Exception:
        pass

    return False


async def _fetch_whois(domain: str) -> dict:
    try:
        data = whois.whois(domain)
        return data
    except Exception:
        return {}


def _is_recently_registered(whois_data: dict, days_threshold: int = 30) -> bool:
    creation_date = whois_data.get("creation_date")
    if not creation_date:
        return False

    if isinstance(creation_date, list):
        creation_date = creation_date[0]

    if hasattr(creation_date, "tzinfo") and creation_date.tzinfo is None:
        creation_date = creation_date.replace(tzinfo=timezone.utc)

    now = datetime.now(timezone.utc)
    age_days = (now - creation_date).days
    return age_days < days_threshold
