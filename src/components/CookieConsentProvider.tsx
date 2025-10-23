import React from 'react';
import { CookieConsentBanner, CookieSettingsModal } from './CookieConsentBanner';
import { useCookieConsent } from '@/hooks/useCookieConsent';

interface CookieConsentProviderProps {
  children: React.ReactNode;
}

export const CookieConsentProvider: React.FC<CookieConsentProviderProps> = ({ children }) => {
  const {
    acceptAll,
    rejectAll,
    showCookieSettings,
    hideCookieSettings,
    showSettings,
    saveCustomSettings
  } = useCookieConsent();

  return (
    <>
      {children}
      
      {/* Cookie Consent Banner */}
      <CookieConsentBanner
        onAccept={acceptAll}
        onReject={rejectAll}
        onCustomize={showCookieSettings}
      />
      
      {/* Cookie Settings Modal */}
      <CookieSettingsModal
        isOpen={showSettings}
        onClose={hideCookieSettings}
        onSave={saveCustomSettings}
      />
    </>
  );
};
