import { forwardEventToGoogleAnalytics4 } from './ga';
import { storeEventInCloudflareKV } from './kv';

export interface Env {
  // Binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
  TRACKING: KVNamespace;

  // Environment variables. Learn more at https://developers.cloudflare.com/workers/platform/environment-variables/
  SOURCE_QUERY_PARAM: string;
  PNG_BASE64: string;
  GA4_MEASUREMENT_ID: string;
  GA4_API_SECRET: string;
  GA4_EVENT_NAME: string;
}

export interface Event {
  source: string;
  ipAddress: string;
  location: string;
  time: string;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const event: Event = {
      source:
        new URL(request.url).searchParams.get(env.SOURCE_QUERY_PARAM) ||
        'Unknown',
      ipAddress: request.headers.get('CF-Connecting-IP') || 'Unknown',
      location: request.cf
        ? `${request.cf.city}, ${request.cf.region}, ${request.cf.country}`
        : 'Unknown',
      time: new Date().toLocaleString(),
    };

    await Promise.all([
      forwardEventToGoogleAnalytics4({
        event,
        ga4MeasurementId: env.GA4_MEASUREMENT_ID,
        ga4ApiSecret: env.GA4_API_SECRET,
        ga4EventName: env.GA4_EVENT_NAME,
      }),
      storeEventInCloudflareKV({
        event,
        kvNamespace: env.TRACKING,
      }),
    ]);

    // Transparent 1x1 PNG image
    return new Response(
      new Uint8Array(
        [...atob(env.PNG_BASE64)].map((char) => char.charCodeAt(0)),
      ),
      {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      },
    );
  },
};
