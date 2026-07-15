'use client';

import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function AlertBanner({ alertIds }) {
  const [alerts, setAlerts] = useState([]);
  const alertKey = Array.isArray(alertIds) && alertIds.length > 0
    ? alertIds.join(',')
    : '';

  useEffect(() => {
    if (!alertKey) {
      return undefined;
    }

    const ids = alertKey.split(',');
    let cancelled = false;

    async function load() {
      const results = [];
      for (const alertId of ids.slice(0, 3)) {
        const response = await fetch(`/api/alerts/${alertId}`);
        if (response.ok) {
          const data = await response.json();
          results.push(data);
        }
      }
      if (!cancelled) setAlerts(results);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [alertKey]);

  if (!alertKey || alerts.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      {alerts.map((alert) => (
        <Alert key={alert.id}>
          <AlertTitle>{alert.event}</AlertTitle>
          <AlertDescription>
            {alert.senderName ? <p className="font-medium">{alert.senderName}</p> : null}
            <p>{alert.description}</p>
            {alert.start && alert.end ? (
              <p className="mt-2 text-xs text-muted-foreground">
                {new Date(alert.start * 1000).toLocaleString('en-GB')}
                {' — '}
                {new Date(alert.end * 1000).toLocaleString('en-GB')}
              </p>
            ) : null}
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
}
