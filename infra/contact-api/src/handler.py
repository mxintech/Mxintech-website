import hashlib
import hmac
import html
import json
import os
import re
import secrets
import urllib.error
import urllib.parse
import urllib.request
import uuid
from datetime import datetime, timedelta, timezone

import boto3
from botocore.exceptions import ClientError

from contact_events import is_opted_out, log_api_route, log_contact_event
from email_deliverability import validate_deliverable_email
from email_templates import (
    build_confirmation_email_html,
    build_confirmation_email_text,
    build_notification_email_html,
    build_notification_email_text,
    build_otp_email_html,
    build_otp_email_text,
    build_submission_summary_html,
    build_submission_summary_text,
)

dynamodb = boto3.resource('dynamodb')
ses = boto3.client('ses')

ALLOWED_ORIGIN = os.environ.get('ALLOWED_ORIGIN', 'https://mxintech.org')
ORIGIN_VERIFY_SECRET = os.environ.get('ORIGIN_VERIFY_SECRET', '')
TURNSTILE_SECRET_KEY = os.environ.get('TURNSTILE_SECRET_KEY', '')
TABLE_NAME = os.environ['TABLE_NAME']
TOKENS_TABLE_NAME = os.environ['TOKENS_TABLE_NAME']
SES_IDENTITY_ARN = os.environ.get('SES_IDENTITY_ARN', '')
SES_SENDER_EMAIL = os.environ.get('SES_SENDER_EMAIL', 'noreply@mxintech.org')
NOTIFICATION_EMAIL = os.environ.get('NOTIFICATION_EMAIL', '')
SES_CONFIGURATION_SET = os.environ.get('SES_CONFIGURATION_SET', '')
REQUESTED_WITH = os.environ.get('REQUESTED_WITH_HEADER', 'MxintechWebsite')
FRONTEND_CLOUDFRONT_DOMAIN = os.environ.get('FRONTEND_CLOUDFRONT_DOMAIN', '')

VERIFY_TOKEN_TTL_MINUTES = int(os.environ.get('VERIFY_TOKEN_TTL_MINUTES', '15'))
REQUEST_RATE_LIMIT_SECONDS = int(os.environ.get('REQUEST_RATE_LIMIT_SECONDS', '60'))
IP_RATE_LIMIT_WINDOW_SECONDS = int(os.environ.get('IP_RATE_LIMIT_WINDOW_SECONDS', '3600'))
MAX_VERIFY_ATTEMPTS = int(os.environ.get('MAX_VERIFY_ATTEMPTS', '5'))
MAX_SUBMISSIONS_PER_EMAIL_PER_DAY = int(os.environ.get('MAX_SUBMISSIONS_PER_EMAIL_PER_DAY', '3'))
MAX_OTP_REQUESTS_PER_EMAIL_PER_DAY = int(os.environ.get('MAX_OTP_REQUESTS_PER_EMAIL_PER_DAY', '5'))
SES_DAILY_SEND_LIMIT = int(os.environ.get('SES_DAILY_SEND_LIMIT', '200'))

IP_RATE_LIMITS = {
    'REQUEST': int(os.environ.get('IP_LIMIT_REQUEST', '5')),
    'VERIFY': int(os.environ.get('IP_LIMIT_VERIFY', '15')),
}

CONTACT_TYPES = frozenset({'member', 'leader', 'speaker', 'business'})
TYPE_NAMES = {
    'member': 'Miembro',
    'leader': 'Líder',
    'speaker': 'Speaker',
    'business': 'Patrocinador',
}

NAME_PATTERN = re.compile(r"^[\w\s'.À-ÿ\u00f1\u00d1-]{2,100}$", re.UNICODE)
EMAIL_PATTERN = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]{2,254}$")
PHONE_PATTERN = re.compile(r"^\+?[\d\s().-]{7,20}$")
OTP_PATTERN = re.compile(r'^\d{6}$')
CONTROL_CHARS = re.compile(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]')
SCRIPT_PATTERN = re.compile(r'<\s*/?\s*script|javascript:|on\w+\s*=', re.IGNORECASE)

