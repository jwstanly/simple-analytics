## Simple Analytics

A Cloudflare Worker to track online analytics. The Worker's URL serves an invisible 1x1 PNG, which tracks clients that load the image on web, email, mobile, etc.

#### Tracks:

- Location
- Time
- Cloudflare origin IP address
- A "source" parameter declared through the URL param

#### Integrates with:

1. Google Analytics - Forward events to GA4
2. Cloudflare KV - Persist events in a KV namespace

## Setup:

1. Install Cloudflare's Wrangler CLI v2.0.0+ ([more details](https://developers.cloudflare.com/workers/wrangler/install-and-update/#install-wrangler-globally)). Run `wrangler config` to connect your Cloudflare account.
2. Rename `wrangler.sample.toml` file to `wrangler.toml`
3. [Optional] For Google Analytics, in `wrangler.toml` add your GA4 measurement id and API secret key ([more details](https://developers.google.com/analytics/devguides/collection/protocol/ga4/reference?client_type=gtag#payload_query_parameters)).
4. [Optional] For Cloudflare KV, create a KV namespace ([more details](https://developers.cloudflare.com/workers/runtime-apis/kv/#:~:text=To%20use%20Workers%20KV%2C%20you,select%20Workers%20%26%20Pages%20%3E%20KV.)). Then in `wrangler.toml` add your KV namespace id to bind your Worker to this namespace ([more details](https://developers.cloudflare.com/workers/configuration/bindings/#kv-namespace-bindings)).
5. Tweak the rest of `wrangler.toml` config as needed. You can change the Cloudflare project's `name` (appears in the public URL's subdomain), plus environment variables `SOURCE_QUERY_PARAM` (the URL query param name to specify source), `PNG_BASE64` (the base64 encoded PNG to serve, by default a 1x1 transparent PNG), and `GA4_EVENT_NAME` (the event name for Google Analytics).
6. Run `wrangler deploy` in your terminal. Your Worker will now be live, any requests will be tracked.

#### Usage

Your Worker's URL follows this pattern. Optionally add the query parameter to track custom sources:

```
https://<PROJECT-NAME>.<CLOUDFLARE-USERNAME>.workers.dev/?<SOURCE_QUERY_PARAM>=<CUSTOM_SOURCE_HERE>
```

Use the URL as an image source on any platform, like HTML:

```
<img src="https://my-project.jwstanly.workers.dev/?s=custom-source-tracking-here">
```

For Google Analytics on the dashboard go to **Reports -> Engagement -> Events**. For KV on the Cloudflare dashboard go to **Workers & Pages -> KV -> Tracking (View)**.
