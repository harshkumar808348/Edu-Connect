import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const DEBUG = true;

const ChatComponent = ({ classroomId, userId, chatType = 'classroom' }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatId, setChatId] = useState(null);
  const [error, setError] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const initializeSocket = () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      socketRef.current = io('http://localhost:5000', {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        auth: { token }
      });

      socketRef.current.on('connect', () => {
        console.log('Socket connected');
        setIsConnected(true);
        setError('');
        fetchChatHistory();
      });

      socketRef.current.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setError('Connection error');
        setIsConnected(false);
      });

      socketRef.current.on('receive-message', (message) => {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
      });
    };

    initializeSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [classroomId]);

  const fetchChatHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/chat/classroom/${classroomId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (response.ok) {
        setChatId(data._id);
        setMessages(data.messages || []);
        scrollToBottom();
      } else {
        setError(data.message || 'Failed to load chat history');
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
      setError('Failed to load chat history');
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatId || !isConnected) return;

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) {
        setError('User not authenticated');
        return;
      }

      const messageData = {
        chatId,
        message: newMessage.trim(),
        sender: {
          _id: user.id,
          name: user.name,
          type: user.type
        }
      };

      socketRef.current.emit('send-message', messageData);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      {DEBUG && (
        <div className="mb-2 flex justify-between items-center">
          <span className="text-xs text-gray-500">Chat ID: {chatId}</span>
          <button
            onClick={fetchChatHistory}
            className="text-xs text-blue-500 hover:underline"
          >
            Refresh
          </button>
        </div>
      )}

      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold">Chat</h3>
        <span className={`text-sm px-2 py-1 rounded ${
          isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>
      
      {error && (
        <div className="mb-2 p-2 bg-red-100 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      <div className="h-96 overflow-y-auto mb-4 p-4 border rounded">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500">No messages yet</div>
        ) : (
          messages.map((msg, index) => {
            // Safely check for sender properties
            const senderId = msg.sender?._id || msg.sender?.id;
            const currentUserId = userId;
            const isCurrentUser = senderId === currentUserId;

            return (
              <div
                key={index}
                className={`mb-2 ${isCurrentUser ? 'text-right' : 'text-left'}`}
              >
                <div
                  className={`inline-block p-2 rounded-lg ${
                    isCurrentUser ? 'bg-blue-500 text-white' : 'bg-gray-200'
                  }`}
                >
                  <p className="text-sm font-semibold">{msg.sender?.name || 'Unknown'}</p>
                  <p>{msg.content}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 px-3 py-2 border rounded"
          placeholder="Type your message..."
          disabled={!isConnected}
        />
        <button
          type="submit"
          className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 ${
            !isConnected && 'opacity-50 cursor-not-allowed'
          }`}
          disabled={!isConnected}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatComponent; 