MAX_NAME = 100
MAX_EMAIL = 254
MAX_PHONE = 20
MAX_TALK_TITLE = 200
MAX_MESSAGE = 2000


def cors_headers():
    return {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
        'Access-Control-Allow-Headers': 'Content-Type,X-Requested-With',
        'Access-Control-Allow-Methods': 'POST,OPTIONS',
    }


def response(status_code, payload):
    return {
        'statusCode': status_code,
        'headers': cors_headers(),
        'body': json.dumps(payload, ensure_ascii=False),
    }


def get_header(event, name):
    headers = event.get('headers') or {}
    for key, value in headers.items():
        if key.lower() == name.lower():
            return value or ''
    return ''


def get_source_ip(event):
    identity = event.get('requestContext', {}).get('identity', {})
    return identity.get('sourceIp') or 'unknown'


def normalize_path(event):
    path = event.get('path') or event.get('rawPath') or ''
    return path.rstrip('/') or '/'


def ensure_request_origin(event):
    if ORIGIN_VERIFY_SECRET:
        provided = get_header(event, 'X-Origin-Verify')
        if not provided or provided != ORIGIN_VERIFY_SECRET:
            return response(403, {'message': 'Forbidden'})

    method = event.get('httpMethod', 'GET').upper()
    if method in {'POST', 'PUT', 'PATCH', 'DELETE'}:
        origin = get_header(event, 'Origin')
        if origin != ALLOWED_ORIGIN:
            return response(403, {'message': 'Origin not allowed'})

        requested_with = get_header(event, 'X-Requested-With')
        if requested_with != REQUESTED_WITH:
            return response(403, {'message': 'Invalid request'})

        if FRONTEND_CLOUDFRONT_DOMAIN:
            frontend_origin = get_header(event, 'X-Mxintech-Origin')
            if frontend_origin and frontend_origin != FRONTEND_CLOUDFRONT_DOMAIN:
                return response(403, {'message': 'Invalid frontend origin'})

    return None


def verify_turnstile_token(token, remote_ip=None):
    if not TURNSTILE_SECRET_KEY:
        return True
    if not token or not isinstance(token, str) or len(token) > 2048:
        return False

    payload = urllib.parse.urlencode({
        'secret': TURNSTILE_SECRET_KEY,
        'response': token,
        **({'remoteip': remote_ip} if remote_ip else {}),
    }).encode('utf-8')

    request = urllib.request.Request(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        data=payload,
        method='POST',
        headers={'Content-Type': 'application/x-www-form-urlencoded'},
    )

    try:
        with urllib.request.urlopen(request, timeout=5) as http_response:
            body = json.loads(http_response.read().decode('utf-8'))
            return bool(body.get('success'))
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError):
        return False


def hash_token(token):
    return hashlib.sha256(token.encode('utf-8')).hexdigest()


def to_int(value, default=0):
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def tokens_table():
    return dynamodb.Table(TOKENS_TABLE_NAME)


def check_and_set_rate_limit(email, scope='REQUEST'):
    now_ts = int(datetime.now(timezone.utc).timestamp())
    expires_at = now_ts + REQUEST_RATE_LIMIT_SECONDS
    try:
        tokens_table().put_item(
            Item={
                'pk': f'RATELIMIT#{email}',
                'sk': scope,
                'expiresAt': expires_at,
            },
            ConditionExpression='attribute_not_exists(pk) OR expiresAt < :now',
            ExpressionAttributeValues={':now': now_ts},
        )
        return False
    except ClientError as error:
        if error.response['Error']['Code'] == 'ConditionalCheckFailedException':
            return True
        raise


def check_ip_rate_limit(ip, scope):
    max_requests = IP_RATE_LIMITS.get(scope)
    if not max_requests:
        return False

    now = datetime.now(timezone.utc)
    window_bucket = int(now.timestamp()) // IP_RATE_LIMIT_WINDOW_SECONDS
    expires_at = (window_bucket + 2) * IP_RATE_LIMIT_WINDOW_SECONDS
    try:
        result = tokens_table().update_item(
            Key={'pk': f'RATELIMIT#IP#{ip}#{window_bucket}', 'sk': scope},
            UpdateExpression='ADD requestCount :one SET expiresAt = if_not_exists(expiresAt, :exp)',
            ExpressionAttributeValues={':one': 1, ':exp': expires_at},
            ReturnValues='UPDATED_NEW',
        )
        return to_int(result['Attributes'].get('requestCount', 0)) > max_requests
    except ClientError:
        return False


