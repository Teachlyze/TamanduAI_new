import { LoadingScreen } from "@/components/ui/LoadingScreen";

const TailwindCheck = () => {
  useEffect(() => {
    console.log("[TailwindCheck] Componente montado");

    // Verifica se o Tailwind está injetando estilos
    const styleSheets = Array.from(document.styleSheets);
    const hasTailwind = styleSheets.some((sheet) => {
      try {
        return (
          sheet.href &&
          (sheet.href.includes("tailwind") ||
            (sheet.ownerNode &&
              sheet.ownerNode.textContent.includes("tailwind")))
        );
      } catch (e) {
        return false;
      }
    });

    console.log("[TailwindCheck] Tailwind detectado nos estilos:", hasTailwind);

    // Verifica se as classes do Tailwind estão disponíveis
    const testEl = document.createElement("div");
    testEl.className = "hidden";
    document.body.appendChild(testEl);
    const isTailwindWorking =
      window.getComputedStyle(testEl).display === "none";
    document.body.removeChild(testEl);

    console.log(
      "[TailwindCheck] Classes do Tailwind funcionando:",
      isTailwindWorking
    );

    // Verifica se as fontes personalizadas estão carregadas
    const isFontLoaded = document.fonts.check('1rem "Inter"');
    console.log("[TailwindCheck] Fonte Inter carregada:", isFontLoaded);
  }, []);

  /* if (loading) return <LoadingScreen />; */

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200 z-50 max-w-sm">
      <h2 className="text-lg font-bold mb-2">Verificação do Tailwind</h2>
      <div className="space-y-2">
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
          <span>Componente de verificação carregado</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-yellow-500 mr-2"></div>
          <span>Verificando estilos do Tailwind...</span>
        </div>
      </div>
      <div className="mt-4 p-2 bg-blue-50 rounded">
        <p className="text-sm text-blue-800">
          Abra o console do navegador (F12) para ver informações detalhadas.
        </p>
      </div>
      {/* Elemento para verificar se o Tailwind está aplicando estilos */}
      <div className="tailwind-check mt-4"></div>
    </div>
  );
};

export default TailwindCheck;
