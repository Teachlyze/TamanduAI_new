import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  Accessibility,
  Eye,
  Type,
  Palette,
  Moon,
  Sun,
  Settings,
  Globe,
  Minus,
  Plus,
  RotateCcw,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguageDetection } from "../hooks/useLanguageDetection";
import useTheme from "../hooks/useTheme";

const AccessibilityButton = () => {
  const [settings, setSettings] = useState({
    fontSize: 16,
    highContrast: false,
    dyslexiaFont: false,
    reducedMotion: false,
  });

  // Carregar configurações salvas
  useEffect(() => {
    const saved = localStorage.getItem("accessibility-settings");
    if (saved) {
      const parsed = JSON.parse(saved);
      setSettings((prev) => ({ ...prev, ...parsed }));
      applyAccessibilityStyles(parsed);
    }
  }, []);

  // Aplicar estilos de acessibilidade
  const applyAccessibilityStyles = (settings) => {
    const root = document.documentElement;

    // Font size
    root.style.fontSize = `${settings.fontSize}px`;

    // High contrast
    if (settings.highContrast) {
      root.classList.add("high-contrast");
    } else {
      root.classList.remove("high-contrast");
    }

    // Dyslexia font
    if (settings.dyslexiaFont) {
      root.classList.add("dyslexia-font");
    } else {
      root.classList.remove("dyslexia-font");
    }

    // Reduced motion
    if (settings.reducedMotion) {
      root.style.setProperty("--animation-duration", "0s");
    } else {
      root.style.removeProperty("--animation-duration");
    }

    // Salvar configurações
    localStorage.setItem("accessibility-settings", JSON.stringify(settings));
  };

  // Toggle setting
  const toggleSetting = (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    applyAccessibilityStyles(newSettings);
  };

  // Update slider
  const updateSetting = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    applyAccessibilityStyles(newSettings);
  };

  // Reset settings
  const resetSettings = () => {
    const defaults = {
      fontSize: 16,
      highContrast: false,
      dyslexiaFont: false,
      reducedMotion: false,
    };
    setSettings(defaults);
    applyAccessibilityStyles(defaults);
  };

  const accessibilityOptions = [
    {
      icon: Type,
      titleKey: "accessibility.fontSize",
      descriptionKey: "accessibility.fontSizeDesc",
      type: "slider",
      key: "fontSize",
      min: 12,
      max: 24,
      step: 1,
    },
    {
      icon: Eye,
      titleKey: "accessibility.highContrast",
      descriptionKey: "accessibility.highContrastDesc",
      type: "toggle",
      key: "highContrast",
    },
    {
      icon: Palette,
      titleKey: "accessibility.dyslexiaFont",
      descriptionKey: "accessibility.dyslexiaFontDesc",
      type: "toggle",
      key: "dyslexiaFont",
    },
    {
      icon: Moon,
      titleKey: "accessibility.reducedMotion",
      descriptionKey: "accessibility.reducedMotionDesc",
      type: "toggle",
      key: "reducedMotion",
    },
  ];

  const hasActiveSettings = Object.values(settings).some((value) =>
    typeof value === "boolean" ? value : value !== 16
  );

  /* if (loading) return <LoadingScreen />; */

  return (
    <>
      {/* Main Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/20 hover:opacity-90"
        aria-label="Menu de acessibilidade"
        aria-expanded={isOpen}
      >
        <div className="relative">
          <Accessibility className="w-5 h-5" />
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="absolute -top-1 -right-1"
          >
            <Settings className="w-3 h-3" />
          </motion.div>
        </div>
        <span className="hidden sm:inline font-medium">
          {t("accessibility.title")}
        </span>

        {/* Notification dot */}
        {hasActiveSettings && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full border-2 border-white dark:border-gray-700 animate-pulse"
          >
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-full h-full bg-orange-500 rounded-full"
            />
          </motion.div>
        )}
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-24 right-6 w-80 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden max-h-[85vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="p-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white hover:opacity-90">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                      <Accessibility className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold">
                        {t("accessibility.title")}
                      </h3>
                      <p className="text-xs text-blue-100">
                        {t("accessibility.subtitle")}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="text-white hover:bg-white/20 rounded-xl h-8 w-8 p-0"
                  >
                    ✕
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetSettings}
                    className="bg-white dark:bg-slate-900 text-foreground border-border flex items-center gap-2 border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 rounded-xl"
                  >
                    <RotateCcw className="w-4 h-4" />
                    {t("accessibility.reset")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 border-2 border-green-300 dark:border-green-600 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/30 hover:border-green-400 dark:hover:border-green-500 transition-all duration-200 rounded-xl"
                  >
                    <Check className="w-4 h-4" />
                    {t("accessibility.done")}
                  </Button>
                </div>

                {/* Theme Toggle */}
                <div className="p-3 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-gray-800 dark:to-slate-800 rounded-2xl border-2 border-gray-200 dark:border-gray-600 shadow-lg shadow-gray-100/50 dark:shadow-gray-900/20 text-white hover:opacity-90">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-slate-100 to-gray-100 dark:from-gray-900/30 dark:to-slate-900/30 rounded-lg flex items-center justify-center shadow-sm text-white hover:opacity-90">
                        {isDark ? (
                          <Moon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                        ) : (
                          <Sun className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                          {isDark
                            ? t("accessibility.darkMode")
                            : t("accessibility.lightMode")}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {t("accessibility.themeDesc")}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={toggleTheme}
                      className="bg-white dark:bg-slate-900 text-foreground border-border h-8 px-3 dark:bg-gray-700 border border-gray-300 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-600 text-xs"
                    >
                      {isDark ? (
                        <Sun className="w-3 h-3 mr-1" />
                      ) : (
                        <Moon className="w-3 h-3 mr-1" />
                      )}
                      {isDark
                        ? t("accessibility.light")
                        : t("accessibility.dark")}
                    </Button>
                  </div>
                </div>

                {/* Accessibility Options */}
                {accessibilityOptions.map((option, index) => (
                  <motion.div
                    key={option.key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group p-3 bg-gradient-to-r from-white to-blue-50/30 dark:from-gray-800 dark:to-blue-950/20 rounded-2xl border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-lg hover:shadow-blue-100/50 dark:hover:shadow-blue-900/20 transition-all duration-300 transform hover:-translate-y-0.5 text-white hover:opacity-90"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-sm text-white hover:opacity-90">
                          <option.icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <h5 className="text-sm font-semibold text-gray-900 dark:text-white">
                            {t(option.titleKey)}
                          </h5>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {t(option.descriptionKey)}
                          </p>
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        {option.type === "slider" ? (
                          <div className="flex items-center gap-2 min-w-[120px]">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                updateSetting(
                                  option.key,
                                  Math.max(
                                    option.min,
                                    settings[option.key] - option.step
                                  )
                                )
                              }
                              disabled={settings[option.key] <= option.min}
                              className="h-7 w-7 p-0 rounded-full border-2 border-blue-300 dark:border-blue-700 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400"
                            >
                              <Minus className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                            </Button>
                            <div className="flex-1 text-center">
                              <div className="inline-flex items-center justify-center w-12 h-6 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-md border border-blue-200 dark:border-blue-800 text-white hover:opacity-90">
                                <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
                                  {settings[option.key]}
                                </span>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                updateSetting(
                                  option.key,
                                  Math.min(
                                    option.max,
                                    settings[option.key] + option.step
                                  )
                                )
                              }
                              disabled={settings[option.key] >= option.max}
                              className="h-7 w-7 p-0 rounded-full border-2 border-blue-300 dark:border-blue-700 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400"
                            >
                              <Plus className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                            </Button>
                          </div>
                        ) : (
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => toggleSetting(option.key)}
                              className={`relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                settings[option.key]
                                  ? "bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg shadow-blue-500/30"
                                  : "bg-gray-200 dark:bg-gray-700"
                              }`}
                              role="switch"
                              aria-checked={settings[option.key]}
                            >
                              <span
                                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-all duration-300 ${
                                  settings[option.key]
                                    ? "translate-x-8"
                                    : "translate-x-1"
                                }`}
                              />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Language Selection - Moved to end */}
                <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border-2 border-green-200 dark:border-green-800 shadow-lg shadow-green-100/50 dark:shadow-green-900/20 text-white hover:opacity-90">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg flex items-center justify-center shadow-sm text-white hover:opacity-90">
                        <Globe className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-green-800 dark:text-green-300">
                          {currentLanguage.name}
                        </h4>
                        <p className="text-xs text-green-700 dark:text-green-400">
                          {t("accessibility.languageDesc")}
                        </p>
                      </div>
                    </div>
                    <Select
                      value={currentLanguage.code}
                      onValueChange={setLanguage}
                    >
                      <SelectTrigger className="w-20 h-8 bg-white dark:bg-gray-700 border border-green-300 dark:border-green-600 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {supportedLanguages.map((lang) => (
                          <SelectItem key={lang.code} value={lang.code}>
                            {lang.flag} {lang.nativeName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Footer */}
                <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    {t("accessibility.autoSave")}
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default AccessibilityButton;