def check_global_email_cap():
    today = datetime.now(timezone.utc).strftime('%Y%m%d')
    expires_at = int(datetime.now(timezone.utc).timestamp()) + 2 * 86400
    try:
        result = tokens_table().update_item(
            Key={'pk': f'EMAILCAP#{today}', 'sk': 'GLOBAL'},
            UpdateExpression='ADD sendCount :one SET expiresAt = if_not_exists(expiresAt, :exp)',
            ExpressionAttributeValues={':one': 1, ':exp': expires_at},
            ReturnValues='UPDATED_NEW',
        )
        return to_int(result['Attributes'].get('sendCount', 0)) > SES_DAILY_SEND_LIMIT
    except ClientError:
        return False


def reserve_daily_submission(email):
    today = datetime.now(timezone.utc).strftime('%Y%m%d')
    expires_at = int(datetime.now(timezone.utc).timestamp()) + 2 * 86400
    try:
        tokens_table().update_item(
            Key={'pk': f'SUBMISSIONS#{email}', 'sk': today},
            UpdateExpression='ADD submissionCount :one SET expiresAt = if_not_exists(expiresAt, :exp)',
            ConditionExpression='attribute_not_exists(submissionCount) OR submissionCount < :max',
            ExpressionAttributeValues={
                ':one': 1,
                ':exp': expires_at,
                ':max': MAX_SUBMISSIONS_PER_EMAIL_PER_DAY,
            },
        )
        return False
    except ClientError as error:
        if error.response['Error']['Code'] == 'ConditionalCheckFailedException':
            return True
        raise


def reserve_daily_otp_request(email):
    today = datetime.now(timezone.utc).strftime('%Y%m%d')
    expires_at = int(datetime.now(timezone.utc).timestamp()) + 2 * 86400
    try:
        tokens_table().update_item(
            Key={'pk': f'OTPREQ#{email}', 'sk': today},
            UpdateExpression='ADD requestCount :one SET expiresAt = if_not_exists(expiresAt, :exp)',
            ConditionExpression='attribute_not_exists(requestCount) OR requestCount < :max',
            ExpressionAttributeValues={
                ':one': 1,
                ':exp': expires_at,
                ':max': MAX_OTP_REQUESTS_PER_EMAIL_PER_DAY,
            },
        )
        return False
    except ClientError as error:
        if error.response['Error']['Code'] == 'ConditionalCheckFailedException':
            return True
        raise


def deliverability_message(error_code):
    if error_code == 'Disposable email addresses are not allowed.':
        return 'No se permiten correos temporales o desechables.'
    if error_code == 'This email domain cannot receive mail.':
        return 'El dominio de correo no puede recibir mensajes.'
    return 'El correo electrónico no puede recibir mensajes.'


def sanitize_text(value, field_name, max_length, pattern=None):
    if not isinstance(value, str):
        raise ValueError(f'{field_name} is invalid')

    cleaned = CONTROL_CHARS.sub('', value.strip())
    if not cleaned:
        raise ValueError(f'{field_name} is required')
    if len(cleaned) > max_length:
        raise ValueError(f'{field_name} is too long')
    if SCRIPT_PATTERN.search(cleaned):
        raise ValueError(f'{field_name} contains disallowed content')
    if pattern and not pattern.match(cleaned):
        raise ValueError(f'{field_name} has an invalid format')

    return cleaned


def sanitize_optional_text(value, field_name, max_length, pattern=None):
    if not isinstance(value, str):
        raise ValueError(f'{field_name} is invalid')

    cleaned = CONTROL_CHARS.sub('', value.strip())
    if not cleaned:
        return ''
    if len(cleaned) > max_length:
        raise ValueError(f'{field_name} is too long')
    if SCRIPT_PATTERN.search(cleaned):
        raise ValueError(f'{field_name} contains disallowed content')
    if pattern and not pattern.match(cleaned):
        raise ValueError(f'{field_name} has an invalid format')

    return cleaned


