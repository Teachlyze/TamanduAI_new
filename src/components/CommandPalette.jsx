import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Home,
  Users,
  BookOpen,
  Calendar,
  BarChart3,
  Settings,
  LogOut,
  Moon,
  Sun,
  Palette,
  Command,
  FileText,
  Video,
  MessageSquare
} from 'lucide-react';

/**
 * Command Palette (⌘K / Ctrl+K)
 * Quick navigation and actions
 */
export const CommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  // Commands
  const commands = useMemo(() => [
    // Navigation
    { id: 'home', label: 'Ir para Dashboard', icon: Home, action: () => navigate('/dashboard'), category: 'Navegação' },
    { id: 'classes', label: 'Ver Turmas', icon: Users, action: () => navigate('/dashboard/classes'), category: 'Navegação' },
    { id: 'activities', label: 'Ver Atividades', icon: BookOpen, action: () => navigate('/dashboard/activities'), category: 'Navegação' },
    { id: 'calendar', label: 'Ver Calendário', icon: Calendar, action: () => navigate('/dashboard/calendar'), category: 'Navegação' },
    { id: 'reports', label: 'Ver Relatórios', icon: BarChart3, action: () => navigate('/dashboard/reports'), category: 'Navegação' },
    { id: 'settings', label: 'Configurações', icon: Settings, action: () => navigate('/dashboard/settings'), category: 'Navegação' },
    
    // Actions
    { id: 'new-class', label: 'Criar Nova Turma', icon: Users, action: () => navigate('/dashboard/classes?action=new'), category: 'Ações' },
    { id: 'new-activity', label: 'Criar Nova Atividade', icon: FileText, action: () => navigate('/dashboard/activities/new'), category: 'Ações' },
    { id: 'new-meeting', label: 'Iniciar Videoconferência', icon: Video, action: () => navigate('/dashboard/meetings/new'), category: 'Ações' },
    { id: 'chat', label: 'Abrir Chat', icon: MessageSquare, action: () => navigate('/dashboard/chat'), category: 'Ações' },
    
    // Theme
    { id: 'theme-light', label: 'Tema Claro', icon: Sun, action: () => setTheme('light'), category: 'Tema' },
    { id: 'theme-dark', label: 'Tema Escuro', icon: Moon, action: () => setTheme('dark'), category: 'Tema' },
    { id: 'theme-contrast', label: 'Alto Contraste', icon: Palette, action: () => setTheme('high-contrast'), category: 'Tema' },
    
    // System
    { id: 'logout', label: 'Sair', icon: LogOut, action: () => navigate('/logout'), category: 'Sistema' }
  ], [navigate]);

  // Filter commands based on query
  const filteredCommands = useMemo(() => {
    if (!query) return commands;
    
    const lowerQuery = query.toLowerCase();
    return commands.filter(cmd =>
      cmd.label.toLowerCase().includes(lowerQuery) ||
      cmd.category.toLowerCase().includes(lowerQuery)
    );
  }, [query, commands]);

  // Group by category
  const groupedCommands = useMemo(() => {
    const groups = {};
    filteredCommands.forEach(cmd => {
      if (!groups[cmd.category]) {
        groups[cmd.category] = [];
      }
      groups[cmd.category].push(cmd);
    });
    return groups;
  }, [filteredCommands]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Open/close with ⌘K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
        setQuery('');
        setSelectedIndex(0);
      }

      if (!isOpen) return;

      // Close with Escape
      if (e.key === 'Escape') {
        setIsOpen(false);
        setQuery('');
        setSelectedIndex(0);
      }

      // Navigate with arrow keys
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      }

      // Execute with Enter
      if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
        e.preventDefault();
        executeCommand(filteredCommands[selectedIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex]);

  const setTheme = (theme) => {
    const html = document.documentElement;
    html.classList.remove('dark', 'high-contrast');
    
    if (theme === 'dark') {
      html.classList.add('dark');
    } else if (theme === 'high-contrast') {
      html.classList.add('high-contrast');
    }
    
    localStorage.setItem('theme', theme);
    setIsOpen(false);
  };

  const executeCommand = (command) => {
    command.action();
    setIsOpen(false);
    setQuery('');
    setSelectedIndex(0);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200]"
          />

          {/* Palette */}
          <div className="fixed inset-0 z-[201] flex items-start justify-center pt-[20vh] px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-2xl bg-card rounded-2xl shadow-themed-lg border border-border overflow-hidden"
            >
              {/* Search Input */}
              <div className="flex items-center gap-3 p-4 border-b border-border">
                <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSelectedIndex(0);
                  }}
                  placeholder="Digite um comando ou pesquise..."
                  className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-lg"
                  autoFocus
                />
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <kbd className="px-2 py-1 bg-muted rounded">ESC</kbd>
                  <span>para fechar</span>
                </div>
              </div>

              {/* Commands List */}
              <div className="max-h-[60vh] overflow-y-auto">
                {Object.keys(groupedCommands).length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    Nenhum comando encontrado
                  </div>
                ) : (
                  Object.entries(groupedCommands).map(([category, cmds]) => (
                    <div key={category}>
                      {/* Category Label */}
                      <div className="px-4 py-2 text-xs font-semibold text-muted-foreground bg-muted/30">
                        {category}
                      </div>

                      {/* Commands */}
                      {cmds.map((cmd, index) => {
                        const globalIndex = filteredCommands.indexOf(cmd);
                        const isSelected = globalIndex === selectedIndex;

                        return (
                          <motion.button
                            key={cmd.id}
                            onClick={() => executeCommand(cmd)}
                            onMouseEnter={() => setSelectedIndex(globalIndex)}
                            className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                              isSelected
                                ? 'bg-primary/10 border-l-2 border-primary'
                                : 'hover:bg-muted/50 border-l-2 border-transparent'
                            }`}
                          >
                            <cmd.icon className={`w-5 h-5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                            <span className={`flex-1 text-left ${isSelected ? 'text-foreground font-medium' : 'text-foreground'}`}>
                              {cmd.label}
                            </span>
                            {isSelected && (
                              <kbd className="px-2 py-1 bg-muted rounded text-xs">↵</kbd>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-border bg-muted/30 flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Command className="w-4 h-4" />
                  <span>Use ⌘K ou Ctrl+K para abrir</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>↑↓ navegar</span>
                  <span>•</span>
                  <span>↵ selecionar</span>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
