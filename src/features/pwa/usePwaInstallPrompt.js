'use client';

import { useCallback, useEffect, useState } from 'react';

export function isStandaloneDisplay() {
  if (typeof window === 'undefined') {
    return false;
  }

  return (
    window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true
  );
}

export function isIosDevice() {
  if (typeof window === 'undefined') {
    return false;
  }

  return /iphone|ipad|ipod/i.test(window.navigator.userAgent)
    || (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
}

/**
 * Captures beforeinstallprompt and exposes install + dismiss helpers.
 */
export function usePwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(() => (
    typeof window === 'undefined' ? false : isStandaloneDisplay()
  ));
  const [isIos] = useState(() => (
    typeof window === 'undefined' ? false : isIosDevice()
  ));

  useEffect(() => {
    function onBeforeInstall(event) {
      event.preventDefault();
      setDeferredPrompt(event);
    }

    function onInstalled() {
      setDeferredPrompt(null);
      setIsInstalled(true);
    }

    function onDisplayModeChange() {
      setIsInstalled(isStandaloneDisplay());
    }

    const media = window.matchMedia('(display-mode: standalone)');
    media.addEventListener?.('change', onDisplayModeChange);
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);

    return () => {
      media.removeEventListener?.('change', onDisplayModeChange);
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) {
      return { outcome: 'unavailable' };
    }

    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    return { outcome: choice.outcome };
  }, [deferredPrompt]);

  return {
    canPromptInstall: Boolean(deferredPrompt) && !isInstalled,
    showIosHint: isIos && !isInstalled,
    isInstalled,
    isIos,
    promptInstall,
  };
}
