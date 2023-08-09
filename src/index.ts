import { forwardEventToGoogleAnalytics4 } from './ga';
import { storeEventInCloudflareKV } from './kv';

export interface Env {
  // Binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
  TRACKING: KVNamespace;

  // Environment variables. Learn more at https://developers.cloudflare.com/workers/platform/environment-variables/
  SOURCE_QUERY_PARAM: string;
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
        ga4_measurement_id: env.GA4_MEASUREMENT_ID,
        ga4_api_secret: env.GA4_API_SECRET,
        ga4_event_name: env.GA4_EVENT_NAME,
      }),
      storeEventInCloudflareKV({
        event,
        kv_namespace: env.TRACKING,
      }),
    ]);

    // Transparent 1x1 PNG image
    return new Response(
      new Uint8Array([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
        0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
        0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00,
        0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
        0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49,
        0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
      ]),
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
