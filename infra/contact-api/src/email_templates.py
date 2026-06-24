"""Branded HTML/text email layouts for México in Tech transactional mail.

Colors align with src/config/brand.js and docs/brand/README.md.
Logo is served from the public site at /assets/ajolote.png.
"""

import html

# Official México in Tech brand palette
BRAND = {
    'bg': '#f4f7fc',
    'surface': '#ffffff',
    'surface_alt': '#eef3fb',
    'text': '#314044',
    'heading': '#1B3F8B',
    'muted': '#5a6b72',
    'primary': '#1B3F8B',
    'accent': '#EF5980',
    'accent_soft': '#fde8ee',
    'cyan': '#11CFE7',
    'border': '#d6e0ef',
}


def brand_logo_url(site_origin):
    base = site_origin.rstrip('/')
    return f'{base}/assets/ajolote.png'


def brand_site_url(site_origin):
    return site_origin.rstrip('/')


def _paragraphs_html(paragraphs):
    parts = []
    for paragraph in paragraphs:
        parts.append(
            f"<p style=\"margin:0 0 16px;font-size:15px;color:{BRAND['text']};\">"
            f'{paragraph}</p>'
        )
    return ''.join(parts)


def _wrap_email_html(site_origin, heading, inner_rows_html):
    logo_url = brand_logo_url(site_origin)
    site_url = brand_site_url(site_origin)
    return (
        '<!DOCTYPE html>'
        '<html lang="es">'
        '<head>'
        '<meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width,initial-scale=1">'
        f'<title>{html.escape(heading)}</title>'
        '</head>'
        f"<body style=\"margin:0;padding:0;background-color:{BRAND['bg']};"
        f"font-family:'Segoe UI',Roboto,Arial,Helvetica,sans-serif;color:{BRAND['text']};"
        'line-height:1.5;-webkit-text-size-adjust:100%;\">'
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" '
        f"style=\"background-color:{BRAND['bg']};\">"
        '<tr><td align="center" style="padding:32px 16px;">'
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" '
        f"style=\"max-width:560px;background-color:{BRAND['surface']};"
        f"border:1px solid {BRAND['border']};border-radius:16px;"
        'overflow:hidden;box-shadow:0 8px 24px rgba(27,63,139,0.08);\">'
        f"<tr><td align=\"center\" style=\"padding:28px 32px 16px;"
        f"background:linear-gradient(180deg,{BRAND['surface_alt']} 0%,{BRAND['surface']} 100%);\">"
        f"<a href='{html.escape(site_url)}' style='text-decoration:none;'>"
        f"<img src='{html.escape(logo_url)}' alt='México in Tech' width='72' "
        "style='display:block;max-width:72px;height:auto;border:0;margin:0 auto 12px;' />"
        f"<p style=\"margin:0;font-size:13px;font-weight:700;letter-spacing:0.08em;"
        f"text-transform:uppercase;color:{BRAND['primary']};\">México in Tech</p>"
        '</a></td></tr>'
        f"<tr><td style=\"padding:4px 32px 0;\">"
        f"<h1 style=\"margin:0 0 16px;font-size:22px;font-weight:700;"
        f"color:{BRAND['heading']};letter-spacing:-0.02em;\">{html.escape(heading)}</h1>"
        '</td></tr>'
        f'{inner_rows_html}'
        f"<tr><td style=\"padding:8px 32px 28px;border-top:1px solid {BRAND['border']};\">"
        f"<p style=\"margin:0;font-size:13px;color:{BRAND['muted']};\">"
        'México in Tech · AWS User Group Tlaxcala · '
        f"<a href='{html.escape(site_url)}' style='color:{BRAND['accent']};'>mxintech.org</a>"
        '</p></td></tr>'
        '</table></td></tr></table></body></html>'
    )


