import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE } from '../config';
import './Home.css';

// Import test for configuration verification
import '../test-config';

function Home() {
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  useEffect(() => {
    fetchUpcomingEvents();
  }, []);

  const fetchUpcomingEvents = async () => {
    console.log('📅 Fetching upcoming events from:', API_BASE);
    try {
      const response = await fetch(`${API_BASE}/rooms`);
      const rooms = await response.json();
      console.log('✅ Fetched rooms:', rooms.length);
      setUpcomingEvents(rooms);
    } catch (error) {
      console.error('❌ Error fetching rooms:', error);
    }
  };

  return (
    <div className="home-container">
      <div className="home-background">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
          <div className="shape shape-5"></div>
        </div>
      </div>

      <header className="home-header">
        <div className="logo-section">
          <div className="logo-icon">📹</div>
          <h1>VideoMeet Pro</h1>
        </div>
        <p className="tagline">Connect, Collaborate, Create Together</p>
        <div className="feature-badges">
          <span className="badge">🎥 HD Video</span>
          <span className="badge">🎤 Crystal Audio</span>
          <span className="badge">🔒 Secure</span>
          <span className="badge">📱 Cross-Platform</span>
        </div>
      </header>

      <div className="main-options">
        <div className="option-card create-card">
          <div className="card-icon">🚀</div>
          <h2>Create Room</h2>
          <p>Start a new video meeting and invite others to join your session</p>
          <div className="card-features">
            <span>✓ Instant room creation</span>
            <span>✓ Admin controls</span>
            <span>✓ Screen sharing</span>
          </div>
          <Link to="/create-room" className="btn btn-primary">
            <span className="btn-icon">➕</span>
            Create New Room
          </Link>
        </div>

        <div className="option-card join-card">
          <div className="card-icon">🔗</div>
          <h2>Join Room</h2>
          <p>Join an existing meeting with Room ID and start collaborating</p>
          <div className="card-features">
            <span>✓ Quick join process</span>
            <span>✓ No downloads required</span>
            <span>✓ Works on any device</span>
          </div>
          <Link to="/join-room" className="btn btn-secondary">
            <span className="btn-icon">🚪</span>
            Join Existing Room
          </Link>
        </div>

        <div className="option-card history-card">
          <div className="card-icon">📋</div>
          <h2>Meeting History</h2>
          <p>View past meetings, recordings, and chat history</p>
          <div className="card-features">
            <span>✓ Auto-saved recordings</span>
            <span>✓ Chat history</span>
            <span>✓ Download recordings</span>
          </div>
          <Link to="/history" className="btn btn-history">
            <span className="btn-icon">📂</span>
            View History
          </Link>
        </div>
      </div>

      <div className="upcoming-events">
        <div className="section-header">
          <h2>📅 Upcoming Meetings</h2>
          <p>Your scheduled video conferences</p>
        </div>
        {upcomingEvents.length === 0 ? (
          <div className="no-events">
            <div className="no-events-icon">📭</div>
            <h3>No upcoming meetings</h3>
            <p>Create a new room to get started with your first video conference</p>
          </div>
        ) : (
          <div className="events-list">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="event-card">
                <div className="event-header">
                  <div className="event-icon">🎯</div>
                  <div className="event-info">
                    <h3>Room: {event.id}</h3>
                    <p className="host-name">Hosted by {event.creatorName}</p>
                  </div>
                </div>
                <div className="event-details">
                  <div className="detail-item">
                    <span className="detail-icon">📅</span>
                    <span>{event.meetingDate}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-icon">🕒</span>
                    <span>{event.meetingTime}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-icon">👥</span>
                    <span>{event.participantCount} participants</span>
                  </div>
                </div>
                <Link 
                  to="/join-room" 
                  state={{ roomId: event.id }}
                  className="btn btn-outline event-join-btn"
                >
                  <span className="btn-icon">🚀</span>
                  Join Meeting
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer className="home-footer">
        <div className="footer-content">
          <p>© 2024 VideoMeet Pro - Secure Video Conferencing</p>
          <div className="footer-links">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Support</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;