import type { Event } from './index';

export async function storeEventInCloudflareKV({
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

interface SourceEventsKvEntry {
  [ipAddress: string]: {
    location: string;
    eventTimes: string[];
  };
}