def validate_payload(body):
    contact_type = body.get('contactType', '')
    if contact_type not in CONTACT_TYPES:
        raise ValueError('Invalid contact type')

    name = sanitize_text(body.get('name', ''), 'name', MAX_NAME, NAME_PATTERN)
    email = sanitize_text(body.get('email', ''), 'email', MAX_EMAIL, EMAIL_PATTERN).lower()
    mobile = sanitize_optional_text(body.get('mobile', ''), 'mobile', MAX_PHONE, PHONE_PATTERN)
    talk_title = sanitize_optional_text(body.get('talkTitle', ''), 'talkTitle', MAX_TALK_TITLE)
    if contact_type == 'speaker' and not talk_title:
        raise ValueError('talkTitle is required')
    message = sanitize_text(body.get('message', ''), 'message', MAX_MESSAGE)

    turnstile_token = body.get('turnstileToken', '')
    if turnstile_token is not None and not isinstance(turnstile_token, str):
        raise ValueError('Invalid verification token')

    return {
        'contactType': contact_type,
        'name': name,
        'email': email,
        'mobile': mobile,
        'talkTitle': talk_title,
        'message': message,
        'turnstileToken': turnstile_token.strip(),
    }


def send_email_safe(source, destination, subject, text_body, html_body=None, reply_to=None):
    if not SES_IDENTITY_ARN:
        print('SES identity not configured; skipping email send')
        return {'suppressed': True, 'reason': 'ses_not_configured'}

    if is_opted_out(destination):
        log_contact_event('email_send_suppressed', email=destination, reason='opted_out')
        return {'suppressed': True, 'reason': 'opted_out'}

    body = {'Text': {'Data': text_body, 'Charset': 'UTF-8'}}
    if html_body:
        body['Html'] = {'Data': html_body, 'Charset': 'UTF-8'}

    message = {
        'Source': source,
        'Destination': {'ToAddresses': [destination]},
        'Message': {
            'Subject': {'Data': subject, 'Charset': 'UTF-8'},
            'Body': body,
        },
    }
    if reply_to:
        message['ReplyToAddresses'] = [reply_to]
    if SES_CONFIGURATION_SET:
        message['ConfigurationSetName'] = SES_CONFIGURATION_SET

    ses.send_email(**message)
    return {'sent': True}


def site_origin():
    return ALLOWED_ORIGIN.rstrip('/')


def send_verification_code_email(email, code):
    origin = site_origin()
    send_email_safe(
        SES_SENDER_EMAIL,
        email,
        'México in Tech: código de verificación',
        build_otp_email_text(code, VERIFY_TOKEN_TTL_MINUTES),
        html_body=build_otp_email_html(origin, code, VERIFY_TOKEN_TTL_MINUTES),
    )


def persist_submission(payload, source_ip):
    submission_id = str(uuid.uuid4())
    timestamp = datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')
    type_name = TYPE_NAMES[payload['contactType']]

    table = dynamodb.Table(TABLE_NAME)
    table.put_item(
        Item={
            'id': submission_id,
            'status': 'verified',
            'sourceIp': source_ip,
            'timestamp': timestamp,
            **payload,
        }
    )

    safe_name = html.escape(payload['name'])

    if SES_IDENTITY_ARN:
        try:
            summary_lines = build_submission_summary_text(payload, type_name)
            send_email_safe(
                SES_SENDER_EMAIL,
                payload['email'],
                f'Confirmación: solicitud recibida - {type_name}',
                build_confirmation_email_text(payload['name'], type_name, summary_lines),
                html_body=build_confirmation_email_html(
                    site_origin(),
                    safe_name,
                    type_name,
                    build_submission_summary_html(payload, type_name),
                ),
            )

            if NOTIFICATION_EMAIL:
                send_email_safe(
                    SES_SENDER_EMAIL,
                    NOTIFICATION_EMAIL,
                    f'Nueva solicitud de contacto ({type_name})',
                    build_notification_email_text(
                        type_name, submission_id, payload, source_ip, timestamp,
                    ),
                    html_body=build_notification_email_html(
                        site_origin(),
                        type_name,
                        submission_id,
                        payload,
                        source_ip,
                        timestamp,
                        payload['email'],
                    ),
                    reply_to=payload['email'],
                )
        except ClientError as error:
            print(f'SES error: {error}')

    return submission_id


