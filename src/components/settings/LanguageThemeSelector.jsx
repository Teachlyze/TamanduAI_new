import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Sun, Moon, Globe, Eye } from 'lucide-react';

const LanguageThemeSelector = () => {
  const { t, i18n } = useTranslation();
  const { theme, highContrast, toggleHighContrast, setLightTheme, setDarkTheme } = useTheme();

  const languages = [
    { code: 'pt', name: 'Português', flag: '🇧🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
  ];

  const handleLanguageChange = (langCode) => {
    i18n.changeLanguage(langCode);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          {t('common.language')} & {t('common.theme')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Language Selection */}
        <div className="space-y-2">
          <Label htmlFor="language-select" className="text-sm font-medium">
            {t('common.language')}
          </Label>
          <Select value={i18n.language} onValueChange={handleLanguageChange}>
            <SelectTrigger id="language-select">
              <SelectValue placeholder={t('common.language')} />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  <div className="flex items-center gap-2">
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1 break-words whitespace-normal">
            {t('common.language')}: {i18n.language}
          </p>
        </div>

        {/* Theme Toggle */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">{t('common.theme')}</Label>
          <div className="flex gap-2">
            <Button
              variant={theme === 'light' ? 'default' : 'outline'}
              className="flex-1 text-foreground"
              onClick={setLightTheme}
            >
              <Sun className="mr-2 h-4 w-4" />
              Light
            </Button>
            <Button
              variant={theme === 'dark' ? 'default' : 'outline'}
              className="flex-1 text-foreground"
              onClick={setDarkTheme}
            >
              <Moon className="mr-2 h-4 w-4" />
              Dark
            </Button>
          </div>
        </div>

        {/* High Contrast Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="high-contrast" className="text-sm font-medium flex items-center gap-2">
              <Eye className="h-4 w-4" />
              {t('common.highContrast')}
            </Label>
            <p className="text-xs text-muted-foreground break-words whitespace-normal">
              Aumenta o contraste para melhor visibilidade
            </p>
          </div>
          <Switch
            id="high-contrast"
            checked={highContrast}
            onCheckedChange={toggleHighContrast}
          />
        </div>

        {/* Preview */}
        <div className="p-4 rounded-lg border bg-surface space-y-2">
          <p className="text-sm font-medium text-foreground">Preview</p>
          <div className="flex gap-2">
            <div className="h-8 w-8 rounded bg-primary" title="Primary" />
            <div className="h-8 w-8 rounded bg-secondary" title="Secondary" />
            <div className="h-8 w-8 rounded bg-success" title="Success" />
            <div className="h-8 w-8 rounded bg-warning" title="Warning" />
            <div className="h-8 w-8 rounded bg-error" title="Error" />
          </div>
          <p className="text-xs text-secondary">
            {t('common.theme')}: {theme} | {t('common.language')}: {i18n.language}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LanguageThemeSelector;
