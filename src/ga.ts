import type { Event } from './index';

export async function forwardEventToGoogleAnalytics4({
  event,
  ga4MeasurementId,
  ga4ApiSecret,
  ga4EventName,
}: {
  event: Event;
  ga4MeasurementId: string;
  ga4ApiSecret: string;
  ga4EventName: string;
}) {
  await fetch(
    `https://www.google-analytics.com/mp/collect?measurement_id=${ga4MeasurementId}&api_secret=${ga4ApiSecret}`,
    {
      method: 'POST',
      body: JSON.stringify({
        client_id: event.ipAddress,
        events: [
          {
            name: ga4EventName,
            params: event,
          },
        ],
      }),
    },
  );
}
