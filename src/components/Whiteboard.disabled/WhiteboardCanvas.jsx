import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Interactive whiteboard canvas component with drawing capabilities
 * @param {Object} props
 * @param {number} props.width - Canvas width
 * @param {number} props.height - Canvas height
 * @param {string} props.strokeColor - Default stroke color
 * @param {number} props.strokeWidth - Default stroke width
 * @param {Function} props.onSave - Callback when canvas is saved
 * @param {Function} props.onClear - Callback when canvas is cleared
 * @param {boolean} props.readOnly - Whether the canvas is read-only
 * @param {string} props.className - Additional CSS classes
 */
export const [loading, setLoading] = useState(true);
  const WhiteboardCanvas = ({
  width = 800,
  height = 600,
  strokeColor = '#000000',
  strokeWidth = 2,
  onSave,
  onClear,
  readOnly = false,
  className = '',
  ...props
}) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState('pen'); // 'pen', 'eraser'
  const [currentColor, setCurrentColor] = useState(strokeColor);
  const [currentWidth, setCurrentWidth] = useState(strokeWidth);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

  // Drawing context
  const ctxRef = useRef(null);

  // Initialize canvas context
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctxRef.current = ctx;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Initialize canvas with white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);

    // Set initial drawing properties
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = currentWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

  }, [width, height, currentColor, currentWidth]);

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
    if (readOnly) return;

    const pos = getPosition(e);
    setLastPos(pos);
    setIsDrawing(true);

    const ctx = ctxRef.current;
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);

    if (currentTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = currentWidth;
    }
  }, [readOnly, getPosition, currentTool, currentColor, currentWidth]);

  // Draw
  const draw = useCallback((e) => {
    if (!isDrawing || readOnly) return;

    const pos = getPosition(e);
    const ctx = ctxRef.current;
    if (!ctx) return;

    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    setLastPos(pos);
  }, [isDrawing, readOnly, getPosition]);

  // Stop drawing
  const stopDrawing = useCallback(() => {
    setIsDrawing(false);

    const ctx = ctxRef.current;
    if (!ctx) return;

    ctx.globalCompositeOperation = 'source-over';
  }, []);

  // Clear canvas
  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;

    if (!canvas || !ctx) return;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (onClear) {
      onClear();
    }
  }, [onClear]);

  // Save canvas as image
  const saveCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataURL = canvas.toDataURL('image/png');

    if (onSave) {
      onSave(dataURL);
    }

    // Also trigger download
    const link = document.createElement('a');
    link.download = 'whiteboard-canvas.png';
    link.href = dataURL;
    link.click();
  }, [onSave]);

  // Handle tool changes
  const handleToolChange = useCallback((tool) => {
    setCurrentTool(tool);

    const ctx = ctxRef.current;
    if (!ctx) return;

    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = currentWidth;
    }
  }, [currentColor, currentWidth]);

  if (loading) return <LoadingScreen />;

  return (
    <Card className={`whiteboard-canvas ${className}`} {...props}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle>Whiteboard Canvas</CardTitle>

          {!readOnly && (
            <div className="flex items-center gap-2">
              {/* Drawing Tools */}
              <div className="flex items-center gap-1 border rounded-lg p-1">
                <Button
                  size="sm"
                  variant={currentTool === 'pen' ? 'default' : 'outline'}
                  onClick={() => handleToolChange('pen')}
                  className="px-2"
                >
                  ✏️
                </Button>
                <Button
                  size="sm"
                  variant={currentTool === 'eraser' ? 'default' : 'outline'}
                  onClick={() => handleToolChange('eraser')}
                  className="px-2"
                >
                  🧽
                </Button>
              </div>

              {/* Color Picker */}
              <div className="flex items-center gap-1">
                {['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'].map((color) => (
                  <button
                    key={color}
                    className={`w-6 h-6 rounded-full border-2 ${
                      currentColor === color ? 'border-gray-800' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      setCurrentColor(color);
                      if (ctxRef.current) {
                        ctxRef.current.strokeStyle = color;
                      }
                    }}
                  />
                ))}
              </div>

              {/* Stroke Width */}
              <div className="flex items-center gap-1">
                {[1, 3, 5, 8].map((width) => (
                  <button
                    key={width}
                    className={`w-8 h-8 rounded border-2 flex items-center justify-center text-xs ${
                      currentWidth === width ? 'border-gray-800 bg-gray-100' : 'border-gray-300'
                    }`}
                    onClick={() => {
                      setCurrentWidth(width);
                      if (ctxRef.current) {
                        ctxRef.current.lineWidth = width;
                      }
                    }}
                  >
                    {width}
                  </button>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <Button size="sm" variant="outline" onClick={clearCanvas}>
                  🗑️ Limpar
                </Button>
                <Button size="sm" onClick={saveCanvas}>
                  💾 Salvar
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="relative border rounded-lg overflow-hidden">
          <canvas
            ref={canvasRef}
            className="block cursor-crosshair"
            style={{
              maxWidth: '100%',
              height: 'auto',
              touchAction: 'none' // Prevent scrolling on touch devices
            }}
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

          {readOnly && (
            <div className="absolute inset-0 bg-gray-50 bg-opacity-50 flex items-center justify-center">
              <span className="text-gray-500 text-lg">Modo somente leitura</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WhiteboardCanvas;
