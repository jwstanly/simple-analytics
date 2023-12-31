import type { Event } from './index';

interface SourceEventsKvEntry {
  [ipAddress: string]: {
    location: string;
    eventTimes: string[];
  };
}

export async function storeEventInCloudflareKV({
  event,
  kvNamespace,
}: {
  event: Event;
  kvNamespace: KVNamespace;
}) {
  const eventsForSource: SourceEventsKvEntry = JSON.parse(
    (await kvNamespace.get(event.source)) || '{}',
  );

  eventsForSource[event.ipAddress] = {
    location: event.location,
    eventTimes: [
      ...(eventsForSource[event.ipAddress]?.eventTimes || []),
      new Date().toLocaleString(),
    ],
  };

  kvNamespace.put(event.source, JSON.stringify(eventsForSource));
}
