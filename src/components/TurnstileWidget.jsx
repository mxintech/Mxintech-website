import { useEffect, useRef } from 'react';

const SITE_KEY = process.env.REACT_APP_TURNSTILE_SITE_KEY || '';

export function turnstileEnabled() {
  return Boolean(SITE_KEY);
}

export default function TurnstileWidget({ onToken, onExpire, onError }) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const onTokenRef = useRef(onToken);
  const onExpireRef = useRef(onExpire);
  const onErrorRef = useRef(onError);

  onTokenRef.current = onToken;
  onExpireRef.current = onExpire;
  onErrorRef.current = onError;

  useEffect(() => {
    if (!SITE_KEY) return undefined;

    let cancelled = false;

    function safeRemove() {
      if (widgetIdRef.current == null || !window.turnstile) return;
      try {
        window.turnstile.remove(widgetIdRef.current);
      } catch {
        // Ignore stale widget ids after a failed or interrupted render.
      }
      widgetIdRef.current = null;
    }

    function renderWidget() {
      if (cancelled || !containerRef.current || !window.turnstile) return;
      safeRemove();
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: SITE_KEY,
        callback: (token) => onTokenRef.current?.(token),
        'expired-callback': () => {
          onTokenRef.current?.('');
          onExpireRef.current?.();
        },
        'error-callback': () => {
          onTokenRef.current?.('');
          onErrorRef.current?.();
        },
      });
    }

    function cleanup() {
      cancelled = true;
      safeRemove();
    }

    if (window.turnstile) {
      renderWidget();
      return cleanup;
    }

    const existing = document.querySelector('script[data-turnstile-script]');
    if (existing) {
      if (window.turnstile) {
        renderWidget();
      } else {
        existing.addEventListener('load', renderWidget);
      }
      return () => {
        existing.removeEventListener('load', renderWidget);
        cleanup();
      };
    }

    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.dataset.turnstileScript = 'true';
    script.onload = renderWidget;
    script.onerror = () => onErrorRef.current?.();
    document.head.appendChild(script);

    return cleanup;
  }, []);

  if (!SITE_KEY) return null;
  return <div ref={containerRef} className="turnstile-widget" aria-label="Verificación anti-bots" />;
}
