/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler deploy src/index.ts --name my-worker` to deploy your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export interface Env {
  // Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
  TRACKING: KVNamespace;
  //
  // Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
  // MY_DURABLE_OBJECT: DurableObjectNamespace;
  //
  // Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
  // MY_BUCKET: R2Bucket;
  //
  // Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
  // MY_SERVICE: Fetcher;

  GA4_MEASUREMENT_ID: string;
  GA4_API_SECRET: string;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const source =
      new URL(request.url).searchParams.get(SOURCE_PARAM) || DEFAULT_SOURCE;
    const ipAddress = request.headers.get('CF-Connecting-IP')!;
    const location = request.cf
      ? `${request.cf.city}, ${request.cf.region}, ${request.cf.country}`
      : 'Unknown';
    const time = new Date().toLocaleString();

    const event: Event = { source, ipAddress, location, time };

    await Promise.all([
      forwardEventToGoogleAnalytics4({
        event,
        ga4_measurement_id: env.GA4_MEASUREMENT_ID,
        ga4_api_secret: env.GA4_API_SECRET,
      }),
      storeEventInCloudflareKV({
        event,
        kv_namespace: env.TRACKING,
      }),
    ]);

    return new Response(TRANSPARENT_1X1_PIXEL, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
  },
};

async function forwardEventToGoogleAnalytics4({
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

async function storeEventInCloudflareKV({
  event,
  kv_namespace,
}: {
  event: Event;
  kv_namespace: KVNamespace;
}) {
  const eventsForSource: SourceEventsKvEntry = JSON.parse(
    (await kv_namespace.get(event.source)) || '{}',
  );

  eventsForSource[event.ipAddress] = {
    location: event.location,
    eventTimes: [
      ...(eventsForSource[event.ipAddress]?.eventTimes || []),
      new Date().toLocaleString(),
    ],
  };

  kv_namespace.put(event.source, JSON.stringify(eventsForSource));
}

interface Event {
  source: string;
  ipAddress: string;
  location: string;
  time: string;
}

interface SourceEventsKvEntry {
  [ipAddress: string]: {
    location: string;
    eventTimes: string[];
  };
}

const SOURCE_PARAM = 'k';
const DEFAULT_SOURCE = 'default';

const GA4_EVENT_NAME = 'email_opened';

const TRANSPARENT_1X1_PIXEL = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49,
  0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x06,
  0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00, 0x0a, 0x49, 0x44,
  0x41, 0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00, 0x05, 0x00, 0x01, 0x0d,
  0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42,
  0x60, 0x82,
]);
