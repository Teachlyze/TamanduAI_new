import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/**
 * PDF viewer component with basic navigation
 */
export const PDFViewer = ({
  src,
  title = "Visualizador de PDF",
  className = '',
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const handleLoad = () => {
    setIsLoading(false);
    // In a real implementation, you would get the total pages from the PDF library
    setTotalPages(10); // Mock total pages
  };

  const handleError = () => {
    setIsLoading(false);
    setError('Erro ao carregar PDF');
  };

  if (!src) {
    return (
      <Card className={`pdf-viewer ${className}`} {...props}>
        <CardContent className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Nenhum PDF fornecido</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`pdf-viewer ${className}`} {...props}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              Página {currentPage} de {totalPages}
            </Badge>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage <= 1}
              >
                ← Anterior
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage >= totalPages}
              >
                Próxima →
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="relative border rounded-lg overflow-hidden" style={{ height: '600px' }}>
          {isLoading && (
            <div className="absolute inset-0 bg-muted/50 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p>Carregando PDF...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 bg-destructive/10 flex items-center justify-center">
              <div className="text-center">
                <p className="text-destructive mb-2">{error}</p>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Recarregar
                </Button>
              </div>
            </div>
          )}

          {/* PDF content would be rendered here by a PDF library like react-pdf */}
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-4">📄</div>
              <p className="text-muted-foreground">PDF Viewer</p>
              <p className="text-sm text-muted-foreground mt-2">
                Integração com biblioteca PDF necessária para visualização completa
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PDFViewer;
