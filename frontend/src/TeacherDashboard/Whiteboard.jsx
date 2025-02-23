import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const Whiteboard = ({ classroomId }) => {
  const canvasRef = useRef(null);
  const socketRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [whiteboardId, setWhiteboardId] = useState(null);
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState('');
  const lastPoint = useRef(null);
  const [pendingPermissions, setPendingPermissions] = useState([]);

  useEffect(() => {
    socketRef.current = io('http://localhost:5000', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      query: { 
        type: 'teacher',
        classroom: classroomId
      }
    });

    socketRef.current.on('connect', () => {
      console.log('Teacher connected to server');
      setError('');
    });

    const ctx = canvasRef.current.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#000';

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (!whiteboardId) return;
    
    socketRef.current.emit('join-whiteboard', whiteboardId);
    
    socketRef.current.on('draw', (data) => {
      const ctx = canvasRef.current.getContext('2d');
      ctx.beginPath();
      ctx.moveTo(data.startX, data.startY);
      ctx.lineTo(data.endX, data.endY);
      ctx.stroke();
    });

    socketRef.current.on('clear', () => {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    });
  }, [whiteboardId]);

  useEffect(() => {
    if (isSharing && whiteboardId) {
      fetchPendingPermissions();
      const interval = setInterval(fetchPendingPermissions, 5000);
      return () => clearInterval(interval);
    }
  }, [isSharing, whiteboardId]);

  const startSharing = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/whiteboard/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ classroomId })
      });

      const data = await response.json();
      console.log('Created whiteboard:', data);
      if (response.ok) {
        setWhiteboardId(data._id);
        setIsSharing(true);
        
        // Join the whiteboard room after creating
        socketRef.current.emit('join-whiteboard', data._id);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Failed to start sharing:', error);
      setError(error.message);
    }
  };

  const startDrawing = (e) => {
    setIsDrawing(true);
    const rect = canvasRef.current.getBoundingClientRect();
    lastPoint.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const draw = (e) => {
    if (!isDrawing || !isSharing) return;
    
    const ctx = canvasRef.current.getContext('2d');
    const rect = canvasRef.current.getBoundingClientRect();
    const endX = e.clientX - rect.left;
    const endY = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    console.log('Emitting draw event:', {
      whiteboardId,
      startX: lastPoint.current.x,
      startY: lastPoint.current.y,
      endX,
      endY,
      classroom: classroomId
    });

    socketRef.current.emit('draw', {
      whiteboardId,
      startX: lastPoint.current.x,
      startY: lastPoint.current.y,
      endX,
      endY,
      classroom: classroomId
    });

    lastPoint.current = { x: endX, y: endY };
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    if (isSharing) {
      socketRef.current.emit('clear', whiteboardId);
    }
  };

  const fetchPendingPermissions = async () => {
    if (!whiteboardId) return;
    
    try {
      const response = await fetch(
        `http://localhost:5000/api/whiteboard/${whiteboardId}/permissions`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      const data = await response.json();
      if (response.ok) {
        setPendingPermissions(data);
      }
    } catch (error) {
      console.error('Failed to fetch permissions');
    }
  };

  const handlePermission = async (studentId, status) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/whiteboard/${whiteboardId}/permission/${studentId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ status })
        }
      );
      
      if (response.ok) {
        fetchPendingPermissions();
      }
    } catch (error) {
      console.error('Failed to update permission');
    }
  };

  const saveDrawingData = async () => {
    if (!whiteboardId) return;

    try {
      const drawingData = canvasRef.current.toDataURL();
      await fetch(`http://localhost:5000/api/whiteboard/${whiteboardId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ drawingData })
      });
    } catch (error) {
      console.error('Failed to save drawing data');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Whiteboard</h3>
        <div className="space-x-2">
          <button
            onClick={clearCanvas}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Clear
          </button>
          <button
            onClick={startSharing}
            disabled={isSharing}
            className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 ${
              isSharing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSharing ? 'Sharing...' : 'Share Whiteboard'}
          </button>
        </div>
      </div>
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
        className="border border-gray-300 rounded"
      />
      {isSharing && pendingPermissions.length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold mb-2">Pending Permission Requests</h4>
          <div className="space-y-2">
            {pendingPermissions.map(request => (
              <div key={request.student._id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">{request.student.name}</p>
                  <p className="text-sm text-gray-600">{request.student.email}</p>
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => handlePermission(request.student._id, 'approved')}
                    className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handlePermission(request.student._id, 'rejected')}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Whiteboard; 