def build_otp_email_html(site_origin, code, expiry_minutes):
    inner = (
        f"<tr><td style=\"padding:0 32px;\">"
        f"<p style=\"margin:0 0 16px;font-size:15px;color:{BRAND['text']};\">"
        'Usa este código para confirmar tu correo y enviar el formulario de contacto en '
        f"<a href='{html.escape(brand_site_url(site_origin))}' style='color:{BRAND['primary']};'>"
        f'mxintech.org</a>.</p></td></tr>'
        f"<tr><td style=\"padding:0 32px 8px;\">"
        f"<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\">"
        f"<tr><td align=\"center\" style=\"padding:20px 24px;"
        f"background-color:{BRAND['accent_soft']};border:2px solid {BRAND['accent']};"
        f"border-radius:12px;\">"
        f"<p style=\"margin:0 0 8px;font-size:12px;font-weight:700;"
        f"letter-spacing:0.08em;text-transform:uppercase;color:{BRAND['accent']};\">"
        'Tu código</p>'
        f"<p style=\"margin:0;font-size:36px;font-weight:700;letter-spacing:0.28em;"
        f"font-family:'Courier New',Courier,monospace;color:{BRAND['heading']};\">"
        f'{html.escape(code)}</p>'
        '</td></tr></table></td></tr>'
        f"<tr><td style=\"padding:8px 32px 0;\">"
        f"<p style=\"margin:0 0 16px;font-size:14px;color:{BRAND['muted']};\">"
        f'Este código expira en <strong style="color:{BRAND["text"]};">{expiry_minutes} minutos</strong>.'
        '</p></td></tr>'
        f"<tr><td style=\"padding:0 32px 8px;\">"
        f"<p style=\"margin:0;font-size:14px;color:{BRAND['muted']};\">"
        'Si tú no solicitaste enviar un formulario, puedes ignorar este correo.'
        '</p></td></tr>'
    )
    return _wrap_email_html(site_origin, 'Código de verificación', inner)


def build_otp_email_text(code, expiry_minutes):
    return (
        'México in Tech — Código de verificación\n\n'
        'Usa este código para confirmar tu correo y enviar el formulario de contacto:\n\n'
        f'  {code}\n\n'
        f'Este código expira en {expiry_minutes} minutos.\n'
        'Si tú no solicitaste enviar un formulario en mxintech.org, ignora este correo.\n\n'
        'Saludos,\nEl equipo de México in Tech'
    )


def build_confirmation_email_html(site_origin, safe_name, type_name, summary_rows_html):
    inner = (
        f"<tr><td style=\"padding:0 32px;\">"
        f"<p style=\"margin:0 0 16px;font-size:15px;color:{BRAND['text']};\">"
        f'Hola <strong>{safe_name}</strong>,</p>'
        f"<p style=\"margin:0 0 16px;font-size:15px;color:{BRAND['text']};\">"
        f'Gracias por contactar a México in Tech. Recibimos tu solicitud como '
        f'<strong style="color:{BRAND["accent"]};">{html.escape(type_name.lower())}</strong>. '
        f'Nos pondremos en contacto contigo pronto.</p></td></tr>'
        f"<tr><td style=\"padding:0 32px 8px;\">"
        f"<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" "
        f"style=\"background-color:{BRAND['surface_alt']};border:1px solid {BRAND['border']};"
        f"border-radius:12px;\">"
        f"<tr><td style=\"padding:16px 20px;\">"
        f"<p style=\"margin:0 0 12px;font-size:13px;font-weight:700;"
        f"letter-spacing:0.06em;text-transform:uppercase;color:{BRAND['primary']};\">"
        f'Resumen</p>'
        f'{summary_rows_html}'
        '</td></tr></table></td></tr>'
    )
    return _wrap_email_html(site_origin, 'Solicitud recibida', inner)


def build_confirmation_email_text(safe_name, type_name, summary_lines):
    lines = [
        f'Hola {safe_name},',
        '',
        f'Gracias por contactar a México in Tech. Recibimos tu solicitud como {type_name.lower()}.',
        'Nos pondremos en contacto contigo pronto.',
        '',
        'Resumen:',
        *summary_lines,
        '',
        'Saludos,',
        'El equipo de México in Tech',
    ]
    return '\n'.join(lines)


def _summary_row_html(label, value):
    return (
        f"<p style=\"margin:0 0 8px;font-size:14px;color:{BRAND['text']};\">"
        f"<span style=\"color:{BRAND['muted']};\">{html.escape(label)}:</span> "
        f'{value}</p>'
    )


def build_submission_summary_html(payload, type_name):
    phone_display = payload['mobile'] or 'No proporcionado'
    rows = [
        _summary_row_html('Tipo', html.escape(type_name)),
        _summary_row_html('Email', html.escape(payload['email'])),
        _summary_row_html('Teléfono', html.escape(phone_display)),
    ]
    if payload.get('talkTitle'):
        rows.append(_summary_row_html('Charla propuesta', html.escape(payload['talkTitle'])))
    rows.append(
        f"<p style=\"margin:12px 0 0;font-size:14px;color:{BRAND['text']};\">"
        f"<span style=\"color:{BRAND['muted']};\">Mensaje:</span><br>"
        f"{html.escape(payload['message']).replace(chr(10), '<br>')}</p>"
    )
    return ''.join(rows)


