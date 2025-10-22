import React, { useCallback, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/**
 * Signature pad component for digital signatures
 */
export const SignaturePad = ({
  onSave,
  onClear,
  width = 400,
  height = 200,
  className = '',
  ...props
}) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);

  // Get mouse/touch position relative to canvas
  const getPosition = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX, clientY;

    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }, []);

  // Start drawing
  const startDrawing = useCallback((e) => {
    const pos = getPosition(e);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    if (!canvas || !ctx) return;

    setIsDrawing(true);
    setIsEmpty(false);

    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }, [getPosition]);

  // Draw
  const draw = useCallback((e) => {
    if (!isDrawing) return;

    const pos = getPosition(e);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    if (!canvas || !ctx) return;

    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  }, [isDrawing, getPosition]);

  // Stop drawing
  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
  }, []);

  // Clear signature
  const clearSignature = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
    onClear?.();
  }, [onClear]);

  // Save signature
  const saveSignature = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || isEmpty) return;

    const dataURL = canvas.toDataURL('image/png');
    onSave?.(dataURL);
  }, [isEmpty, onSave]);

  return (
    <Card className={`signature-pad ${className}`} {...props}>
      <CardHeader>
        <CardTitle>Assinatura Digital</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Signature canvas */}
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
            <canvas
              ref={canvasRef}
              width={width}
              height={height}
              className="border border-muted-foreground/25 rounded cursor-crosshair touch-none"
              style={{ maxWidth: '100%', height: 'auto' }}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseOut={stopDrawing}
              onTouchStart={(e) => {
                e.preventDefault();
                startDrawing(e);
              }}
              onTouchMove={(e) => {
                e.preventDefault();
                draw(e);
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                stopDrawing();
              }}
            />
          </div>

          {/* Controls */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={clearSignature}>
              🗑️ Limpar
            </Button>

            <Button onClick={saveSignature} disabled={isEmpty}>
              💾 Salvar Assinatura
            </Button>
          </div>

          {/* Instructions */}
          <div className="text-sm text-muted-foreground text-center">
            Use o mouse ou toque para assinar no quadro acima
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SignaturePad;
