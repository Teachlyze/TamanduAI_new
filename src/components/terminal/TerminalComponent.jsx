import React, { useCallback, useEffect, useRef, useState } from 'react';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

/**
 * Terminal component with command execution and history
 */
export const [loading, setLoading] = useState(true);
  const TerminalComponent = ({
  commands = [],
  onCommandExecute,
  readOnly = false,
  showHeader = true,
  className = '',
  ...props
}) => {
  const [history, setHistory] = useState([]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isExecuting, setIsExecuting] = useState(false);

  const inputRef = useRef(null);
  const scrollAreaRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [history]);

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current && !readOnly) {
      inputRef.current.focus();
    }
  }, [readOnly]);

  // Handle command execution
  const executeCommand = useCallback(async (command) => {
    if (!command.trim()) return;

    setIsExecuting(true);

    const commandEntry = {
      id: Date.now(),
      type: 'input',
      command: command,
      timestamp: new Date(),
    };

    setHistory(prev => [...prev, commandEntry]);
    setCommandHistory(prev => [...prev, command]);
    setHistoryIndex(-1);

    try {
      if (onCommandExecute) {
        const output = await onCommandExecute(command);

        const outputEntry = {
          id: Date.now() + 1,
          type: 'output',
          content: output,
          timestamp: new Date(),
        };

        setHistory(prev => [...prev, outputEntry]);
      }
    } catch (error) {
      const errorEntry = {
        id: Date.now() + 2,
        type: 'error',
        content: `Error: ${error.message}`,
        timestamp: new Date(),
      };

      setHistory(prev => [...prev, errorEntry]);
    } finally {
      setIsExecuting(false);
    }
  }, [onCommandExecute]);

  // Handle input key press
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      executeCommand(currentCommand);
      setCurrentCommand('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex >= 0) {
        const newIndex = historyIndex + 1;
        if (newIndex < commandHistory.length) {
          setHistoryIndex(newIndex);
          setCurrentCommand(commandHistory[newIndex]);
        } else {
          setHistoryIndex(-1);
          setCurrentCommand('');
        }
      }
    }
  }, [currentCommand, commandHistory, historyIndex, executeCommand]);

  // Handle input change
  const handleInputChange = useCallback((e) => {
    setCurrentCommand(e.target.value);
  }, []);

  // Clear terminal
  const clearTerminal = useCallback(() => {
    setHistory([]);
  }, []);
  return (
    <Card className={`terminal-component ${className}`} {...props}>
      {showHeader && (
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Terminal</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-white dark:bg-slate-900 text-foreground border-border text-xs">
              {history.length} comandos
            </Badge>
            <Button size="sm" variant="outline" onClick={clearTerminal}>
              Limpar
            </Button>
          </div>
        </CardHeader>
      )}

      <CardContent className="p-0">
        <div className="relative h-96">
          <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
            <div className="space-y-2 font-mono text-sm">
              {/* Welcome message */}
              {history.length === 0 && (
                <div className="text-muted-foreground">
                  <div className="mb-2">Bem-vindo ao Terminal Interativo</div>
                  <div className="text-xs">Digite "help" para ver comandos disponíveis</div>
                </div>
              )}

              {/* Command history */}
              {history.map((entry) => (
                <div key={entry.id} className="space-y-1">
                  {entry.type === 'input' && (
                    <div className="flex items-center gap-2">
                      <span className="text-green-500">$</span>
                      <span>{entry.command}</span>
                    </div>
                  )}

                  {entry.type === 'output' && (
                    <div className="text-muted-foreground pl-4 whitespace-pre-wrap">
                      {entry.content}
                    </div>
                  )}

                  {entry.type === 'error' && (
                    <div className="text-red-400 pl-4">
                      {entry.content}
                    </div>
                  )}
                </div>
              ))}

              {/* Current command input (when not executing) */}
              {!isExecuting && !readOnly && (
                <div className="flex items-center gap-2 sticky bottom-0 bg-background">
                  <span className="text-green-500">$</span>
                  <Input
                    ref={inputRef}
                    value={currentCommand}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyPress}
                    placeholder="Digite um comando..."
                    className="bg-white dark:bg-slate-900 text-foreground border-none shadow-none focus-visible:ring-0 p-0 h-auto font-mono"
                  />
                </div>
              )}

              {/* Loading indicator */}
              {isExecuting && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="text-green-500">$</span>
                  <span>{currentCommand}</span>
                  <div className="animate-pulse">▊</div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};

export default TerminalComponent;
