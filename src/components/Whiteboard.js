import React, { useRef, useEffect, useState, useCallback } from 'react';

const COLORS = ['#000000', '#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#ffffff'];
const SIZES = [2, 5, 10, 20];

function Whiteboard({ socket, roomId, onClose }) {
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const lastPos = useRef(null);
  const [color, setColor] = useState('#000000');
  const [size, setSize] = useState(5);
  const [tool, setTool] = useState('pen'); // 'pen' | 'eraser'

  // Draw a line segment on the canvas
  const drawSegment = useCallback((ctx, x0, y0, x1, y1, strokeColor, strokeSize, isEraser) => {
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.strokeStyle = isEraser ? '#ffffff' : strokeColor;
    ctx.lineWidth = strokeSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalCompositeOperation = isEraser ? 'destination-out' : 'source-over';
    ctx.stroke();
  }, []);

  // Listen for remote draw events
  useEffect(() => {
    if (!socket) return;

    const handleDraw = ({ x0, y0, x1, y1, color: c, size: s, eraser }) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      drawSegment(ctx, x0, y0, x1, y1, c, s, eraser);
    };

    const handleClear = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    const handleSync = ({ imageData }) => {
      if (!imageData) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const img = new Image();
      img.onload = () => {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = imageData;
    };

    socket.on('whiteboard-draw', handleDraw);
    socket.on('whiteboard-clear', handleClear);
    socket.on('whiteboard-sync', handleSync);

    // Request current state from server when joining
    socket.emit('whiteboard-request-sync', { roomId });

    return () => {
      socket.off('whiteboard-draw', handleDraw);
      socket.off('whiteboard-clear', handleClear);
      socket.off('whiteboard-sync', handleSync);
    };
  }, [socket, roomId, drawSegment]);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if (e.touches) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const onMouseDown = (e) => {
    isDrawing.current = true;
    lastPos.current = getPos(e, canvasRef.current);
  };

  const onMouseMove = (e) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);
    const { x: x0, y: y0 } = lastPos.current;
    const { x: x1, y: y1 } = pos;
    const isEraser = tool === 'eraser';

    drawSegment(ctx, x0, y0, x1, y1, color, size, isEraser);

    socket?.emit('whiteboard-draw', { roomId, x0, y0, x1, y1, color, size, eraser: isEraser });

    lastPos.current = pos;
  };

  const onMouseUp = () => {
    isDrawing.current = false;
    lastPos.current = null;
    // Sync full canvas state after each stroke
    const canvas = canvasRef.current;
    if (canvas && socket) {
      socket.emit('whiteboard-sync-state', { roomId, imageData: canvas.toDataURL() });
    }
  };

  const clearBoard = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    socket?.emit('whiteboard-clear', { roomId });
  };

  return (
    <div className="whiteboard-overlay" onClick={onClose}>
      <div className="whiteboard-modal" onClick={e => e.stopPropagation()}>
        <div className="whiteboard-header">
          <span>🖊 Collaborative Whiteboard</span>
          <div className="wb-toolbar">
            {/* Tool */}
            <button
              className={`wb-tool-btn ${tool === 'pen' ? 'active' : ''}`}
              onClick={() => setTool('pen')}
              title="Pen"
            >✏️</button>
            <button
              className={`wb-tool-btn ${tool === 'eraser' ? 'active' : ''}`}
              onClick={() => setTool('eraser')}
              title="Eraser"
            >🧹</button>

            {/* Colors */}
            <div className="wb-colors">
              {COLORS.map(c => (
                <button
                  key={c}
                  className={`wb-color-btn ${color === c ? 'selected' : ''}`}
                  style={{ background: c, border: c === '#ffffff' ? '1px solid #ccc' : 'none' }}
                  onClick={() => { setColor(c); setTool('pen'); }}
                  title={c}
                />
              ))}
            </div>

            {/* Sizes */}
            <div className="wb-sizes">
              {SIZES.map(s => (
                <button
                  key={s}
                  className={`wb-size-btn ${size === s ? 'active' : ''}`}
                  onClick={() => setSize(s)}
                  title={`${s}px`}
                >
                  <span style={{ width: s, height: s, borderRadius: '50%', background: '#333', display: 'inline-block' }} />
                </button>
              ))}
            </div>

            <button className="wb-clear-btn" onClick={clearBoard} title="Clear board">🗑️ Clear</button>
          </div>
          <button className="wb-close-btn" onClick={onClose}>✕</button>
        </div>

        <canvas
          ref={canvasRef}
          width={900}
          height={560}
          className="whiteboard-canvas"
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onTouchStart={onMouseDown}
          onTouchMove={onMouseMove}
          onTouchEnd={onMouseUp}
          style={{ cursor: tool === 'eraser' ? 'cell' : 'crosshair' }}
        />
      </div>
    </div>
  );
}

export default Whiteboard;
