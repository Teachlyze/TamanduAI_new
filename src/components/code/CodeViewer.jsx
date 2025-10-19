import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/**
 * Code viewer with syntax highlighting and line numbers
 */
export const CodeViewer = ({
  code = '',
  language = 'javascript',
  showLineNumbers = true,
  readOnly = true,
  className = '',
  ...props
}) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const lines = code.split('\n');

  return (
    <Card className={`code-viewer ${className}`} {...props}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {language.charAt(0).toUpperCase() + language.slice(1)}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{lines.length} linhas</Badge>
          <Button size="sm" variant="outline" onClick={copyToClipboard}>
            {copied ? '✅' : '📋'} Copiar
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <pre className={`p-4 text-sm overflow-auto ${readOnly ? '' : 'border'}`}>
          {showLineNumbers && (
            <div className="flex">
              <div className="pr-4 text-muted-foreground border-r mr-4 select-none">
                {lines.map((_, index) => (
                  <div key={index} className="leading-6">
                    {index + 1}
                  </div>
                ))}
              </div>
              <div className="flex-1">
                {lines.map((line, index) => (
                  <div key={index} className="leading-6">
                    {line || ' '}
                  </div>
                ))}
              </div>
            </div>
          )}

          {!showLineNumbers && (
            <code className="block whitespace-pre-wrap">
              {code}
            </code>
          )}
        </pre>
      </CardContent>
    </Card>
  );
};

export default CodeViewer;
