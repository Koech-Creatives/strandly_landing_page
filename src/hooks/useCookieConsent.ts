import { useState, useEffect } from 'react';

export interface CookieSettings {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

export const useCookieConsent = () => {
  const [consent, setConsent] = useState<string | null>(null);
  const [settings, setSettings] = useState<CookieSettings>({
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false
  });
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    // Load consent status from localStorage
    const savedConsent = localStorage.getItem('cookie-consent');
    const savedSettings = localStorage.getItem('cookie-settings');
    
    setConsent(savedConsent);
    
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);
      } catch (error) {
        console.error('Error parsing cookie settings:', error);
      }
    }
  }, []);

  const acceptAll = () => {
    const newSettings = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true
    };
    
    setConsent('accepted');
    setSettings(newSettings);
    localStorage.setItem('cookie-consent', 'accepted');
    localStorage.setItem('cookie-settings', JSON.stringify(newSettings));
    
    // Initialize Google Analytics if consent is given
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted',
        ad_storage: 'granted'
      });
    }
  };

  const rejectAll = () => {
    const newSettings = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false
    };
    
    setConsent('rejected');
    setSettings(newSettings);
    localStorage.setItem('cookie-consent', 'rejected');
    localStorage.setItem('cookie-settings', JSON.stringify(newSettings));
    
    // Disable Google Analytics if consent is rejected
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'denied',
        ad_storage: 'denied'
      });
    }
  };

  const saveCustomSettings = (newSettings: CookieSettings) => {
    setConsent('customized');
    setSettings(newSettings);
    localStorage.setItem('cookie-consent', 'customized');
    localStorage.setItem('cookie-settings', JSON.stringify(newSettings));
    
    // Update Google Analytics consent based on settings
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: newSettings.analytics ? 'granted' : 'denied',
        ad_storage: newSettings.marketing ? 'granted' : 'denied'
      });
    }
  };

  const showCookieSettings = () => {
    setShowSettings(true);
  };

  const hideCookieSettings = () => {
    setShowSettings(false);
  };

  const hasConsent = () => {
    return consent !== null;
  };

  const canUseAnalytics = () => {
    return settings.analytics;
  };

  const canUseMarketing = () => {
    return settings.marketing;
  };

  const canUsePreferences = () => {
    return settings.preferences;
  };

  return {
    consent,
    settings,
    showSettings,
    acceptAll,
    rejectAll,
    saveCustomSettings,
    showCookieSettings,
    hideCookieSettings,
    hasConsent,
    canUseAnalytics,
    canUseMarketing,
    canUsePreferences
  };
};

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}
