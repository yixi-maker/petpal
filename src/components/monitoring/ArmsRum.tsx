'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    __bl?: {
      config?: Record<string, unknown>;
      [key: string]: unknown;
    };
  }
}

const DEFAULT_ARMS_SCRIPT_URL = 'https://retcode.alicdn.com/retcode/bl.js';
const DEFAULT_ARMS_IMG_URL = 'https://arms-retcode.aliyuncs.com/r.png?';

function isArmsEnabled() {
  const provider = process.env.NEXT_PUBLIC_MONITORING_PROVIDER?.toLowerCase();
  return !!process.env.NEXT_PUBLIC_ARMS_PID && (!provider || provider === 'arms');
}

export function ArmsRum() {
  useEffect(() => {
    if (!isArmsEnabled()) return;
    if (document.getElementById('arms-rum-sdk')) return;

    window.__bl = window.__bl || {};
    window.__bl.config = {
      pid: process.env.NEXT_PUBLIC_ARMS_PID,
      appType: 'web',
      environment:
        process.env.NEXT_PUBLIC_ARMS_ENV ||
        process.env.NEXT_PUBLIC_APP_ENV ||
        'staging',
      imgUrl: process.env.NEXT_PUBLIC_ARMS_IMG_URL || DEFAULT_ARMS_IMG_URL,
      sendResource: true,
      enableLinkTrace: true,
      behavior: true,
      enableSPA: true,
    };

    const script = document.createElement('script');
    script.id = 'arms-rum-sdk';
    script.src =
      process.env.NEXT_PUBLIC_ARMS_SCRIPT_URL || DEFAULT_ARMS_SCRIPT_URL;
    script.crossOrigin = 'anonymous';
    script.async = true;
    document.head.appendChild(script);
  }, []);

  return null;
}
