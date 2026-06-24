"""Structured audit logs, opt-out suppression, and SES feedback handling."""

from __future__ import annotations

import json
import os
import re
from datetime import datetime, timezone

import boto3

EMAIL_PATTERN = re.compile(r'^[^\s@]+@[^\s@]+\.[^\s@]{2,254}$')

TOKENS_TABLE_NAME = os.environ['TOKENS_TABLE_NAME']
dynamodb = boto3.resource('dynamodb')


def tokens_table():
    return dynamodb.Table(TOKENS_TABLE_NAME)


def log_contact_event(action, **fields):
    record = {
        'contactEvent': action,
        'at': datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z'),
    }
    record.update(fields)
    print(json.dumps(record, ensure_ascii=False))


def log_api_route(method, path):
    print(json.dumps({
        'apiRoute': f'{method.upper()} {path}',
        'at': datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z'),
    }))


def is_opted_out(email):
    lookup = tokens_table().get_item(Key={'pk': f'OPTOUT#{email.lower()}', 'sk': 'OPTOUT'})
    return 'Item' in lookup


def set_opted_out(email):
    tokens_table().put_item(Item={
        'pk': f'OPTOUT#{email.lower()}',
        'sk': 'OPTOUT',
        'optedOutAt': datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z'),
    })


def _valid_ses_feedback_addresses(entries):
    addresses = []
    for entry in entries or []:
        address = (entry.get('emailAddress') or '').strip().lower()
        if EMAIL_PATTERN.match(address):
            addresses.append(address)
    return addresses


def process_ses_feedback_notification(payload):
    notification_type = (payload.get('notificationType') or '').lower()
    recipients = []

    if notification_type == 'bounce':
        bounce = payload.get('bounce') or {}
        bounce_type = (bounce.get('bounceType') or '').lower()
        addresses = _valid_ses_feedback_addresses(bounce.get('bouncedRecipients'))
        if bounce_type == 'permanent':
            recipients = addresses
            if addresses:
                log_contact_event('ses_bounce_permanent', count=len(addresses))
        elif bounce_type == 'transient':
            if addresses:
                log_contact_event('ses_bounce_transient', count=len(addresses))
            return
        else:
            return
    elif notification_type == 'complaint':
        recipients = _valid_ses_feedback_addresses(
            (payload.get('complaint') or {}).get('complainedRecipients'),
        )
        if recipients:
            log_contact_event('ses_complaint', count=len(recipients))
    elif notification_type == 'reject':
        log_contact_event('ses_reject', count=1)
        return
    else:
        return

    for address in recipients:
        if is_opted_out(address):
            continue
        set_opted_out(address)
        log_contact_event('email_suppressed', email=address, notificationType=notification_type)
