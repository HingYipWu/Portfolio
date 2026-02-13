import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { projectsAPI } from '../services/api';
import './Admin.css';

const Admin = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [currentResumeUrl, setCurrentResumeUrl] = useState('');
  const [uploadingResume, setUploadingResume] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    description: '',
    technologies: '',
    skillsLearned: '',
    imageUrl: '',
    projectUrl: '',
    githubUrl: '',
    featured: false
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      fetchProjects();
      fetchProfile();
    }
  }, [isAuthenticated, navigate]);

  const fetchProjects = async () => {
    try {
      const response = await projectsAPI.getAll();
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchProfile = async () => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_URL}/profile`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setCurrentResumeUrl(data.resumeUrl || '');
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Please upload a PDF file');
        return;
      }
      setResumeFile(file);
    }
  };

  const uploadResume = async () => {
    if (!resumeFile) return;

    const formDataObj = new FormData();
    formDataObj.append('resume', resumeFile);

    try {
      setUploadingResume(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/upload/resume`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formDataObj
      });

      const data = await response.json();
      setCurrentResumeUrl(data.url);
      setResumeFile(null);
      alert('Resume uploaded successfully!');
    } catch (error) {
      console.error('Error uploading resume:', error);
      alert('Failed to upload resume');
    } finally {
      setUploadingResume(false);
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return formData.imageUrl;

    const formDataObj = new FormData();
    formDataObj.append('image', imageFile);

    try {
      setUploading(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formDataObj
      });

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
      return formData.imageUrl;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Upload image if a new one was selected
    const imageUrl = await uploadImage();
    
    const projectData = {
      ...formData,
      imageUrl,
      technologies: formData.technologies.split(',').map(t => t.trim()).filter(t => t),
      skillsLearned: formData.skillsLearned.split(',').map(s => s.trim()).filter(s => s)
    };

    try {
      if (editingProject) {
        await projectsAPI.update(editingProject._id, projectData);
      } else {
        await projectsAPI.create(projectData);
      }
      
      setFormData({
        title: '',
        summary: '',
        description: '',
        technologies: '',
        skillsLearned: '',
        imageUrl: '',
        projectUrl: '',
        githubUrl: '',
        featured: false
      });
      setImageFile(null);
      setImagePreview('');
      setShowForm(false);
      setEditingProject(null);
      fetchProjects();
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Failed to save project');
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      summary: project.summary || '',
      description: project.description,
      technologies: project.technologies.join(', '),
      skillsLearned: project.skillsLearned ? project.skillsLearned.join(', ') : '',
      imageUrl: project.imageUrl || '',
      projectUrl: project.projectUrl || '',
      githubUrl: project.githubUrl || '',
      featured: project.featured
    });
    setImagePreview(project.imageUrl || '');
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await projectsAPI.delete(id);
        fetchProjects();
      } catch (error) {
        console.error('Error deleting project:', error);
        alert('Failed to delete project');
      }
    }
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingProject(null);
    setImageFile(null);
    setImagePreview('');
    setFormData({
      title: '',
      summary: '',
      description: '',
      technologies: '',
      skillsLearned: '',
      imageUrl: '',
      projectUrl: '',
      githubUrl: '',
      featured: false
    });
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <button 
          onClick={() => setShowForm(!showForm)} 
          className="add-btn"
        >
          {showForm ? 'Cancel' : 'Add New Project'}
        </button>
      </div>

      {/* Resume Management Section */}
      <div className="resume-section">
        <h2>Resume Management</h2>
        <div className="resume-upload-container">
          <div className="resume-upload-info">
            {currentResumeUrl ? (
              <>
                <p className="resume-status">✅ Resume uploaded</p>
                <a 
                  href={currentResumeUrl.startsWith('http') 
                    ? currentResumeUrl 
                    : `${process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000'}${currentResumeUrl}`
                  } 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="view-resume-link"
                >
                  View Current Resume
                </a>
              </>
            ) : (
              <p className="resume-status">❌ No resume uploaded</p>
            )}
          </div>
          
          <div className="resume-upload-form">
            <label className="resume-upload-label">
              Upload New Resume (PDF only)
              <input
                type="file"
                accept=".pdf"
                onChange={handleResumeChange}
                className="file-input"
              />
            </label>
            {resumeFile && (
              <div className="resume-file-info">
                <span>📄 {resumeFile.name}</span>
                <button 
                  onClick={uploadResume} 
                  className="upload-resume-btn"
                  disabled={uploadingResume}
                >
                  {uploadingResume ? 'Uploading...' : 'Upload Resume'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showForm && (
        <div className="project-form">
          <h2>{editingProject ? 'Edit Project' : 'Add New Project'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Project Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="file-input"
              />
              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" />
                </div>
              )}
              <small>Or enter an image URL below</small>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
                style={{ marginTop: '0.5rem' }}
              />
            </div>

            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="Project title"
              />
            </div>

            <div className="form-group">
              <label>Quick Summary *</label>
              <input
                type="text"
                name="summary"
                value={formData.summary}
                onChange={handleInputChange}
                required
                placeholder="A brief one-line summary of the project"
                maxLength="150"
              />
              <small>{formData.summary.length}/150 characters</small>
            </div>

            <div className="form-group">
              <label>Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                placeholder="Detailed project description"
                rows="4"
              />
            </div>

            <div className="form-group">
              <label>Technologies (comma-separated)</label>
              <input
                type="text"
                name="technologies"
                value={formData.technologies}
                onChange={handleInputChange}
                placeholder="React, Node.js, MongoDB"
              />
            </div>

            <div className="form-group">
              <label>Skills Learned (comma-separated) *</label>
              <input
                type="text"
                name="skillsLearned"
                value={formData.skillsLearned}
                onChange={handleInputChange}
                required
                placeholder="API Integration, State Management, Authentication"
              />
            </div>

            <div className="form-group">
              <label>Project URL</label>
              <input
                type="url"
                name="projectUrl"
                value={formData.projectUrl}
                onChange={handleInputChange}
                placeholder="https://example.com"
              />
            </div>

            <div className="form-group">
              <label>GitHub URL</label>
              <input
                type="url"
                name="githubUrl"
                value={formData.githubUrl}
                onChange={handleInputChange}
                placeholder="https://github.com/username/repo"
              />
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleInputChange}
                />
                Featured Project
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-btn" disabled={uploading}>
                {uploading ? 'Uploading...' : editingProject ? 'Update Project' : 'Create Project'}
              </button>
              <button type="button" onClick={cancelForm} className="cancel-btn">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="projects-list">
        <h2>Your Projects ({projects.length})</h2>
        {projects.length === 0 ? (
          <p className="no-projects">No projects yet. Add your first project!</p>
        ) : (
          <div className="admin-projects-grid">
            {projects.map((project) => (
              <div key={project._id} className="admin-project-card">
                {project.imageUrl && (
                  <img src={project.imageUrl} alt={project.title} />
                )}
                <div className="project-info">
                  <h3>{project.title}</h3>
                  {project.summary && (
                    <p className="project-summary"><strong>Summary:</strong> {project.summary}</p>
                  )}
                  <p>{project.description.substring(0, 100)}...</p>
                  {project.skillsLearned && project.skillsLearned.length > 0 && (
                    <div className="skills-learned">
                      <strong>Skills Learned:</strong>
                      <div className="tech-tags">
                        {project.skillsLearned.map((skill, idx) => (
                          <span key={idx} className="skill-tag-learned">{skill}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="tech-tags">
                      {project.technologies.map((tech, idx) => (
                        <span key={idx} className="tech-tag">{tech}</span>
                      ))}
                    </div>
                  )}
                  {project.featured && <span className="featured-badge">Featured</span>}
                </div>
                <div className="project-actions">
                  <button onClick={() => handleEdit(project)} className="edit-btn">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(project._id)} className="delete-btn">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
