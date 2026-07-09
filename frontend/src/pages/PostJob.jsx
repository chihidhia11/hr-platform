import { useState } from 'react';
import API from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

function PostJob() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [skillsRequired, setSkillsRequired] = useState('');
  const [salary, setSalary] = useState('');
  const navigate = useNavigate();
  const { showToast } = useToast();

  const token = localStorage.getItem('token');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post(
        '/jobs',
        {
          title,
          description,
          company,
          location,
          skillsRequired: skillsRequired.split(',').map((s) => s.trim()),
          salary: salary ? Number(salary) : undefined
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showToast('✅ Job posted successfully!', 'success');

      setTimeout(() => {
        navigate('/');
      }, 1000);

    } catch (error) {
      showToast(error.response?.data?.message || 'Something went wrong', 'error');
    }
  };

  return (
    <div className="form-page">
      <h2>Post a Job</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="form-field">
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            required
          />
        </div>
        <div className="form-field">
          <label>Company</label>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            required
          />
        </div>
        <div className="form-field">
          <label>Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </div>
        <div className="form-field">
          <label>Skills Required (comma separated)</label>
          <input
            type="text"
            value={skillsRequired}
            onChange={(e) => setSkillsRequired(e.target.value)}
            placeholder="e.g. React, Node.js, MongoDB"
            required
          />
        </div>
        <div className="form-field">
          <label>Salary (optional)</label>
          <input
            type="number"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
          />
        </div>
        <button type="submit">Post Job</button>
      </form>
    </div>
  );
}

export default PostJob;