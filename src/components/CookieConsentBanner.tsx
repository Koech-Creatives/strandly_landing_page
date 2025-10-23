import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Cookie, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface CookieConsentBannerProps {
  onAccept: () => void;
  onReject: () => void;
  onCustomize: () => void;
}

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({
  onAccept,
  onReject,
  onCustomize
}) => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    const consentData = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
    localStorage.setItem('cookie-consent', 'accepted');
    localStorage.setItem('cookie-settings', JSON.stringify(consentData));
    setIsVisible(false);
    onAccept();
  };

  const handleReject = () => {
    const consentData = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
    localStorage.setItem('cookie-consent', 'rejected');
    localStorage.setItem('cookie-settings', JSON.stringify(consentData));
    setIsVisible(false);
    onReject();
  };

  const handleCustomize = () => {
    onCustomize();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-[#6B3F1D]/30 shadow-lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-3 flex-1">
            <Cookie className="w-6 h-6 text-[#6B3F1D] flex-shrink-0" />
            <div className="text-sm text-foreground/80 font-body">
              <p className="mb-2">
                {t('cookie_consent.description')}
              </p>
              <p className="text-xs text-foreground/60">
                {t('cookie_consent.privacyPolicy')}:{' '}
                <a href="/datenschutzerklaerung" className="text-[#6B3F1D] hover:underline">
                  {t('cookie_consent.privacyPolicy')}
                </a>
                {' '}und{' '}
                <a href="/cookie-policy" className="text-[#6B3F1D] hover:underline">
                  {t('cookie_consent.cookiePolicy')}
                </a>
                .
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCustomize}
              className="flex items-center gap-2 text-[#6B3F1D] border-[#6B3F1D]/30 hover:bg-[#6B3F1D]/10"
            >
              <Settings className="w-4 h-4" />
              {t('cookie_consent.app.optIn')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReject}
              className="text-[#6B3F1D] border-[#6B3F1D]/30 hover:bg-[#6B3F1D]/10"
            >
              {t('cookie_consent.declineAll')}
            </Button>
            <Button
              variant="hero"
              size="sm"
              onClick={handleAccept}
              className="bg-[#6B3F1D] hover:bg-[#6B3F1D]/90 text-white"
            >
              {t('cookie_consent.acceptAll')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Cookie Settings Modal Component
interface CookieSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: CookieSettings) => void;
}

interface CookieSettings {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

export const CookieSettingsModal: React.FC<CookieSettingsModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<CookieSettings>({
    necessary: true, // Always true, can't be disabled
    analytics: false,
    marketing: false,
    preferences: false
  });

  const handleSave = () => {
    const consentData = {
      ...settings,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
    localStorage.setItem('cookie-consent', 'customized');
    localStorage.setItem('cookie-settings', JSON.stringify(consentData));
    onSave(settings);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-display text-foreground">{t('cookie_consent.title')}</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-foreground/60 hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          <div className="space-y-6">
            <div className="p-4 bg-[#e7cfb1]/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-foreground">{t('cookie_consent.necessary.title')}</h3>
                <div className="w-12 h-6 bg-[#6B3F1D] rounded-full flex items-center justify-end px-1">
                  <div className="w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>
              <p className="text-sm text-foreground/70">
                {t('cookie_consent.necessary.description')}
              </p>
            </div>
            
            <div className="p-4 border border-[#6B3F1D]/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-foreground">{t('cookie_consent.analytics.title')}</h3>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.analytics}
                    onChange={(e) => setSettings({...settings, analytics: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#6B3F1D]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#6B3F1D]"></div>
                </label>
              </div>
              <p className="text-sm text-foreground/70">
                {t('cookie_consent.analytics.description')}
              </p>
            </div>
            
            <div className="p-4 border border-[#6B3F1D]/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-foreground">{t('cookie_consent.marketing.title')}</h3>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.marketing}
                    onChange={(e) => setSettings({...settings, marketing: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#6B3F1D]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#6B3F1D]"></div>
                </label>
              </div>
              <p className="text-sm text-foreground/70">
                {t('cookie_consent.marketing.description')}
              </p>
            </div>
            
            <div className="p-4 border border-[#6B3F1D]/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-foreground">{t('cookie_consent.preferences.title')}</h3>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.preferences}
                    onChange={(e) => setSettings({...settings, preferences: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#6B3F1D]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#6B3F1D]"></div>
                </label>
              </div>
              <p className="text-sm text-foreground/70">
                {t('cookie_consent.preferences.description')}
              </p>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-[#e7cfb1]/20 rounded-lg">
            <p className="text-sm text-foreground/70 mb-2">
              <strong>{t('cookie_consent.rights')}</strong> {t('cookie_consent.rightsDescription')}
            </p>
            <p className="text-xs text-foreground/60">
              {t('cookie_consent.lastUpdated')}: {new Date().toLocaleDateString()}
            </p>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={onClose}
              className="text-[#6B3F1D] border-[#6B3F1D]/30 hover:bg-[#6B3F1D]/10"
            >
              {t('cookie_consent.cancel')}
            </Button>
            <Button
              variant="hero"
              onClick={handleSave}
              className="bg-[#6B3F1D] hover:bg-[#6B3F1D]/90 text-white"
            >
              {t('cookie_consent.save')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
