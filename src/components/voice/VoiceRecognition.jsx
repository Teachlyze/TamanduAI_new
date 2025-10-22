import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

/**
 * Voice recognition component for speech-to-text functionality
 */
export const [loading, setLoading] = useState(true);
const VoiceRecognition = ({
  onResult,
  onError,
  language = "pt-BR",
  continuous = false,
  interimResults = true,
  className = "",
  ...props
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [finalTranscript, setFinalTranscript] = useState("");
  const [error, setError] = useState(null);

  const recognitionRef = useRef(null);
  const timeoutRef = useRef(null);

  // Check for browser support
  const isSupported =
    "webkitSpeechRecognition" in window || "SpeechRecognition" in window;

  // Initialize speech recognition
  useEffect(() => {
    if (!isSupported) {
      setError("Reconhecimento de voz não é suportado neste navegador");
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.lang = language;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      setTranscript("");
      setInterimTranscript("");
      setFinalTranscript("");
    };

    recognition.onresult = (event) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      setInterimTranscript(interimTranscript);
      setFinalTranscript(finalTranscript);

      if (finalTranscript) {
        setTranscript((prev) => prev + finalTranscript);
        onResult?.(finalTranscript);

        // Auto-stop if not continuous
        if (!continuous) {
          setTimeout(() => stopListening(), 1000);
        }
      }
    };

    recognition.onerror = (event) => {
      setError(`Erro no reconhecimento: ${event.error}`);
      setIsListening(false);
      onError?.(event.error);
    };

    recognition.onend = () => {
      setIsListening(false);

      // Auto-restart if continuous mode and no error
      if (continuous && !error) {
        timeoutRef.current = setTimeout(() => {
          startListening();
        }, 1000);
      }
    };

    recognitionRef.current = recognition;

    /* if (loading) return <LoadingScreen />; */

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [
    isSupported,
    continuous,
    interimResults,
    language,
    onResult,
    onError,
    error,
  ]);

  // Start listening
  const startListening = useCallback(() => {
    if (!recognitionRef.current || !isSupported) return;

    setError(null);
    recognitionRef.current.start();
  }, [isSupported]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;

    recognitionRef.current.stop();
  }, []);

  // Clear transcript
  const clearTranscript = useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
    setFinalTranscript("");
  }, []);

  if (!isSupported) {
    /* if (loading) return <LoadingScreen />; */

    return (
      <Card className={`voice-recognition ${className}`} {...props}>
        <CardContent className="flex items-center justify-center h-32">
          <p className="text-muted-foreground">
            Reconhecimento de voz não é suportado neste navegador
          </p>
        </CardContent>
      </Card>
    );
  }

  /* if (loading) return <LoadingScreen />; */

  return (
    <Card className={`voice-recognition ${className}`} {...props}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Reconhecimento de Voz</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={isListening ? "default" : "secondary"}>
              {isListening ? "🎤 Ouvindo" : "🔇 Silenciado"}
            </Badge>
            <span className="text-sm text-muted-foreground">{language}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Transcript display */}
          <div className="border rounded-lg p-4 min-h-[100px]">
            <ScrollArea className="h-full">
              <div className="space-y-2">
                {transcript && (
                  <div className="text-sm">
                    <strong>Transcrição:</strong>
                    <p className="mt-1">{transcript}</p>
                  </div>
                )}

                {interimTranscript && (
                  <div className="text-sm text-muted-foreground italic">
                    <strong>Interino:</strong>
                    <p className="mt-1">{interimTranscript}</p>
                  </div>
                )}

                {!transcript && !interimTranscript && (
                  <div className="text-sm text-muted-foreground text-center">
                    Clique em "Iniciar" para começar o reconhecimento de voz
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-2">
            {!isListening ? (
              <Button onClick={startListening}>
                🎤 Iniciar Reconhecimento
              </Button>
            ) : (
              <Button variant="destructive" onClick={stopListening}>
                ⏹️ Parar Reconhecimento
              </Button>
            )}

            <Button variant="outline" onClick={clearTranscript}>
              🗑️ Limpar
            </Button>
          </div>

          {/* Error message */}
          {error && (
            <div className="text-sm text-destructive text-center">{error}</div>
          )}

          {/* Instructions */}
          <div className="text-sm text-muted-foreground text-center">
            {continuous
              ? "O reconhecimento continuará automaticamente até ser parado manualmente"
              : 'Fale após clicar em "Iniciar" - será interrompido automaticamente'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VoiceRecognition;
