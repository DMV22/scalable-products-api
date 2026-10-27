# Report endpoint: single-instance and three-instance benchmarks

Sources: `reports/1-api-run-1.html` through `reports/1-api-run-3.html`, and `reports/3-api-run-1.html` through `reports/3-api-run-3.html`.

Values were extracted from the embedded, gzip/base64-encoded dashboard events. The table uses the `cumulative` event (the complete run), not an average of the chart percentiles. Exported aggregates have limited precision.

All six reports show 10 active VUs during each of six 10-second snapshots, the same script path, aggregation period, and acceptance criteria. The current script requests `/products/report` without a sleep. Report filenames identify the configurations; the HTML does not preserve the active Nginx configuration, container CPU usage, response status distribution, or response `instanceId` values. Matching report metadata does not establish identical machine conditions.

| Configuration | Run | p95 (ms) | Requests/s | HTTP errors (%) | Requests | Mean (ms) | p99 (ms) | Maximum (ms) | Elapsed (s) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 API + Nginx | 1 | 3842.9 | 4.4490 | 0.722 | 277 | 2205.9 | 8473.5 | 10033 | 62.261 |
| 1 API + Nginx | 2 | 3590.3 | 4.5288 | 0.711 | 281 | 2175.0 | 7800.7 | 10015 | 62.046 |
| 1 API + Nginx | 3 | 3676.3 | 4.7497 | 0.675 | 296 | 2071.2 | 6536.7 | 10018 | 62.319 |
| 1 API: median | — | 3676.3 | 4.5288 | 0.711 | 281 | 2175.0 | 7800.7 | 10018 | 62.261 |
| 3 APIs + Nginx | 1 | 1908.9 | 11.7250 | 0 | 714 | 845.07 | 2175.8 | 2765.6 | 60.891 |
| 3 APIs + Nginx | 2 | 1749.1 | 11.1650 | 0 | 682 | 886.34 | 2160.0 | 3368.6 | 61.079 |
| 3 APIs + Nginx | 3 | 3571.8 | 7.8969 | 0 | 482 | 1254.20 | 5378.0 | 7372.3 | 61.035 |
| 3 APIs: median | — | 1908.9 | 11.1650 | 0 | 682 | 886.34 | 2175.8 | 3368.6 | 61.035 |

Each median row summarizes independent runs per column; it is not a pooled percentile over all requests or one representative run. The single-instance reports contain 854 requests in total, with rates consistent with two HTTP failures per run (six in total). The three-instance reports contain 1878 requests with no recorded HTTP failures. HTTP error percentages above are calculated from the exported rounded rates. Request rates include the final completion period, explaining the elapsed times slightly above 60 seconds.

## Comparison of median-of-run values

| Metric | 1 API | 3 APIs | Change |
| --- | --- | --- | --- |
| Requests/s | 4.5288 | 11.1650 | 2.465x throughput (+146.53%) |
| p95 (ms) | 3676.3 | 1908.9 | 48.08% lower |
| Mean request time (ms) | 2175.0 | 886.34 | 59.25% lower |
| p99 (ms) | 7800.7 | 2175.8 | 72.11% lower |
| HTTP errors (%) | 0.711 | 0 | 0.711 percentage points lower |

Scaling improved observed throughput and latency, but did not meet the 500 ms p95 criterion. The third three-instance run is materially worse than the first two and must not be discarded without evidence explaining it. Relative to three-instance run 2, run 3 has 29.27% lower RPS and 104.21% higher p95.

## Acceptance criteria

All three single-instance runs fail `http_req_duration: p(95)<500` and `checks: rate==1`.

All six runs pass `http_req_failed: rate<0.01` (less than 1%). A passed error-rate threshold does not imply zero errors or acceptable response times.

Successful checks for one instance: 99.277%, 99.288%, and 99.324% respectively. All three three-instance runs achieve 100% checks, but still fail `http_req_duration: p(95)<500` (p95 is 3.50 to 7.14 times the limit). Thus none of the six runs passes all criteria. Checks and HTTP request failures use different denominators; the current script performs two checks per request.

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

The table above describes the single-instance runs. The corresponding three-instance windows are:

| Window | Run 1 | Run 2 | Run 3 |
| --- | --- | --- | --- |
| 0–10 s | 9.7 / 2161.0 | 8.9 / 2200.7 | 4.5 / 2937.6 |
| 10–20 s | 11.9 / 1643.3 | 11.4 / 1837.9 | 6.1 / 4647.6 |
| 20–30 s | 12.3 / 1920.6 | 11.6 / 1741.0 | 11.1 / 2617.0 |
| 30–40 s | 12.3 / 1775.0 | 11.9 / 1632.9 | 7.2 / 4061.8 |
| 40–50 s | 12.4 / 1737.2 | 11.9 / 1631.1 | 6.4 / 3690.9 |
| 50–60 s | 11.8 / 2005.7 | 11.4 / 1812.5 | 11.9 / 1949.2 |

All three-instance windows have zero HTTP failures and 100% checks. Runs 1 and 2 settle around 11–12 requests/s after the first window. Run 3 fluctuates substantially and recovers in the final window; its degradation is not confined to initial warm-up. CPU contention, VM scheduling, resource throttling, thermal effects, or other concurrent work are hypotheses requiring logs and resource metrics, not conclusions from the HTML.

Average TTFB for three-instance runs is 844.88, 886.08, and 1253.1 ms, again accounting for almost all request duration. Run 3 also has one receiving-time maximum of 354.22 ms, but its average receiving time is only 0.993 ms, so this does not account for the general second-scale latency.

## Interpretation and limits

- Most measured request time is waiting for the first byte: average TTFB is 2205.8, 2174.8, and 2071.1 ms. Average sending and receiving times are fractions of a millisecond. Investigate the upstream path, queueing, and application processing first; this alone does not locate the exact bottleneck.
- All single-instance runs have requests lasting about 10 seconds. Both Nginx configuration files currently specify `proxy_read_timeout 10s`; this is consistent with a proxy timeout but does not prove the HTTP status or root cause. The three-instance maximums are 2.766, 3.369, and 7.372 seconds, without recorded HTTP failures. Check the Nginx error/access logs from the test period for confirmation of historical errors.
- The first 20 seconds of single-instance runs are substantially worse than later windows. Warm-up, scheduling, or proxy/upstream behaviour are hypotheses, not established causes. Do not discard those windows without a documented reason and comparable reruns.
- CPU-heavy synchronous work in the current service is a plausible source of queueing. Historical CPU metrics are absent, so CPU saturation is not demonstrated by these HTML files.
- These are observations at 10 concurrent VUs, not measurements of maximum sustainable RPS or the number of real production users supported. With this closed workload, faster responses allow VUs to issue more requests.
- For comparisons, keep the workload, duration, per-instance limits, warm-up procedure, and machine conditions consistent. Three containers with one CPU each have a larger total CPU allowance than one such container; the observed 2.465x throughput is not a cost-normalized efficiency measurement.

## Reproducing and extending the comparison

Use median-of-run values for both configurations:

```text
Throughput factor = 11.1650 / 4.5288 = 2.4653
p95 reduction (%) = (1 - 1908.9 / 3676.3) * 100 = 48.0755
```

Repeat alternating configurations under controlled conditions and collect per-instance CPU, throttling, memory, logs, and request distribution to investigate run 3. Keep the historical results, including the degraded run. A fixed-arrival-rate experiment can separately compare latency under the same incoming RPS. Higher throughput alone is not enough if correctness or latency becomes worse.
