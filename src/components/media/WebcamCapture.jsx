import React, { useCallback, useEffect, useRef, useState } from 'react';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/**
 * Webcam capture component for taking photos and recording video
 */
export const [loading, setLoading] = useState(true);
  const WebcamCapture = ({
  onCapture,
  onRecord,
  mode = 'photo', // 'photo' | 'video'
  className = '',
  ...props
}) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);

  const [isStreaming, setIsStreaming] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [error, setError] = useState(null);

  // Start camera stream
  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: mode === 'video'
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsStreaming(true);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Erro ao acessar câmera. Verifique as permissões.');
    }
  }, [mode]);

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsStreaming(false);
  }, []);

  // Capture photo
  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0);

    const dataURL = canvas.toDataURL('image/png');
    onCapture?.(dataURL);
  }, [onCapture]);

  // Start recording
  const startRecording = useCallback(() => {
    if (!streamRef.current) return;

    setRecordedChunks([]);
    setIsRecording(true);

    const mediaRecorder = new MediaRecorder(streamRef.current);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        setRecordedChunks(prev => [...prev, event.data]);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      onRecord?.(url, blob);
    };

    mediaRecorder.start();
  }, [recordedChunks, onRecord]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  // Cleanup on unmount
  useEffect(() => {
  return () => {
      stopCamera();
    };
  }, [stopCamera]);
  return (
    <Card className={`webcam-capture ${className}`} {...props}>
      <CardHeader>
        <CardTitle>
          {mode === 'photo' ? 'Captura de Foto' : 'Gravação de Vídeo'}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Camera view */}
          <div className="relative border rounded-lg overflow-hidden" style={{ height: '300px' }}>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />

            {/* Recording indicator */}
            {isRecording && (
              <div className="absolute top-4 left-4">
                <Badge variant="destructive" className="animate-pulse">
                  🔴 Gravando
                </Badge>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="absolute inset-0 bg-destructive/10 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-destructive mb-2">{error}</p>
                  <Button variant="outline" onClick={startCamera}>
                    Tentar Novamente
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Hidden canvas for photo capture */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Controls */}
          <div className="flex justify-center gap-2">
            {!isStreaming ? (
              <Button onClick={startCamera}>
                📷 Iniciar Câmera
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={stopCamera}>
                  ⏹️ Parar Câmera
                </Button>

                {mode === 'photo' ? (
                  <Button onClick={capturePhoto}>
                    📸 Capturar Foto
                  </Button>
                ) : (
                  <>
                    {!isRecording ? (
                      <Button onClick={startRecording}>
                        🎥 Iniciar Gravação
                      </Button>
                    ) : (
                      <Button variant="destructive" onClick={stopRecording}>
                        ⏹️ Parar Gravação
                      </Button>
                    )}
                  </>
                )}
              </>
            )}
          </div>

          {/* Instructions */}
          <div className="text-sm text-muted-foreground text-center">
            {mode === 'photo'
              ? 'Clique em "Capturar Foto" para tirar uma foto'
              : 'Clique em "Iniciar Gravação" para começar a gravar vídeo'
            }
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WebcamCapture;
