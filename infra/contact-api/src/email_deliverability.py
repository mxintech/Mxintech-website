"""Email deliverability checks before sending OTP mail."""

from __future__ import annotations

import json
import urllib.error
import urllib.request

DISPOSABLE_EMAIL_DOMAINS = frozenset({
    '10minutemail.com',
    '10minutemail.net',
    'dispostable.com',
    'dropmail.me',
    'fakeinbox.com',
    'getnada.com',
    'guerrillamail.com',
    'guerrillamail.net',
    'guerrillamail.org',
    'guerrillamailblock.com',
    'maildrop.cc',
    'mailinator.com',
    'mailnesia.com',
    'mintemail.com',
    'sharklasers.com',
    'temp-mail.org',
    'tempmail.com',
    'tempmail.net',
    'throwaway.email',
    'trashmail.com',
    'yopmail.com',
})

_MX_LOOKUP_TIMEOUT_SECONDS = 3


def email_domain(email: str) -> str:
    return email.rsplit('@', 1)[-1].strip().lower()


def is_disposable_email_domain(domain: str) -> bool:
    normalized = email_domain(domain) if '@' in domain else domain.strip().lower()
    return normalized in DISPOSABLE_EMAIL_DOMAINS


def domain_has_mx_record(domain: str) -> bool:
    normalized = domain.strip().lower().rstrip('.')
    if not normalized:
        return False

    url = f'https://dns.google/resolve?name={urllib.request.quote(normalized)}&type=MX'
    request = urllib.request.Request(url, headers={'Accept': 'application/dns-json'})
    try:
        with urllib.request.urlopen(request, timeout=_MX_LOOKUP_TIMEOUT_SECONDS) as response:
            payload = json.loads(response.read().decode('utf-8'))
    except (urllib.error.URLError, TimeoutError, ValueError, json.JSONDecodeError):
        return True

    for answer in payload.get('Answer') or []:
        if answer.get('type') == 15:
            return True
    return False


def validate_deliverable_email(email: str) -> str | None:
    domain = email_domain(email)
    if is_disposable_email_domain(domain):
        return 'Disposable email addresses are not allowed.'
    if not domain_has_mx_record(domain):
        return 'This email domain cannot receive mail.'
    return None
