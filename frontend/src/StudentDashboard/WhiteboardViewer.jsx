import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const WhiteboardViewer = ({ classroomId }) => {
  const canvasRef = useRef(null);
  const socketRef = useRef(null);
  const [whiteboardId, setWhiteboardId] = useState(null);
  const [error, setError] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState('none'); // 'none', 'pending', 'approved', 'rejected'
  const [isApproved, setIsApproved] = useState(false);

  useEffect(() => {
    if (classroomId) {
      fetchWhiteboard();
    }
  }, [classroomId]);

  useEffect(() => {
    if (!whiteboardId) return;
    
    const initCanvas = () => {
      const ctx = canvasRef.current.getContext('2d');
      ctx.lineCap = 'round';
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#000';
    };

    const initSocket = () => {
      socketRef.current = io('http://localhost:5000', {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        query: { 
          whiteboardId,
          classroom: classroomId,
          type: 'student'
        }
      });

      socketRef.current.on('connect', () => {
        console.log('Connected to whiteboard:', whiteboardId);
        setIsConnected(true);
        socketRef.current.emit('join-whiteboard', whiteboardId);
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('Connection error:', error);
        setIsConnected(false);
        setError('Failed to connect to whiteboard server');
      });

      socketRef.current.on('draw', (data) => {
        console.log('Received drawing data:', data);
        if (!canvasRef.current) return;
        
        const ctx = canvasRef.current.getContext('2d');
        ctx.beginPath();
        ctx.moveTo(data.startX, data.startY);
        ctx.lineTo(data.endX, data.endY);
        ctx.stroke();
      });

      socketRef.current.on('clear', () => {
        if (!canvasRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      });
    };

    initCanvas();
    initSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [whiteboardId, classroomId]);

  useEffect(() => {
    if (whiteboardId) {
      checkPermissionStatus();
      const interval = setInterval(checkPermissionStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [whiteboardId]);

  const checkPermissionStatus = async (boardId = whiteboardId) => {
    if (!boardId) return;
    
    try {
      const response = await fetch(
        `http://localhost:5000/api/whiteboard/${boardId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      const data = await response.json();
      console.log('Permission status:', data);
      if (response.ok) {
        const userId = JSON.parse(localStorage.getItem('user')).id;
        const approved = data.approvedStudents.includes(userId);
        setIsApproved(approved);
        setPermissionStatus(approved ? 'approved' : 'pending');
      }
    } catch (error) {
      console.error('Failed to check permission status:', error);
    }
  };

  const fetchWhiteboard = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/whiteboard/classroom/${classroomId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      const data = await response.json();
      console.log('Fetched whiteboard:', data);
      if (response.ok && data) {
        setWhiteboardId(data._id);
        checkPermissionStatus(data._id);
      }
    } catch (error) {
      console.error('Failed to fetch whiteboard:', error);
      setError('Failed to connect to whiteboard');
    }
  };

  const fetchDrawingData = async () => {
    if (!whiteboardId) return;
    
    try {
      const response = await fetch(
        `http://localhost:5000/api/whiteboard/${whiteboardId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      const data = await response.json();
      if (response.ok && data.drawingData) {
        // Draw existing data
        const image = new Image();
        image.onload = () => {
          const ctx = canvasRef.current.getContext('2d');
          ctx.drawImage(image, 0, 0);
        };
        image.src = data.drawingData;
      }
    } catch (error) {
      console.error('Failed to fetch drawing data');
    }
  };

  const requestPermission = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/whiteboard/${whiteboardId}/request-permission`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.ok) {
        setPermissionStatus('pending');
      }
    } catch (error) {
      setError('Failed to request permission');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Teacher's Whiteboard</h3>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded text-sm ${
            isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
          {whiteboardId && permissionStatus === 'none' && (
            <button
              onClick={requestPermission}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Request Access
            </button>
          )}
          {permissionStatus === 'pending' && (
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
              Waiting for teacher's approval
            </span>
          )}
          {permissionStatus === 'approved' && (
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
              Access Granted
            </span>
          )}
        </div>
      </div>
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      {isApproved ? (
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="border border-gray-300 rounded"
        />
      ) : (
        <div className="h-[600px] border border-gray-300 rounded flex items-center justify-center text-gray-500">
          {permissionStatus === 'none' ? 
            'Request access to view the whiteboard' : 
            'Waiting for teacher to approve your request'
          }
        </div>
      )}
    </div>
  );
};

export default WhiteboardViewer; 