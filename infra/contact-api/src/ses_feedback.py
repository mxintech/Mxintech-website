"""EventBridge handler for SES bounce/complaint/reject events.

SES publishes event-publishing notifications to the default EventBridge bus;
the SES payload arrives in `event['detail']`.
"""

from contact_events import process_ses_feedback_notification


def handler(event, context):
    detail = event.get('detail')
    if isinstance(detail, dict):
        process_ses_feedback_notification(detail)
    return {'statusCode': 200}
