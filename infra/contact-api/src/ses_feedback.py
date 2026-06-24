"""SNS subscriber for SES bounce/complaint notifications."""

import json

from contact_events import process_ses_feedback_notification


def handler(event, context):
    for record in event.get('Records', []):
        sns_message = record.get('Sns', {}).get('Message')
        if not sns_message:
            continue
        try:
            payload = json.loads(sns_message)
        except json.JSONDecodeError:
            continue
        process_ses_feedback_notification(payload)
    return {'statusCode': 200}
