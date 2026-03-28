import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MeetingHistory.css';

function MeetingHistory() {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('meetingHistory') || '[]');
    setMeetings(stored.reverse()); // newest first
  }, []);

  const deleteEntry = (id) => {
    const updated = meetings.filter(m => m.id !== id);
    setMeetings(updated);
    localStorage.setItem('meetingHistory', JSON.stringify([...updated].reverse()));
    if (selected?.id === id) setSelected(null);
  };

  const clearAll = () => {
    if (window.confirm('Delete all meeting history?')) {
      localStorage.removeItem('meetingHistory');
      setMeetings([]);
      setSelected(null);
    }
  };

  return (
    <div className="history-page">
      <div className="history-header">
        <button className="back-btn" onClick={() => navigate('/')}>← Back</button>
        <h1>📋 Meeting History</h1>
        {meetings.length > 0 && (
          <button className="clear-all-btn" onClick={clearAll}>🗑️ Clear All</button>
        )}
      </div>

      {meetings.length === 0 ? (
        <div className="history-empty">
          <p>No meeting history yet.</p>
          <p>Meetings are saved automatically when you join a room.</p>
        </div>
      ) : (
        <div className="history-layout">
          {/* List */}
          <div className="history-list">
            {meetings.map(m => (
              <div
                key={m.id}
                className={`history-card ${selected?.id === m.id ? 'active' : ''}`}
                onClick={() => setSelected(m)}
              >
                <div className="hc-room">Room: <strong>{m.roomId}</strong></div>
                <div className="hc-name">👤 {m.participantName}</div>
                <div className="hc-time">🕐 {m.startTime}</div>
                <div className="hc-duration">⏱ {m.duration}</div>
                <div className="hc-recordings">
                  🎥 {m.recordings?.length || 0} recording(s)
                </div>
                <button className="hc-delete" onClick={e => { e.stopPropagation(); deleteEntry(m.id); }}>🗑️</button>
              </div>
            ))}
          </div>

          {/* Detail */}
          {selected && (
            <div className="history-detail">
              <h2>Room: {selected.roomId}</h2>
              <p>Participant: {selected.participantName}</p>
              <p>Started: {selected.startTime}</p>
              <p>Ended: {selected.endTime || '—'}</p>
              <p>Duration: {selected.duration}</p>

              <h3>Recordings ({selected.recordings?.length || 0})</h3>
              {(!selected.recordings || selected.recordings.length === 0) ? (
                <p className="no-rec">No recordings for this session.</p>
              ) : (
                <div className="detail-recordings">
                  {selected.recordings.map((rec, i) => (
                    <div key={i} className="detail-rec-item">
                      <div className="rec-meta">
                        {rec.type === 'audio' ? '🎤' : '🎥'} {rec.filename}
                        <span className="rec-ts">{rec.timestamp}</span>
                      </div>
                      {rec.type === 'audio' ? (
                        <audio src={rec.url} controls style={{ width: '100%' }} />
                      ) : (
                        <video src={rec.url} controls style={{ width: '100%', borderRadius: 8 }} />
                      )}
                      <a href={rec.url} download={rec.filename} className="dl-btn">📥 Download</a>
                    </div>
                  ))}
                </div>
              )}

              <h3>Chat ({selected.chatMessages?.length || 0} messages)</h3>
              {(!selected.chatMessages || selected.chatMessages.length === 0) ? (
                <p className="no-rec">No chat messages.</p>
              ) : (
                <div className="detail-chat">
                  {selected.chatMessages.map((msg, i) => (
                    <div key={i} className="detail-chat-msg">
                      <strong>{msg.senderName}:</strong> {msg.message}
                      <span className="rec-ts">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MeetingHistory;
