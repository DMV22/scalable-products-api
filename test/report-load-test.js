import http from 'k6/http';
import { check } from 'k6';

const baseUrl = __ENV.BASE_URL || 'http://localhost:8080';

export const options = {
  vus: Number(__ENV.VUS || 10),
  duration: __ENV.DURATION || '1m',

  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500'],
    checks: ['rate==1'],
  },
};

export default function () {
  const response = http.get(`${baseUrl}/products/report`, {
    timeout: '30s',
  });

  let body = null;

  try {
    body = response.json();
  } catch {
    // Перевірки нижче зафіксують некоректну відповідь.
  }

  check(response, {
    'status is 200': (r) => r.status === 200,
    'report is valid': () =>
      body !== null &&
      body.sampleSize === 2_000_000 &&
      Number.isFinite(body.total) &&
      Number.isFinite(body.mean) &&
      typeof body.instanceId === 'string',
  });
}