def build_submission_summary_text(payload, type_name):
    phone_display = payload['mobile'] or 'No proporcionado'
    lines = [
        f'- Tipo: {type_name}',
        f'- Email: {payload["email"]}',
        f'- Teléfono: {phone_display}',
    ]
    if payload.get('talkTitle'):
        lines.append(f'- Charla propuesta: {payload["talkTitle"]}')
    lines.append('')
    lines.append('Mensaje:')
    lines.append(payload['message'])
    return lines


def build_notification_email_html(site_origin, type_name, submission_id, payload, source_ip, timestamp, safe_reply_email):
    phone_display = payload['mobile'] or 'No proporcionado'
    summary = build_submission_summary_html(payload, type_name)
    mailto = f'mailto:{html.escape(safe_reply_email)}?subject={html.escape("Re: tu solicitud en México in Tech")}'
    inner = (
        f"<tr><td style=\"padding:0 32px;\">"
        f"<p style=\"margin:0 0 16px;font-size:15px;color:{BRAND['text']};\">"
        f'Nueva solicitud de contacto como <strong style="color:{BRAND["accent"]};">'
        f'{html.escape(type_name)}</strong>.</p></td></tr>'
        f"<tr><td style=\"padding:0 32px 8px;\">"
        f"<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" "
        f"style=\"background-color:{BRAND['surface_alt']};border:1px solid {BRAND['border']};"
        f"border-radius:12px;\">"
        f"<tr><td style=\"padding:16px 20px;\">"
        f"<p style=\"margin:0 0 8px;font-size:14px;color:{BRAND['text']};\">"
        f"<span style=\"color:{BRAND['muted']};\">ID:</span> {html.escape(submission_id)}</p>"
        f"<p style=\"margin:0 0 8px;font-size:14px;color:{BRAND['text']};\">"
        f"<span style=\"color:{BRAND['muted']};\">Nombre:</span> {html.escape(payload['name'])}</p>"
        f"<p style=\"margin:0 0 8px;font-size:14px;color:{BRAND['text']};\">"
        f"<span style=\"color:{BRAND['muted']};\">Email:</span> "
        f"<a href='{mailto}' style='color:{BRAND['primary']};'>{html.escape(payload['email'])}</a></p>"
        f"<p style=\"margin:0 0 8px;font-size:14px;color:{BRAND['text']};\">"
        f"<span style=\"color:{BRAND['muted']};\">Teléfono:</span> {html.escape(phone_display)}</p>"
        f"<p style=\"margin:0 0 8px;font-size:14px;color:{BRAND['text']};\">"
        f"<span style=\"color:{BRAND['muted']};\">IP:</span> {html.escape(source_ip)}</p>"
        f"<p style=\"margin:0 0 12px;font-size:14px;color:{BRAND['text']};\">"
        f"<span style=\"color:{BRAND['muted']};\">Fecha:</span> {html.escape(timestamp)}</p>"
        f'{summary}'
        '</td></tr></table></td></tr>'
        f"<tr><td style=\"padding:16px 32px 8px;\">"
        f"<a href='{mailto}' style=\"display:inline-block;padding:12px 22px;"
        f"background-color:{BRAND['primary']};color:#ffffff;text-decoration:none;"
        f"border-radius:999px;font-size:14px;font-weight:700;\">"
        'Responder al solicitante</a></td></tr>'
    )
    return _wrap_email_html(site_origin, f'Nueva solicitud ({type_name})', inner)


def build_notification_email_text(type_name, submission_id, payload, source_ip, timestamp):
    phone_display = payload['mobile'] or 'No proporcionado'
    talk_block = f'Charla propuesta: {payload["talkTitle"]}\n' if payload.get('talkTitle') else ''
    return (
        f'Nueva solicitud de contacto ({type_name})\n\n'
        f'ID: {submission_id}\n'
        f'Tipo: {type_name}\n'
        f'Nombre: {payload["name"]}\n'
        f'Email: {payload["email"]}\n'
        f'Teléfono: {phone_display}\n'
        f'{talk_block}'
        f'IP: {source_ip}\n'
        f'Fecha: {timestamp}\n\n'
        f'Mensaje:\n{payload["message"]}\n\n'
        f'Responde directamente a: {payload["email"]}'
    )
