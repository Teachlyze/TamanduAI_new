import express from 'express';

const app = express();
const port = process.env.PORT || 9101;

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL || process.env.UPSTASH_REDIS_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!UPSTASH_URL || !UPSTASH_TOKEN) {
  console.error('Missing UPSTASH_REDIS_REST_URL (or UPSTASH_REDIS_URL) or UPSTASH_REDIS_REST_TOKEN');
}

async function upstashCommand(command) {
  const start = performance.now();
  const res = await fetch(UPSTASH_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${UPSTASH_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify([command])
  });
  const latency = performance.now() - start;
  let data;
  try {
    data = await res.json();
  } catch (_) {
    data = null;
  }
  return { res, data, latency };
}

function parseRateLimitHeaders(res) {
  const remaining = Number(res.headers.get('x-ratelimit-remaining')) || NaN;
  const limit = Number(res.headers.get('x-ratelimit-limit')) || NaN;
  const reset = Number(res.headers.get('x-ratelimit-reset')) || NaN;
  return { remaining, limit, reset };
}

app.get('/metrics', async (_req, res) => {
  const lines = [];
  lines.push('# HELP upstash_ping_latency_ms Latency of Upstash PING via REST');
  lines.push('# TYPE upstash_ping_latency_ms gauge');
  lines.push('# HELP upstash_set_latency_ms Latency of Upstash SET via REST');
  lines.push('# TYPE upstash_set_latency_ms gauge');
  lines.push('# HELP upstash_get_latency_ms Latency of Upstash GET via REST');
  lines.push('# TYPE upstash_get_latency_ms gauge');
  lines.push('# HELP upstash_requests_remaining Upstash REST ratelimit remaining');
  lines.push('# TYPE upstash_requests_remaining gauge');
  lines.push('# HELP upstash_requests_limit Upstash REST ratelimit limit');
  lines.push('# TYPE upstash_requests_limit gauge');
  lines.push('# HELP upstash_requests_reset_seconds Upstash REST ratelimit reset seconds');
  lines.push('# TYPE upstash_requests_reset_seconds gauge');

  if (!UPSTASH_URL || !UPSTASH_TOKEN) {
    lines.push('upstash_ping_latency_ms 0');
    lines.push('upstash_set_latency_ms 0');
    lines.push('upstash_get_latency_ms 0');
    lines.push('upstash_requests_remaining 0');
    lines.push('upstash_requests_limit 0');
    lines.push('upstash_requests_reset_seconds 0');
    return res.set('Content-Type', 'text/plain; version=0.0.4').send(lines.join('\n') + '\n');
  }

  try {
    // PING
    const ping = await upstashCommand(['PING']);
    const ratePing = parseRateLimitHeaders(ping.res);

    // SET key
    const key = 'tamanduai_exporter_health';
    const value = Math.random().toString(16).slice(2);
    const set = await upstashCommand(['SET', key, value, 'EX', '15']);
    const rateSet = parseRateLimitHeaders(set.res);

    // GET key
    const get = await upstashCommand(['GET', key]);
    const rateGet = parseRateLimitHeaders(get.res);

    // Emit metrics
    lines.push(`upstash_ping_latency_ms ${ping.latency.toFixed(0)}`);
    lines.push(`upstash_set_latency_ms ${set.latency.toFixed(0)}`);
    lines.push(`upstash_get_latency_ms ${get.latency.toFixed(0)}`);

    // Prefer latest headers we saw
    const remaining = rateGet.remaining || rateSet.remaining || ratePing.remaining || 0;
    const limit = rateGet.limit || rateSet.limit || ratePing.limit || 0;
    const reset = rateGet.reset || rateSet.reset || ratePing.reset || 0;

    if (!Number.isNaN(remaining)) lines.push(`upstash_requests_remaining ${remaining}`);
    if (!Number.isNaN(limit)) lines.push(`upstash_requests_limit ${limit}`);
    if (!Number.isNaN(reset)) lines.push(`upstash_requests_reset_seconds ${reset}`);

    return res.set('Content-Type', 'text/plain; version=0.0.4').send(lines.join('\n') + '\n');
  } catch (err) {
    console.error('Exporter error:', err);
    lines.push('upstash_ping_latency_ms 0');
    lines.push('upstash_set_latency_ms 0');
    lines.push('upstash_get_latency_ms 0');
    lines.push('upstash_requests_remaining 0');
    lines.push('upstash_requests_limit 0');
    lines.push('upstash_requests_reset_seconds 0');
    return res.set('Content-Type', 'text/plain; version=0.0.4').send(lines.join('\n') + '\n');
  }
});

app.get('/', (_req, res) => {
  res.json({ status: 'ok', metrics: '/metrics' });
});

app.listen(port, () => {
  console.log(`Upstash exporter listening on :${port}`);
});
