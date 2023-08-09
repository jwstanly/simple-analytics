## Simple Analytics

A Cloudflare Worker to track online analytics. The Worker's route serves an invisible 1x1 PNG, which tracks clients that load the image on web, email, mobile, etc.

#### Tracks:

- Location
- Time
- Obfuscated IP address
- A "source" parameter declared through the URL param

#### Integrates with:

1. Google Analytics - Forward events to GA4
2. Cloudflare KV - Persist events in a KV namespace

## Setup:

1. Install Cloudflare's Wrangler CLI ([more details](https://developers.cloudflare.com/workers/wrangler/install-and-update/#install-wrangler-globally)). Make sure you have v2.0.0+.
2. [Optional] For Google Analytics, in `wrangler.sample.toml` replace `<GA4_MEASUREMENT_ID_HERE>` and `<GA4_API_SECRET_HERE>` with your existing GA4 measurement id and API secret key ([more details](https://developers.google.com/analytics/devguides/collection/protocol/ga4/reference?client_type=gtag#payload_query_parameters)).
3. [Optional] For Cloudflare KV, create a KV namespace ([more details](https://developers.cloudflare.com/workers/runtime-apis/kv/#:~:text=To%20use%20Workers%20KV%2C%20you,select%20Workers%20%26%20Pages%20%3E%20KV.)). Then in `wrangler.sample.toml` replace `<NAMESPACE_ID_HERE>` with your KV namespace id ([more details](https://developers.cloudflare.com/workers/configuration/bindings/#kv-namespace-bindings)).
4. Edit your project's default `name` and `SOURCE_QUERY_PARAM` to your liking in `wrangler.sample.toml`. Note `name` publicly appears in the route's subdomain and `SOURCE_QUERY_PARAM` as the URL query parameter (example: https://my-project.jwstanly.workers.dev/?s=custom-source-tracking-here).
5. Rename `wrangler.sample.toml` file to `wrangler.toml`
6. Run `wrangler deploy` in your terminal. Any requests to your Worker's route will now be tracked.

#### Usage

Your Worker's route follows this pattern:

```
https://<PROJECT-NAME>.<CLOUDFLARE-USERNAME>.workers.dev
```

To track custom sources, add the query parameter (optional):

```
https://<PROJECT-NAME>.<CLOUDFLARE-USERNAME>.workers.dev/?<SOURCE_QUERY_PARAM>=<CUSTOM_SOURCE_HERE>
```

Use the route as an image source on any platform, like HTML:

```
<img src="https://my-project.jwstanly.workers.dev/?s=custom-source-tracking-here">
```

For Google Analytics on the dashboard go to **Reports -> Engagement -> Events**. For KV on the Cloudflare dashboard go to **Workers & Pages -> KV -> Tracking (View)**.
