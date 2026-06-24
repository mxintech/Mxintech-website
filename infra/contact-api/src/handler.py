import html
import json
import os
import re
import urllib.error
import urllib.parse
import urllib.request
import uuid
from datetime import datetime, timezone

import boto3
from botocore.exceptions import ClientError

dynamodb = boto3.resource('dynamodb')
ses = boto3.client('ses')

ALLOWED_ORIGIN = os.environ.get('ALLOWED_ORIGIN', 'https://mxintech.org')
ORIGIN_VERIFY_SECRET = os.environ.get('ORIGIN_VERIFY_SECRET', '')
TURNSTILE_SECRET_KEY = os.environ.get('TURNSTILE_SECRET_KEY', '')
TABLE_NAME = os.environ['TABLE_NAME']
SES_IDENTITY_ARN = os.environ.get('SES_IDENTITY_ARN', '')
SES_SENDER_EMAIL = os.environ.get('SES_SENDER_EMAIL', 'noreply@mxintech.org')
NOTIFICATION_EMAIL = os.environ.get('NOTIFICATION_EMAIL', '')
REQUESTED_WITH = os.environ.get('REQUESTED_WITH_HEADER', 'MxintechWebsite')
FRONTEND_CLOUDFRONT_DOMAIN = os.environ.get('FRONTEND_CLOUDFRONT_DOMAIN', '')

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


def send_email_safe(source, destination, subject, text_body):
    if not SES_IDENTITY_ARN:
        print('SES identity not configured; skipping email send')
        return

    ses.send_email(
        Source=source,
        Destination={'ToAddresses': [destination]},
        Message={
            'Subject': {'Data': subject, 'Charset': 'UTF-8'},
            'Body': {'Text': {'Data': text_body, 'Charset': 'UTF-8'}},
        },
    )


def lambda_handler(event, context):
    if event.get('httpMethod') == 'OPTIONS':
        return response(200, {'ok': True})

    blocked = ensure_request_origin(event)
    if blocked:
        return blocked

    try:
        raw_body = event.get('body') or '{}'
        body = json.loads(raw_body) if isinstance(raw_body, str) else raw_body
        if not isinstance(body, dict):
            raise ValueError('Invalid request body')

        payload = validate_payload(body)
        source_ip = get_source_ip(event)

        if not verify_turnstile_token(payload.pop('turnstileToken', ''), source_ip):
            return response(400, {'message': 'Verificación anti-bots fallida. Recarga e intenta de nuevo.'})

        submission_id = str(uuid.uuid4())
        timestamp = datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')
        type_name = TYPE_NAMES[payload['contactType']]

        table = dynamodb.Table(TABLE_NAME)
        table.put_item(
            Item={
                'id': submission_id,
                'status': 'new',
                'sourceIp': source_ip,
                'timestamp': timestamp,
                **payload,
            }
        )

        safe_name = html.escape(payload['name'])
        phone_display = payload['mobile'] or 'No proporcionado'
        talk_title_line = (
            f'- Charla propuesta: {payload["talkTitle"]}\n'
            if payload.get('talkTitle')
            else ''
        )
        talk_title_block = (
            f'Charla propuesta: {payload["talkTitle"]}\n'
            if payload.get('talkTitle')
            else ''
        )

        if SES_IDENTITY_ARN:
            try:
                send_email_safe(
                    SES_SENDER_EMAIL,
                    payload['email'],
                    f'Confirmación: solicitud recibida - {type_name}',
                    (
                        f'Hola {safe_name},\n\n'
                        f'Gracias por contactar a México in Tech. Recibimos tu solicitud como {type_name.lower()}.\n'
                        f'Nos pondremos en contacto contigo pronto.\n\n'
                        f'Resumen:\n'
                        f'- Tipo: {type_name}\n'
                        f'- Email: {payload["email"]}\n'
                        f'- Teléfono: {phone_display}\n'
                        f'{talk_title_line}\n'
                        f'Mensaje:\n{payload["message"]}\n\n'
                        f'Saludos,\nEl equipo de México in Tech'
                    ),
                )

                if NOTIFICATION_EMAIL:
                    send_email_safe(
                        SES_SENDER_EMAIL,
                        NOTIFICATION_EMAIL,
                        f'Nueva solicitud de contacto ({type_name})',
                        (
                            f'Nueva solicitud recibida.\n\n'
                            f'ID: {submission_id}\n'
                            f'Tipo: {type_name}\n'
                            f'Nombre: {payload["name"]}\n'
                            f'Email: {payload["email"]}\n'
                            f'Teléfono: {phone_display}\n'
                            f'{talk_title_block}'
                            f'IP: {source_ip}\n'
                            f'Fecha: {timestamp}\n\n'
                            f'Mensaje:\n{payload["message"]}'
                        ),
                    )
            except ClientError as error:
                print(f'SES error: {error}')

        return response(200, {
            'success': True,
            'message': 'Form submitted successfully',
            'id': submission_id,
        })

    except ValueError as error:
        return response(400, {'message': str(error)})
    except json.JSONDecodeError:
        return response(400, {'message': 'Invalid JSON body'})
    except Exception as error:
        print(f'Unhandled error: {error}')
        return response(500, {'message': 'An error occurred processing your request.'})
