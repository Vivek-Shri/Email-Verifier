import asyncio
import math
import os
import time
import requests
import whois
from collections import Counter
from datetime import datetime, timezone

import config


_FREE_EMAIL_MX_SUFFIXES = {
    "google.com", "googlemail.com",
    "outlook.com", "live.com", "hotmail.com", "msn.com",
    "yahoo.com", "yahoo.co.in", "yahoo.co.uk", "yahoo.de",
    "aol.com",
    "protonmail.com", "proton.me", "protonmail.ch",
    "zoho.com",
    "gmx.com", "gmx.net",
    "tutanota.com",
    "icloud.com", "me.com", "mac.com",
    "mail.com", "yandex.com", "yandex.net", "yandex.ru",
    "qq.com", "foxmail.com", "naver.com",
    "daum.net", "hanmail.net",
    "rediffmail.com",
    "sina.com", "sina.cn",
    "126.com", "163.com", "yeah.net",
}

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

_DYNAMIC_DISPOSABLE_SET: set = set()
_LAST_FETCHED: float = 0
CACHE_TTL_SECONDS = 86400


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


def _is_free_email_by_mx(mx_hosts: list) -> bool:
    for mx in mx_hosts:
        mx_lower = mx.lower()
        for suffix in _FREE_EMAIL_MX_SUFFIXES:
            if mx_lower == suffix or mx_lower.endswith("." + suffix):
                return True
    return False


def load_dynamic_disposable_list() -> set:
    global _LAST_FETCHED
    if not getattr(config, "DYNAMIC_DISPOSABLE_LIST_ENABLED", False):
        return set()

    now = time.time()
    if _DYNAMIC_DISPOSABLE_SET and (now - _LAST_FETCHED) < CACHE_TTL_SECONDS:
        return _DYNAMIC_DISPOSABLE_SET

    try:
        url = getattr(config, "DYNAMIC_DISPOSABLE_LIST_URL", "")
        if not url:
            return _DYNAMIC_DISPOSABLE_SET
        resp = requests.get(url, timeout=10)
        if resp.status_code == 200:
            domains = resp.text.splitlines()
            _DYNAMIC_DISPOSABLE_SET.clear()
            _DYNAMIC_DISPOSABLE_SET.update(d.strip().lower() for d in domains if d.strip())
            _LAST_FETCHED = now
    except Exception:
        pass
    return _DYNAMIC_DISPOSABLE_SET


async def is_disposable(domain: str, mx_hosts: list) -> bool:
    if _is_free_email_by_mx(mx_hosts):
        return False

    if _matches_disposable_keywords(domain):
        return True

    for mx_host in mx_hosts:
        if _matches_mx_keywords(mx_host):
            return True

    dynamic_list = load_dynamic_disposable_list()
    if domain.lower() in dynamic_list:
        return True

    if _looks_randomly_generated(domain):
        try:
            whois_data = await _fetch_whois(domain)
            if whois_data and _is_recently_registered(whois_data):
                return True
        except Exception:
            pass

    if _is_disposable_by_api(domain):
        return True

    return False


def _looks_randomly_generated(domain: str) -> bool:
    name = domain.split(".")[0].lower()
    if len(name) < 6:
        return False

    entropy = _shannon_entropy(name)
    return entropy >= 2.5


def _is_disposable_by_api(domain: str) -> bool:
    if not getattr(config, "DISPOSABLE_API_FALLBACK_ENABLED", False):
        return False
    try:
        url = getattr(config, "DISPOSABLE_API_FALLBACK_URL", "")
        if not url:
            return False
        resp = requests.get(url, params={"email": f"test@{domain}"}, timeout=5)
        if resp.status_code == 200:
            data = resp.json()
            return str(data.get("disposable", "false")).lower() == "true"
    except Exception:
        pass
    return False


async def _fetch_whois(domain: str) -> dict:
    try:
        data = await asyncio.wait_for(
            asyncio.to_thread(whois.whois, domain),
            timeout=5
        )
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

