import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import './App.css';

// Components
import Dashboard from './components/Dashboard';
import TeamStats from './components/TeamStats';
import AlignmentHistory from './components/AlignmentHistory';
import IntentExplorer from './components/IntentExplorer';

function App() {
  const [projectData, setProjectData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjectData();
  }, []);

  const fetchProjectData = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/stats');
      const data = await response.json();
      setProjectData(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading Intent2Commit Dashboard...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="app">
        <nav className="sidebar">
          <div className="logo">
            <h1>Intent<span>2</span>Commit</h1>
            <p className="tagline">Decision Tracking</p>
          </div>
          
          <ul className="nav-menu">
            <li><Link to="/">📊 Dashboard</Link></li>
            <li><Link to="/team">👥 Team Stats</Link></li>
            <li><Link to="/history">📈 Alignment History</Link></li>
            <li><Link to="/explorer">🔍 Intent Explorer</Link></li>
          </ul>

          <div className="sidebar-footer">
            <p>Project: {projectData?.projectName || 'Unknown'}</p>
            <p className="version">v1.0.0</p>
          </div>
        </nav>

        <main className="content">
          <Routes>
            <Route path="/" element={<Dashboard data={projectData} />} />
            <Route path="/team" element={<TeamStats data={projectData} />} />
            <Route path="/history" element={<AlignmentHistory data={projectData} />} />
            <Route path="/explorer" element={<IntentExplorer data={projectData} />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
