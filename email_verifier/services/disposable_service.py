import asyncio
import math
import whois
from collections import Counter
from datetime import datetime, timezone

import config


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

_WELL_KNOWN_DOMAINS = {
    "example.com", "example.org", "example.net",
    "localhost", "invalid",
    "microsoft.com", "facebook.com", "amazon.com", "apple.com"
}


def _shannon_entropy(s: str) -> float:
    if not s:
        return 0.0
    p, lns = Counter(s), float(len(s))
    return -sum((count / lns) * math.log(count / lns, 2) for count in p.values())


def _matches_disposable_keywords(text: str) -> bool:
    text = text.lower()
    return any(kw in text for kw in _DISPOSABLE_KEYWORDS)


def _matches_mx_keywords(mx_host: str) -> bool:
    host = mx_host.lower()
    return any(kw in host for kw in _DISPOSABLE_MX_KEYWORDS)


async def is_disposable(domain: str, mx_hosts: list) -> bool:
    if domain in _WELL_KNOWN_DOMAINS:
        return False

    free_domains = getattr(config, "FREE_EMAIL_DOMAINS", [])
    if domain in free_domains:
        return False

    if _matches_disposable_keywords(domain):
        return True

    for mx_host in mx_hosts:
        if _matches_mx_keywords(mx_host):
            return True

    if _looks_randomly_generated(domain):
        return True

    try:
        whois_data = await _fetch_whois(domain)
        if whois_data and _is_recently_registered(whois_data):
            return True
    except Exception:
        pass

    return False


def _looks_randomly_generated(domain: str) -> bool:
    name = domain.split(".")[0].lower()
    if len(name) < 6:
        return False

    entropy = _shannon_entropy(name)
    return entropy >= 2.5


async def _fetch_whois(domain: str) -> dict:
    try:
        data = whois.whois(domain)
        return data
    except Exception:
        return {}


def _is_recently_registered(whois_data: dict, days_threshold: int = 14) -> bool:
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
