import { PremiumCard } from '@/components/ui/PremiumCard'
import { PremiumButton } from '@/components/ui/PremiumButton' from 'react';
import PrivacyPreferencesPopup from '@/components/PrivacyPreferencesPopup';

export default function PrivacyPreferences() {
  return (
    <div className="container mx-auto px-4 py-8">
      <PremiumCard variant="elevated">
      <h1 className="text-3xl font-bold mb-4">Preferências de Privacidade</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Gerencie suas preferências de privacidade e consentimentos.
      </p>
      <div className="max-w-xl">
        <PrivacyPreferencesPopup openInitially />
      </PremiumCard>
    </div>
    </div>
  );
}
