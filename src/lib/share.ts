"use client";

import { useEffect, useState } from "react";
import { track } from "@vercel/analytics";

// Delen kan alleen op gsm (daar opent het deelmenu: WhatsApp, Messenger, sms…).
export function useCanShare(): boolean {
  const [can, setCan] = useState(false);
  useEffect(() => {
    const ua = navigator.userAgent;
    const mobile = /Android|iPhone|iPad|iPod|Mobi/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
    setCan(mobile && typeof navigator.share === "function");
  }, []);
  return can;
}

export async function shareLink(data: { title: string; text: string; path: string }, event: string, props?: Record<string, string>) {
  track(event, props);
  try {
    await navigator.share({ title: data.title, text: data.text, url: new URL(data.path, window.location.origin).toString() });
  } catch {
    /* geannuleerd */
  }
}
