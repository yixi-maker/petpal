// Provider health checks — validates configuration of all service providers
// Logs status to console at startup (non-blocking). Also exposed via API endpoint.

export interface HealthStatus {
  provider: string;
  status: 'ready' | 'pending' | 'unavailable' | 'error';
  message: string;
}

export async function checkProviderHealth(): Promise<HealthStatus[]> {
  const results: HealthStatus[] = [];

  // SMS
  const smsProvider = process.env.SMS_PROVIDER || 'mock';
  if (smsProvider === 'mock') {
    results.push({
      provider: 'SMS',
      status: 'pending',
      message: 'Using mock provider (code 123456)',
    });
  } else if (smsProvider === 'aliyun') {
    const hasCreds = !!(process.env.SMS_ACCESS_KEY && process.env.SMS_SECRET);
    results.push({
      provider: 'SMS',
      status: hasCreds ? 'ready' : 'error',
      message: hasCreds
        ? 'Aliyun SMS configured'
        : 'Aliyun SMS: missing SMS_ACCESS_KEY or SMS_SECRET',
    });
  }

  // AI
  const aiProvider = process.env.AI_PROVIDER || 'mock';
  if (aiProvider === 'mock') {
    results.push({
      provider: 'AI',
      status: 'pending',
      message: 'Using mock AI provider',
    });
  } else {
    const hasKey = !!process.env.AI_API_KEY;
    results.push({
      provider: 'AI',
      status: hasKey ? 'ready' : 'error',
      message: hasKey
        ? `${aiProvider} configured`
        : `${aiProvider}: missing AI_API_KEY`,
    });
  }

  // Storage
  const storageProvider = process.env.STORAGE_PROVIDER || 'local';
  if (storageProvider === 'local') {
    results.push({
      provider: 'Storage',
      status: 'pending',
      message: 'Using local storage (public/uploads)',
    });
  } else if (storageProvider === 's3') {
    const hasCreds = !!(
      process.env.STORAGE_ENDPOINT &&
      process.env.STORAGE_ACCESS_KEY &&
      process.env.STORAGE_SECRET_KEY
    );
    results.push({
      provider: 'Storage',
      status: hasCreds ? 'ready' : 'error',
      message: hasCreds
        ? 'S3 storage configured'
        : 'S3 storage: missing credentials',
    });
  }

  // Moderation
  const modProvider = process.env.MODERATION_PROVIDER || 'mock';
  if (modProvider === 'mock') {
    results.push({
      provider: 'Moderation',
      status: 'pending',
      message: 'Using mock moderation (keyword filter)',
    });
  } else {
    const hasKey = !!process.env.MODERATION_API_KEY;
    results.push({
      provider: 'Moderation',
      status: hasKey ? 'ready' : 'error',
      message: hasKey
        ? 'Content moderation ready'
        : 'Content moderation: missing MODERATION_API_KEY (fail-closed)',
    });
  }

  // Maps
  const mapKey = process.env.NEXT_PUBLIC_AMAP_KEY;
  results.push({
    provider: 'Maps',
    status: mapKey ? 'ready' : 'pending',
    message: mapKey
      ? 'AMAP configured'
      : 'Using map placeholder (set NEXT_PUBLIC_AMAP_KEY for real maps)',
  });

  // Redis
  if (process.env.REDIS_URL) {
    results.push({
      provider: 'Redis',
      status: 'ready',
      message: 'Redis configured',
    });
  } else {
    results.push({
      provider: 'Redis',
      status: 'pending',
      message: 'Redis not configured (using memory store)',
    });
  }

  // Database
  const dbUrl = process.env.DATABASE_URL || '';
  if (dbUrl.includes('sqlite') || dbUrl.includes('file:')) {
    results.push({
      provider: 'Database',
      status: 'ready',
      message: 'SQLite (dev)',
    });
  } else if (dbUrl.includes('postgres')) {
    results.push({
      provider: 'Database',
      status: 'ready',
      message: 'PostgreSQL',
    });
  }

  return results;
}

// Log health status to console at import time (non-blocking, async)
if (typeof window === 'undefined') {
  checkProviderHealth()
    .then((statuses) => {
      console.log('[Provider Health]');
      for (const s of statuses) {
        console.log(`  ${s.provider}: ${s.status} — ${s.message}`);
      }
    })
    .catch(() => {
      // Never throw from health check logging
    });
}
