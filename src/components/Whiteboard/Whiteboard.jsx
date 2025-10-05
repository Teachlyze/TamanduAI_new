import { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, Space, Tooltip, Spin, message } from 'antd';
import { 
  SaveOutlined, 
  UndoOutlined, 
  RedoOutlined, 
  ClearOutlined,
  CloudUploadOutlined,
  CloudDownloadOutlined
} from '@ant-design/icons';
import useWhiteboard from '../../hooks/useWhiteboard';
import './Whiteboard.css';

/**
 * Whiteboard component that integrates with Agora's Interactive Whiteboard
 * @param {Object} props - Component props
 * @param {string} props.roomId - The ID of the whiteboard room
 * @param {string} props.userId - The ID of the current user
 * @param {string} [props.userName] - The display name of the current user
 * @param {Function} [props.onInitialized] - Callback when whiteboard is initialized
 * @param {Function} [props.onError] - Error handler callback
 * @param {boolean} [props.readonly=false] - Whether the whiteboard is read-only
 * @param {Object} [props.style] - Additional styles for the container
 * @param {string} [props.className] - Additional CSS class for the container
 */
const Whiteboard = ({
  roomId,
  userId,
  userName,
  onInitialized,
  onError,
  readonly = false,
  style,
  className = ''
}) => {
  const containerRef = useRef(null);
  
  const {
    isLoading,
    error,
    canUndo,
    canRedo,
    isConnected,
    initialize,
    mount,
    undo,
    redo,
    clear,
    save
  } = useWhiteboard({
    roomId,
    userId,
    userName,
    readonly
  });

  // Initialize and mount the whiteboard
  useEffect(() => {
    const init = async () => {
      try {
        const app = await initialize();
        onInitialized?.(app);
      } catch (err) {
        onError?.(err);
      }
    };

    if (roomId && userId) {
      init();
    }

    return () => {
      // Cleanup is handled by the useWhiteboard hook
    };
  }, [roomId, userId, initialize, onInitialized, onError]);

  // Mount the whiteboard to the container when it's ready
  useEffect(() => {
    if (containerRef.current && !isLoading && !error) {
      mount(containerRef.current);
    }
  }, [mount, isLoading, error]);

  // Handle save action
  const handleSave = async () => {
    try {
      const result = await save();
      message.success('Whiteboard saved successfully');
      return result;
    } catch (err) {
      console.error('Failed to save whiteboard:', err);
      message.error('Failed to save whiteboard');
      throw err;
    }
  };

  // Handle clear action
  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear the whiteboard?')) {
      clear();
    }
  };

  // Connection status indicator
  const renderStatusIndicator = () => (
    <span 
      style={{
        display: 'inline-block',
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: isConnected ? '#52c41a' : '#f5222d',
        marginRight: '6px'
      }}
    />
  );

  return (
    <div 
      className={`whiteboard-container ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
        ...style
      }}
    >
      {/* Toolbar */}
      <div 
        style={{
          padding: '8px 16px',
          background: '#fff',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 10,
          boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)'
        }}
      >
        <Space>
          <div style={{ display: 'flex', alignItems: 'center', marginRight: '16px' }}>
            {renderStatusIndicator()}
            <span style={{ fontSize: '12px', color: '#666' }}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          
          <Tooltip title="Undo">
            <Button 
              size="small"
              icon={<UndoOutlined />} 
              onClick={undo}
              disabled={!canUndo || readonly || !isConnected}
            />
          </Tooltip>
          
          <Tooltip title="Redo">
            <Button 
              size="small"
              icon={<RedoOutlined />} 
              onClick={redo}
              disabled={!canRedo || readonly || !isConnected}
            />
          </Tooltip>
          
          <Tooltip title="Clear">
            <Button 
              size="small"
              icon={<ClearOutlined />} 
              onClick={handleClear}
              disabled={readonly || !isConnected}
              danger
            />
          </Tooltip>
        </Space>
        
        <Space>
          <Tooltip title="Upload document">
            <Button 
              size="small"
              icon={<CloudUploadOutlined />} 
              disabled={readonly || !isConnected}
            />
          </Tooltip>
          
          <Tooltip title="Download">
            <Button 
              size="small"
              icon={<CloudDownloadOutlined />}
              disabled={!isConnected}
            />
          </Tooltip>
          
          <Tooltip title="Save">
            <Button 
              type="primary" 
              size="small"
              icon={<SaveOutlined />} 
              onClick={handleSave}
              disabled={readonly || !isConnected}
            >
              Save
            </Button>
          </Tooltip>
        </Space>
      </div>

      {/* Error message */}
      {error && (
        <div style={{ 
          padding: '8px 16px', 
          background: '#fff2f0', 
          borderBottom: '1px solid #ffccc7',
          color: '#f5222d'
        }}>
          {error.message || 'Failed to load whiteboard. Please try again.'}
        </div>
      )}

      {/* Whiteboard container */}
      <div 
        ref={containerRef} 
        className="whiteboard" 
        style={{ 
          flex: 1,
          minHeight: '400px',
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#f5f5f5',
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.3s ease-in-out'
        }} 
      />
      
      {/* Loading overlay */}
      {isLoading && (
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            zIndex: 20
          }}
        >
          <Spin size="large" tip="Loading whiteboard..." />
        </div>
      )}
    </div>
  );
};

Whiteboard.propTypes = {
  roomId: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  userName: PropTypes.string,
  onInitialized: PropTypes.func,
  onError: PropTypes.func,
  readonly: PropTypes.bool,
  style: PropTypes.object,
  className: PropTypes.string
};

export default Whiteboard;
