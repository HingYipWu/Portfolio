import React from 'react';
import './ProjectCard.css';

const ProjectCard = ({ project }) => {
  return (
    <div className="project-card">
      {project.imageUrl && (
        <img src={project.imageUrl} alt={project.title} className="project-image" />
      )}
      <div className="project-content">
        <h3 className="project-title">{project.title}</h3>
        {project.summary && (
          <p className="project-summary">{project.summary}</p>
        )}
        <p className="project-description">{project.description}</p>
        
        {project.skillsLearned && project.skillsLearned.length > 0 && (
          <div className="skills-learned-section">
            <strong>Skills Learned:</strong>
            <div className="skills-learned">
              {project.skillsLearned.map((skill, index) => (
                <span key={index} className="skill-learned-tag">{skill}</span>
              ))}
            </div>
          </div>
        )}
        
        {project.technologies && project.technologies.length > 0 && (
          <div className="project-technologies">
            <strong>Technologies:</strong>
            <div className="tech-tags-wrapper">
              {project.technologies.map((tech, index) => (
                <span key={index} className="tech-tag">{tech}</span>
              ))}
            </div>
          </div>
        )}
        
        <div className="project-links">
          {project.projectUrl && (
            <a 
              href={project.projectUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="project-link"
            >
              View Project
            </a>
          )}
          {project.githubUrl && (
            <a 
              href={project.githubUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="project-link github-link"
            >
              GitHub
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
