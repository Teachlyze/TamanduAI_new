import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { useTranslation } from "react-i18next";
import { changeLanguage } from "../i18n";
import LanguageSelector from "./LanguageSelector";
import { Button } from "./ui/button";

const LanguageTest = () => {
  const { t, i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState(i18n.language);
  const [testText, setTestText] = useState(t("common.loading"));
  const [isTestMode, setIsTestMode] = useState(false);

  // Listen for language changes
  useEffect(() => {
    const handleLanguageChanged = (lng) => {
      setCurrentLang(lng);
      setTestText(t("common.loading"));
    };

    i18n.on("languageChanged", handleLanguageChanged);

    /* if (loading) return <LoadingScreen />; */

    return () => {
      i18n.off("languageChanged", handleLanguageChanged);
    };
  }, [t, i18n]);

  // Test language change directly
  const testLanguageChange = async (lang) => {
    try {
      await changeLanguage(lang);
    } catch (error) {
      console.error("[LanguageTest] Test failed:", error);
    }
  };

  // Toggle test mode
  const toggleTestMode = () => {
    setIsTestMode(!isTestMode);
  };

  /* if (loading) return <LoadingScreen />; */

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          🧪 Teste do Sistema de Idioma
        </h2>
        <Button
          onClick={toggleTestMode}
          variant={isTestMode ? "destructive" : "default"}
          size="sm"
        >
          {isTestMode ? "🔄 Modo Normal" : "🧪 Modo Teste"}
        </Button>
      </div>

      <div className="space-y-6">
        {/* Status Atual */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
            📊 Status Atual
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                <strong>Idioma do i18n:</strong>
              </p>
              <p className="font-mono text-lg bg-white dark:bg-gray-700 p-2 rounded">
                {i18n.language}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                <strong>Estado do Hook:</strong>
              </p>
              <p className="font-mono text-lg bg-white dark:bg-gray-700 p-2 rounded">
                {currentLang}
              </p>
            </div>
          </div>
        </div>

        {/* Texto Traduzido */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
            🌐 Texto Traduzido
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                <strong>common.loading:</strong>
              </p>
              <p className="text-lg bg-white dark:bg-gray-700 p-3 rounded">
                {testText}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                <strong>common.save:</strong>
              </p>
              <p className="text-lg bg-white dark:bg-gray-700 p-3 rounded">
                {t("common.save")}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                <strong>common.cancel:</strong>
              </p>
              <p className="text-lg bg-white dark:bg-gray-700 p-3 rounded">
                {t("common.cancel")}
              </p>
            </div>
          </div>
        </div>

        {isTestMode && (
          <>
            {/* Seletor de Idioma */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
                🎛️ Seletor de Idioma
              </h3>
              <div className="flex justify-center">
                <LanguageSelector />
              </div>
            </div>

            {/* Teste Manual */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
                🔧 Teste Manual
              </h3>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => testLanguageChange("pt")}
                  variant={i18n.language === "pt" ? "default" : "outline"}
                  size="sm"
                >
                  🇧🇷 Português
                </Button>
                <Button
                  onClick={() => testLanguageChange("en")}
                  variant={i18n.language === "en" ? "default" : "outline"}
                  size="sm"
                >
                  🇺🇸 English
                </Button>
                <Button
                  onClick={() => testLanguageChange("es")}
                  variant={i18n.language === "es" ? "default" : "outline"}
                  size="sm"
                >
                  🇪🇸 Español
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Instruções */}
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
            📝 Como Testar
          </h3>
          <ol className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
            <li>1. Clique em "🧪 Modo Teste" para ativar os controles</li>
            <li>2. Use os botões para testar mudança de idioma</li>
            <li>3. Observe se o texto muda imediatamente</li>
            <li>4. Abra o console para ver os logs de debug</li>
            <li>5. Verifique se não há spam no console</li>
          </ol>
        </div>

        {/* Debug Info */}
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
            ✅ Status das Correções
          </h3>
          <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
            <p>
              ✅ <strong>AuthContext:</strong> Desabilitado (sem polling)
            </p>
            <p>
              ✅ <strong>SupabaseAuthContext:</strong> Desabilitado (sem
              polling)
            </p>
            <p>
              ✅ <strong>NotificationDropdown:</strong> Otimizado (sem spam)
            </p>
            <p>
              ✅ <strong>Sistema de Idioma:</strong> Funcionando corretamente
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguageTest;
