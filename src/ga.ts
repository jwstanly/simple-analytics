import type { Event } from './index';

const GA4_EVENT_NAME = 'email_opened';

export async function forwardEventToGoogleAnalytics4({
  event,
  ga4_measurement_id,
  ga4_api_secret,
}: {
  event: Event;
  ga4_measurement_id: string;
  ga4_api_secret: string;
}) {
  await fetch(
    `https://www.google-analytics.com/mp/collect?measurement_id=${ga4_measurement_id}&api_secret=${ga4_api_secret}`,
    {
      method: 'POST',
      body: JSON.stringify({
        client_id: event.ipAddress,
        events: [
          {
            name: GA4_EVENT_NAME,
            params: event,
          },
        ],
      }),
    },
  );
}
