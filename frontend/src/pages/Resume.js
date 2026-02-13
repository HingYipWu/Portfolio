import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Resume.css';

const Resume = () => {
  const [resumeUrl, setResumeUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchResume();
  }, []);

  const fetchResume = async () => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await axios.get(`${API_URL}/resume`);
      setResumeUrl(response.data.resumeUrl);
      setError(null);
    } catch (err) {
      setError('Resume not available yet');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (resumeUrl) {
      const API_BASE = process.env.REACT_APP_API_URL 
        ? process.env.REACT_APP_API_URL.replace('/api', '') 
        : 'http://localhost:5000';
      const fullUrl = resumeUrl.startsWith('http') ? resumeUrl : `${API_BASE}${resumeUrl}`;
      window.open(fullUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="resume-page">
        <div className="loading">Loading resume...</div>
      </div>
    );
  }

  if (error || !resumeUrl) {
    return (
      <div className="resume-page">
        <div className="resume-header">
          <h1>My Resume</h1>
        </div>
        <div className="resume-error">
          <p>{error || 'No resume uploaded yet'}</p>
          <p>Please check back later!</p>
        </div>
      </div>
    );
  }

  // Construct full URL for display
  const API_BASE = process.env.REACT_APP_API_URL 
    ? process.env.REACT_APP_API_URL.replace('/api', '') 
    : 'http://localhost:5000';
  const fullResumeUrl = resumeUrl.startsWith('http') ? resumeUrl : `${API_BASE}${resumeUrl}`;

  return (
    <div className="resume-page">
      <div className="resume-header">
        <h1>My Resume</h1>
        <button onClick={handleDownload} className="download-btn">
          📥 Download PDF
        </button>
      </div>
      
      <div className="resume-viewer">
        <iframe
          src={`${fullResumeUrl}#view=FitH`}
          title="Resume"
          className="pdf-frame"
        />
        <div className="mobile-message">
          <p>Having trouble viewing the resume?</p>
          <button onClick={handleDownload} className="download-btn-mobile">
            Download PDF Instead
          </button>
        </div>
      </div>
    </div>
  );
};

export default Resume;
