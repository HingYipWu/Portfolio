import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectsAPI } from '../services/api';
import './Home.css';

const Home = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await projectsAPI.getAll();
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Welcome to My Portfolio</h1>
          <p className="hero-subtitle">
            Full Stack Developer | Building Modern Web Applications
          </p>
          <div className="hero-buttons">
            <a href="#projects" className="btn btn-primary">
              View Projects
            </a>
            <Link to="/resume" className="btn btn-secondary">
              View Resume
            </Link>
          </div>
        </div>
      </section>

      <section className="projects-gallery" id="projects">
        <div className="container">
          <h2>My Projects</h2>
          <p className="gallery-subtitle">Explore my work and the skills I've learned along the way</p>
          
          {loading ? (
            <div className="loading">Loading projects...</div>
          ) : projects.length === 0 ? (
            <div className="no-projects">
              <p>No projects yet. Check back soon!</p>
            </div>
          ) : (
            <div className="bubble-container">
              {projects.map((project, index) => {
                // Generate random bubble size and position
                const size = Math.random() * 100 + 150; // 150-250px
                const delay = Math.random() * 2; // animation delay
                
                return (
                  <div
                    key={project._id}
                    className="project-bubble"
                    style={{
                      width: `${size}px`,
                      height: `${size}px`,
                      animationDelay: `${delay}s`
                    }}
                  >
                    <div className="bubble-content">
                      {project.imageUrl && (
                        <div 
                          className="bubble-image"
                          style={{ backgroundImage: `url(${project.imageUrl})` }}
                        />
                      )}
                      <div className="bubble-overlay">
                        <h3>{project.title}</h3>
                        <p className="bubble-summary">{project.summary}</p>
                        {project.skillsLearned && project.skillsLearned.length > 0 && (
                          <div className="skills-preview">
                            <strong>Skills:</strong>
                            <div className="skills-tags">
                              {project.skillsLearned.slice(0, 3).map((skill, idx) => (
                                <span key={idx} className="skill-tag">{skill}</span>
                              ))}
                              {project.skillsLearned.length > 3 && (
                                <span className="skill-tag">+{project.skillsLearned.length - 3}</span>
                              )}
                            </div>
                          </div>
                        )}
                        <Link to={`/projects#${project._id}`} className="view-details">
                          View Details →
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="about" id="about">
        <div className="container">
          <h2>About Me</h2>
          <p>
            I'm a passionate full-stack developer with experience in building modern,
            responsive web applications. I love creating solutions that make a difference
            and constantly learning new technologies.
          </p>
        </div>
      </section>

      <section className="skills">
        <div className="container">
          <h2>Skills</h2>
          <div className="skills-grid">
            <div className="skill-item">
              <h3>Frontend</h3>
              <p>React, HTML, CSS, JavaScript</p>
            </div>
            <div className="skill-item">
              <h3>Backend</h3>
              <p>Node.js, Express, MongoDB</p>
            </div>
            <div className="skill-item">
              <h3>Tools</h3>
              <p>Git, Vercel, VS Code</p>
            </div>
          </div>
        </div>
      </section>

      <section className="contact" id="contact">
        <div className="container">
          <h2>Get In Touch</h2>
          <p>Feel free to reach out for collaborations or just a friendly chat!</p>
          <div className="contact-info">
            <p>Email: your.email@example.com</p>
            <p>GitHub: github.com/yourusername</p>
            <p>LinkedIn: linkedin.com/in/yourprofile</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