def handle_contact_request(event):
    source_ip = get_source_ip(event)
    log_api_route('POST', '/contact/request')

    if check_ip_rate_limit(source_ip, 'REQUEST'):
        log_contact_event('otp_request_rate_limited', ip=source_ip, scope='ip')
        return response(429, {'message': 'Demasiadas solicitudes. Intenta de nuevo más tarde.'})

    try:
        raw_body = event.get('body') or '{}'
        body = json.loads(raw_body) if isinstance(raw_body, str) else raw_body
        if not isinstance(body, dict):
            raise ValueError('Invalid request body')

        payload = validate_payload(body)

        if not verify_turnstile_token(payload.pop('turnstileToken', ''), source_ip):
            log_contact_event('turnstile_failed', ip=source_ip)
            return response(400, {'message': 'Verificación anti-bots fallida. Recarga e intenta de nuevo.'})

        email = payload['email']

        if is_opted_out(email):
            log_contact_event('otp_request_blocked', email=email, ip=source_ip, reason='opted_out')
            return response(400, {'message': deliverability_message('This email domain cannot receive mail.')})

        deliverability_error = validate_deliverable_email(email)
        if deliverability_error:
            log_contact_event('deliverability_blocked', email=email, ip=source_ip, reason=deliverability_error)
            return response(400, {'message': deliverability_message(deliverability_error)})

        if check_and_set_rate_limit(email, 'REQUEST'):
            log_contact_event('otp_request_rate_limited', email=email, ip=source_ip, scope='email')
            return response(429, {
                'message': 'Ya enviamos un código a este correo. Espera un minuto antes de solicitar otro.',
            })

        if reserve_daily_otp_request(email):
            log_contact_event('otp_daily_limit_exceeded', email=email, ip=source_ip)
            return response(429, {
                'message': 'Has alcanzado el límite diario de códigos para este correo. Intenta mañana.',
            })

        if check_global_email_cap():
            log_contact_event('email_cap_exhausted', ip=source_ip)
            return response(503, {'message': 'El envío de correos está temporalmente limitado. Intenta más tarde.'})

        token = f'{secrets.randbelow(1000000):06d}'
        now = datetime.now(timezone.utc)
        expires_at = int((now + timedelta(minutes=VERIFY_TOKEN_TTL_MINUTES)).timestamp())

        tokens_table().put_item(
            Item={
                'pk': f'EMAIL#{email}',
                'sk': 'PENDING',
                'tokenHash': hash_token(token),
                'expiresAt': expires_at,
                'createdAt': now.isoformat().replace('+00:00', 'Z'),
                'attemptCount': 0,
                'payload': payload,
                'sourceIp': source_ip,
            }
        )

        send_verification_code_email(email, token)
        log_contact_event('otp_request_sent', email=email, ip=source_ip)

        return response(202, {
            'success': True,
            'message': 'Verification code sent',
            'email': email,
            'expiresInMinutes': VERIFY_TOKEN_TTL_MINUTES,
        })

    except ValueError as error:
        return response(400, {'message': str(error)})
    except json.JSONDecodeError:
        return response(400, {'message': 'Invalid JSON body'})
    except ClientError as error:
        print(f'DynamoDB error during request: {error}')
        return response(500, {'message': 'An error occurred processing your request.'})


