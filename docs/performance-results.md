# Report endpoint: single-instance baseline

Sources: `reports/1-api-run-1.html`, `reports/1-api-run-2.html`, and `reports/1-api-run-3.html`.

Values were extracted from the embedded, gzip/base64-encoded dashboard events. The table uses the `cumulative` event (the complete run), not an average of the chart percentiles. Exported aggregates have limited precision.

The reports show 10 active VUs during each of six 10-second snapshots. The current script requests `/products/report` without a sleep. Report filenames identify these as single-instance runs; the HTML does not preserve the active Nginx configuration, container CPU usage, response status distribution, or response `instanceId` values.

| Configuration | Run | p95 (ms) | Requests/s | HTTP errors (%) | Requests | Mean (ms) | p99 (ms) | Maximum (ms) | Elapsed (s) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 API + Nginx | 1 | 3842.9 | 4.4490 | 0.722 | 277 | 2205.9 | 8473.5 | 10033 | 62.261 |
| 1 API + Nginx | 2 | 3590.3 | 4.5288 | 0.711 | 281 | 2175.0 | 7800.7 | 10015 | 62.046 |
| 1 API + Nginx | 3 | 3676.3 | 4.7497 | 0.675 | 296 | 2071.2 | 6536.7 | 10018 | 62.319 |
| Median of runs | — | 3676.3 | 4.5288 | 0.711 | 281 | 2175.0 | 7800.7 | 10018 | 62.261 |

The median row summarizes independent runs; it is not a pooled percentile over all requests. The reports contain 854 requests in total, with rates consistent with two HTTP failures per run (six in total). HTTP error percentages above are calculated from the exported rounded rates.

## Acceptance criteria

All three runs fail `http_req_duration: p(95)<500` and `checks: rate==1`.

All three pass `http_req_failed: rate<0.01` (less than 1%). A passed error-rate threshold does not imply zero errors or acceptable response times.

Successful checks: 99.277%, 99.288%, and 99.324% respectively. Checks and HTTP request failures use different denominators; the current script performs two checks per request.

## Changes over time

Each cell below is `requests/s / p95 ms` for that 10-second reporting window. Timestamps belong to completed requests, so a slow request may start in an earlier window.

| Window | Run 1 | Run 2 | Run 3 |
| --- | --- | --- | --- |
| 0–10 s | 2.9 / 7293.2 | 3.3 / 6485.5 | 3.3 / 5477.2 |
| 10–20 s | 4.3 / 7517.3 | 4.1 / 6721.2 | 5.1 / 5104.4 |
| 20–30 s | 4.7 / 4038.3 | 4.2 / 4607.1 | 5.2 / 3463.9 |
| 30–40 s | 4.8 / 3651.9 | 5.2 / 3397.2 | 5.0 / 3461.9 |
| 40–50 s | 5.1 / 3474.0 | 5.3 / 3362.0 | 5.1 / 3598.3 |
| 50–60 s | 4.8 / 3741.2 | 4.9 / 3532.5 | 4.9 / 3631.0 |

HTTP failures occur in the 10–20 second window in every run: 4.651%, 4.878%, and 3.921% of requests completed in that window. Later windows contain no HTTP failures. Full-run aggregates also include completion after the 60-second active workload.

## Interpretation and limits

- Most measured request time is waiting for the first byte: average TTFB is 2205.8, 2174.8, and 2071.1 ms. Average sending and receiving times are fractions of a millisecond. Investigate the upstream path, queueing, and application processing first; this alone does not locate the exact bottleneck.
- All runs have requests lasting about 10 seconds. Both Nginx configuration files currently specify `proxy_read_timeout 10s`; this is consistent with a proxy timeout but does not prove the HTTP status or root cause. Check the Nginx error/access logs from the test period for confirmation.
- The first 20 seconds are substantially worse than later windows. Warm-up, scheduling, or proxy/upstream behaviour are hypotheses, not established causes. Do not discard those windows without a documented reason and comparable reruns.
- CPU-heavy synchronous work in the current service is a plausible source of queueing. Historical CPU metrics are absent, so CPU saturation is not demonstrated by these HTML files.
- This is a baseline at 10 concurrent VUs, not a measurement of maximum sustainable RPS or the number of real production users supported.
- For three-instance comparison, keep the workload, duration, per-instance limits, warm-up procedure, and machine conditions consistent. Three containers with one CPU each have a larger total CPU allowance than one such container.

## Comparing the next results

Use median-of-run values for both configurations:

```text
Throughput factor = median RPS with 3 APIs / 4.5288
p95 reduction (%) = (1 - median p95 with 3 APIs / 3676.3) * 100
```

Also compare errors, check success, startup behaviour, and per-instance resource usage. Higher throughput alone is not enough if correctness or latency becomes worse.
