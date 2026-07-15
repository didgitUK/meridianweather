'use client';

import { ThemeProvider } from '@/providers/ThemeProvider';
import { TemperatureUnitProvider } from '@/providers/TemperatureUnitProvider';
import { WeatherRefreshModeProvider } from '@/providers/WeatherRefreshModeProvider';
import { ConsentProvider } from '@/providers/ConsentProvider';
import { AccessibilityProvider } from '@/providers/AccessibilityProvider';
import { SettingsProvider } from '@/providers/SettingsProvider';
import { AdSenseProvider } from '@/providers/AdSenseProvider';
import { UserLocationProfileProvider } from '@/features/cities/hooks/useUserLocationProfile';
import { PwaRegistrar } from '@/components/layout/PwaRegistrar';
import { ScrollToTop } from '@/components/layout/ScrollToTop';
import { Toaster } from 'sonner';
import { TOAST_DURATION_MS, TOAST_VISIBLE_LIMIT } from '@/constants/toast';

export function AppProviders({ children }) {
  return (
    <ThemeProvider>
      <TemperatureUnitProvider>
        <WeatherRefreshModeProvider>
          <ConsentProvider>
            <UserLocationProfileProvider>
              <AccessibilityProvider>
                <SettingsProvider>
                  <AdSenseProvider>
                    <ScrollToTop />
                    <PwaRegistrar />
                    {children}
                    <Toaster
                      richColors={false}
                      position="bottom-right"
                      expand={false}
                      duration={TOAST_DURATION_MS}
                      visibleToasts={TOAST_VISIBLE_LIMIT}
                      toastOptions={{ duration: TOAST_DURATION_MS }}
                    />
                  </AdSenseProvider>
                </SettingsProvider>
              </AccessibilityProvider>
            </UserLocationProfileProvider>
          </ConsentProvider>
        </WeatherRefreshModeProvider>
      </TemperatureUnitProvider>
    </ThemeProvider>
  );
}