def handle_contact_verify(event):
    source_ip = get_source_ip(event)
    log_api_route('POST', '/contact/verify')
    neutral_invalid = response(400, {'message': 'El código de verificación es inválido o expiró'})

    if check_ip_rate_limit(source_ip, 'VERIFY'):
        log_contact_event('verify_rate_limited', ip=source_ip)
        return response(429, {'message': 'Demasiados intentos. Intenta de nuevo más tarde.'})

    try:
        raw_body = event.get('body') or '{}'
        body = json.loads(raw_body) if isinstance(raw_body, str) else raw_body
        if not isinstance(body, dict):
            raise ValueError('Invalid request body')

        email = sanitize_text(body.get('email', ''), 'email', MAX_EMAIL, EMAIL_PATTERN).lower()
        token = str(body.get('token', '')).strip()
        contact_type = body.get('contactType', '')

        if contact_type not in CONTACT_TYPES:
            return response(400, {'message': 'Invalid contact type'})
        if not OTP_PATTERN.fullmatch(token):
            return response(400, {'message': 'El código debe tener 6 dígitos'})

        lookup = tokens_table().get_item(Key={'pk': f'EMAIL#{email}', 'sk': 'PENDING'})
        item = lookup.get('Item')
        if not item:
            return neutral_invalid

        now_ts = int(datetime.now(timezone.utc).timestamp())
        if int(item.get('expiresAt', 0)) < now_ts:
            return neutral_invalid

        attempts = to_int(item.get('attemptCount', 0))
        if attempts >= MAX_VERIFY_ATTEMPTS:
            tokens_table().delete_item(Key={'pk': f'EMAIL#{email}', 'sk': 'PENDING'})
            return response(429, {'message': 'Demasiados intentos fallidos. Solicita un nuevo código.'})

        if not hmac.compare_digest(str(item.get('tokenHash') or ''), hash_token(token)):
            try:
                tokens_table().update_item(
                    Key={'pk': f'EMAIL#{email}', 'sk': 'PENDING'},
                    UpdateExpression='SET attemptCount = attemptCount + :one',
                    ConditionExpression='attemptCount < :max',
                    ExpressionAttributeValues={':one': 1, ':max': MAX_VERIFY_ATTEMPTS},
                )
            except ClientError as error:
                if error.response['Error']['Code'] == 'ConditionalCheckFailedException':
                    tokens_table().delete_item(Key={'pk': f'EMAIL#{email}', 'sk': 'PENDING'})
                    return response(429, {'message': 'Demasiados intentos fallidos. Solicita un nuevo código.'})
                raise
            log_contact_event('verify_failed', ip=source_ip)
            return neutral_invalid

        payload = item.get('payload') or {}
        if payload.get('contactType') != contact_type:
            return neutral_invalid
        if payload.get('email') != email:
            return neutral_invalid

        submission_ip = item.get('sourceIp') or source_ip

        if reserve_daily_submission(email):
            tokens_table().delete_item(Key={'pk': f'EMAIL#{email}', 'sk': 'PENDING'})
            return response(429, {
                'message': 'Has alcanzado el límite diario de envíos para este correo. Intenta mañana.',
            })

        submission_id = persist_submission(payload, submission_ip)
        tokens_table().delete_item(Key={'pk': f'EMAIL#{email}', 'sk': 'PENDING'})
        log_contact_event('verify_succeeded', email=email, ip=source_ip, contactType=contact_type)

        return response(200, {
            'success': True,
            'message': 'Form submitted successfully',
            'id': submission_id,
        })

    except ValueError as error:
        return response(400, {'message': str(error)})
    except json.JSONDecodeError:
        return response(400, {'message': 'Invalid JSON body'})
    except ClientError as error:
        print(f'DynamoDB error during verify: {error}')
        return response(500, {'message': 'An error occurred processing your request.'})


def lambda_handler(event, context):
    if event.get('httpMethod') == 'OPTIONS':
        return response(200, {'ok': True})

    blocked = ensure_request_origin(event)
    if blocked:
        return blocked

    path = normalize_path(event)

    if path.endswith('/contact/request'):
        return handle_contact_request(event)
    if path.endswith('/contact/verify'):
        return handle_contact_verify(event)
    if path.endswith('/contact'):
        return response(400, {
            'message': 'Debes verificar tu correo antes de enviar. Solicita un código e ingrésalo para confirmar.',
        })

    return response(404, {'message': 'Not found'})
