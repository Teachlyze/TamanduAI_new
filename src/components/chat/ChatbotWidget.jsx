import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

/**
 * Advanced chatbot widget with conversation management and AI integration
 * @param {Object} props
 * @param {string} props.title - Chat widget title
 * @param {string} props.subtitle - Chat widget subtitle
 * @param {string} props.botName - Bot display name
 * @param {string} props.botAvatar - Bot avatar URL
 * @param {string} props.userName - User display name
 * @param {string} props.userAvatar - User avatar URL
 * @param {Array} props.messages - Initial messages array
 * @param {Function} props.onSendMessage - Message send handler
 * @param {Function} props.onTypingStart - Typing indicator start handler
 * @param {Function} props.onTypingEnd - Typing indicator end handler
 * @param {boolean} props.showTypingIndicator - Show typing indicator
 * @param {boolean} props.autoScroll - Auto-scroll to bottom
 * @param {string} props.placeholder - Input placeholder text
 * @param {boolean} props.disabled - Disable message input
 * @param {string} props.className - Additional CSS classes
 */
export const [loading, setLoading] = useState(true);
  const ChatbotWidget = ({
  title = "Chatbot",
  subtitle = "Como posso ajudar?",
  botName = "Assistente",
  botAvatar,
  userName = "Você",
  userAvatar,
  messages: initialMessages = [],
  onSendMessage,
  onTypingStart,
  onTypingEnd,
  showTypingIndicator = false,
  autoScroll = true,
  placeholder = "Digite sua mensagem...",
  disabled = false,
  className = '',
  ...props
}) => {
  const [messages, setMessages] = useState(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const scrollAreaRef = useRef(null);

  // Update messages when initialMessages prop changes
  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' }, []); // TODO: Add dependencies
    }
  }, [messages, autoScroll]);

  // Handle sending messages
  const handleSendMessage = useCallback(async (messageText = inputValue.trim()) => {
    if (!messageText || disabled) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: messageText,
      timestamp: new Date(),
      sender: userName,
    };

    // Add user message
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Call external handler
    if (onSendMessage) {
      setIsTyping(true);
      onTypingStart?.();

      try {
        await onSendMessage(messageText, userMessage);
      } catch (error) {
        console.error('Error sending message:', error);
        // Add error message
        const errorMessage = {
          id: Date.now() + 1,
          type: 'bot',
          text: 'Desculpe, ocorreu um erro ao processar sua mensagem.',
          timestamp: new Date(),
          sender: botName,
          isError: true,
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsTyping(false);
        onTypingEnd?.();
      }
    }
  }, [inputValue, disabled, userName, onSendMessage, onTypingStart, onTypingEnd, botName]);

  // Handle input key press
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  // Handle input change
  const handleInputChange = useCallback((e) => {
    setInputValue(e.target.value);
  }, []);

  // Add bot message (for external control)
  const addBotMessage = useCallback((text, options = {}) => {
    const botMessage = {
      id: Date.now(),
      type: 'bot',
      text,
      timestamp: new Date(),
      sender: botName,
      ...options,
    };

    setMessages(prev => [...prev, botMessage]);
  }, [botName]);

  // Clear messages
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // Quick action buttons
  const quickActions = [
    { text: "Como você pode me ajudar?", action: "help" },
    { text: "Quais são suas funcionalidades?", action: "features" },
    { text: "Fale sobre a plataforma", action: "about" },
  ];

  const handleQuickAction = useCallback((action) => {
    const actionMessages = {
      help: "Posso ajudar com informações sobre produtos, suporte técnico, dúvidas gerais e muito mais!",
      features: "Ofereço suporte a múltiplos idiomas, integração com APIs, análise de dados e assistência personalizada.",
      about: "Esta é uma plataforma avançada de assistência virtual desenvolvida para oferecer suporte completo aos usuários.",
    };

    handleSendMessage(actionMessages[action]);
  }, [handleSendMessage]);

  // Message component
  const Message = ({ message, isLast }) => {
    const isBot = message.type === 'bot';
    const isError = message.isError;

    if (loading) return <LoadingScreen />;

  return (
      <div className={cn(
        "flex gap-3 p-4",
        isBot ? "bg-muted/30" : "bg-background",
        !isLast && "border-b"
      )}>
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage src={isBot ? botAvatar : userAvatar} />
          <AvatarFallback className={cn(
            "text-xs",
            isBot ? "bg-primary text-primary-foreground" : "bg-secondary"
          )}>
            {isBot ? botName.charAt(0) : userName.charAt(0)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm">
              {isBot ? botName : userName}
            </span>
            <span className="text-xs text-muted-foreground">
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
            {isError && (
              <Badge variant="destructive" className="text-xs">
                Erro
              </Badge>
            )}
          </div>

          <div className={cn(
            "text-sm leading-relaxed",
            isError && "text-destructive"
          )}>
            {message.text}
          </div>

          {/* Message actions */}
          {!isBot && !disabled && (
            <div className="flex gap-1 mt-2">
              <Button
                size="sm"
                variant="ghost"
                className="h-6 px-2 text-xs"
                onClick={() => {
                  setInputValue(message.text);
                  inputRef.current?.focus();
                }}
              >
                Editar
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Typing indicator component
  const TypingIndicator = () => (
    <div className="flex gap-3 p-4 bg-muted/30">
      <Avatar className="w-8 h-8 flex-shrink-0">
        <AvatarImage src={botAvatar} />
        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
          {botName.charAt(0)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-medium text-sm">{botName}</span>
          <span className="text-xs text-muted-foreground">digitando...</span>
        </div>

        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );

  if (loading) return <LoadingScreen />;

  return (
    <Card className={cn("chatbot-widget flex flex-col", className)} style={{ height: '600px' }} {...props}>
      {/* Header */}
      <CardHeader className="flex-shrink-0 border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-muted-foreground"
            >
              {isMinimized ? '⛶' : '🗕'}
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Messages area */}
      {!isMinimized && (
        <>
          <CardContent className="flex-1 p-0 overflow-hidden">
            <ScrollArea className="h-full" ref={scrollAreaRef}>
              <div className="min-h-full">
                {/* Welcome message if no messages */}
                {messages.length === 0 && (
                  <div className="flex items-center justify-center h-full p-8">
                    <div className="text-center">
                      <div className="text-4xl mb-4">🤖</div>
                      <h3 className="font-semibold mb-2">Bem-vindo ao Chatbot!</h3>
                      <p className="text-muted-foreground mb-4">
                        Estou aqui para ajudar com suas dúvidas e necessidades.
                      </p>

                      {/* Quick actions */}
                      <div className="flex flex-wrap gap-2 justify-center">
                        {quickActions.map((action, index) => (
                          <Button
                            key={index}
                            size="sm"
                            variant="outline"
                            onClick={() => handleQuickAction(action.action)}
                            className="text-xs"
                          >
                            {action.text}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Messages */}
                {messages.map((message, index) => (
                  <Message
                    key={message.id}
                    message={message}
                    isLast={index === messages.length - 1}
                  />
                ))}

                {/* Typing indicator */}
                {isTyping && showTypingIndicator && <TypingIndicator />}

                {/* Scroll anchor */}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </CardContent>

          {/* Input area */}
          <div className="flex-shrink-0 border-t p-4">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder={placeholder}
                disabled={disabled || isTyping}
                className="bg-white dark:bg-slate-900 text-foreground flex-1"
              />

              <Button
                onClick={() => handleSendMessage()}
                disabled={disabled || !inputValue.trim() || isTyping}
                size="sm"
              >
                {isTyping ? '⏳' : '📤'}
              </Button>
            </div>

            {/* Message counter */}
            {messages.length > 0 && (
              <div className="text-xs text-muted-foreground mt-2 text-center">
                {messages.length} mensagem{messages.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </>
      )}
    </Card>
  );
};

// Export additional utilities
export const useChatbot = () => {
  const [messages, setMessages] = useState([]);

  const addMessage = useCallback((message) => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      timestamp: new Date(),
      ...message,
    }]);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    addMessage,
    clearMessages,
  };
};

export default ChatbotWidget;
