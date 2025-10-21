
const HMRTest = () => {
  const [messages, setMessages] = useState(['HMR Test - ' + new Date().toLocaleTimeString()]);
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // This will help verify HMR is working
    const timer = setInterval(() => {
      setMessages(prev => [...prev, 'HMR update: ' + new Date().toLocaleTimeString()]);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const connectWebSocket = () => {
    try {
      const ws = new WebSocket('ws://localhost:3000/');
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setMessages(prev => [...prev, '✅ Connected to WebSocket']);
      };

      ws.onmessage = (event) => {
        console.log('Message from server:', event.data);
        setMessages(prev => [...prev, `Received: ${event.data}`]);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setMessages(prev => [...prev, `❌ WebSocket error: ${error.message || 'Unknown error'}`]);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        setMessages(prev => [...prev, '❌ WebSocket disconnected']);
      };

      setSocket(ws);

      return () => {
        if (ws) ws.close();
      };
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      setMessages(prev => [...prev, `❌ Error: ${error.message}`]);
    }
  };

  const sendMessage = () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      const message = `Test message at ${new Date().toLocaleTimeString()}`;
      socket.send(message);
      setMessages(prev => [...prev, `You: ${message}`]);
    } else {
      setMessages(prev => [...prev, 'Not connected to WebSocket']);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>HMR & WebSocket Test</h1>
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={connectWebSocket} 
          disabled={isConnected}
          style={{ 
            padding: '10px 15px', 
            marginRight: '10px',
            backgroundColor: isConnected ? '#4CAF50' : '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {isConnected ? 'Connected' : 'Connect to WebSocket'}
        </button>
        <button 
          onClick={sendMessage}
          disabled={!isConnected}
          style={{ 
            padding: '10px 15px', 
            backgroundColor: isConnected ? '#2196F3' : '#cccccc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isConnected ? 'pointer' : 'not-allowed',
            opacity: isConnected ? 1 : 0.6
          }}
        >
          Send Test Message
        </button>
      </div>
      <div style={{
        height: '400px',
        overflowY: 'auto',
        border: '1px solid #ccc',
        padding: '10px',
        backgroundColor: '#f9f9f9',
        borderRadius: '4px'
      }}>
        {messages.map((msg, index) => (
          <div key={index} style={{
            padding: '5px 0',
            borderBottom: '1px solid #eee',
            fontFamily: 'monospace',
            color: msg.includes('❌') ? '#d32f2f' : 
                  msg.includes('✅') ? '#2e7d32' : 'inherit'
          }}>
            {msg}
          </div>
        ))}
      </div>
      <div style={{ marginTop: '20px', color: '#666' }}>
        <p>This component updates every 5 seconds to test HMR.</p>
        <p>WebSocket connection status: <strong>{isConnected ? 'Connected' : 'Disconnected'}</strong></p>
      </div>
    </div>
  );
};

export default HMRTest;
