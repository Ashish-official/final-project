import React, { useState } from "react";
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import "../dist/register.css"; // Import the enhanced CSS file

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    contact: "",
    role: "user", // Default role
    agreeTerms: false,
  });
  const [err, setErr] = useState({
    name: "",
    email: "",
    password: "",
    contact: "",
    role: "",
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name) {
      newErrors.name = "Name is required";
    }
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email address is invalid";
    }
    if (!formData.contact) {
      newErrors.contact = "Contact is required";
    } else if (!/^\d{10}$/.test(formData.contact)) {
      newErrors.contact = "Contact number must be exactly 10 digits";
    }
    if (!formData.password) {
      newErrors.password = "Password is required for safety";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    }
    if (!formData.role) {
      newErrors.role = "Role is required";
    }
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = "You must agree to the terms and conditions";
    }

    setErr(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }
    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        contact: formData.contact,
        role: formData.role
      };
      console.log('Sending registration data:', userData);
      const response = await register(userData);
      console.log('Registration successful:', response);
      if (response && response.user) {
        navigate('/');
      } else {
        setError('Registration successful but user data not received');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="register-container">
      <h2>Register to book or host</h2>
      <form onSubmit={handleSubmit} className="register-form">
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            placeholder="Name"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={err.name ? "error-input" : ""}
          />
          {err.name && (
            <span className="error-message">{err.name}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            placeholder="Email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={err.email ? "error-input" : ""}
          />
          {err.email && <span className="error-message">{err.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            placeholder="Password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={err.password ? "error-input" : ""}
          />
          {err.password && (
            <span className="error-message">{err.password}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="contact">Contact</label>
          <input
            type="text"
            placeholder="Contact Number"
            id="contact"
            name="contact"
            value={formData.contact}
            onChange={handleChange}
            className={err.contact ? "error-input" : ""}
          />
          {err.contact && <span className="error-message">{err.contact}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="role">Role</label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className={err.role ? "error-input" : ""}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          {err.role && <span className="error-message">{err.role}</span>}
        </div>

        <div className="terms-checkbox">
          <input
            type="checkbox"
            id="agreeTerms"
            name="agreeTerms"
            checked={formData.agreeTerms}
            onChange={handleChange}
            className={err.agreeTerms ? "error-input" : ""}
          />
          <label htmlFor="agreeTerms">
            I agree to the terms and conditions
          </label>
          {err.agreeTerms && (
            <span className="error-message">{err.agreeTerms}</span>
          )}
        </div>

        <div className="form-group">
          <button type="submit" className="register-button">
            Register
          </button>
        </div>
      </form>
      <div className="register-link">
        Already have an account? <Link to="/signin">Sign in here</Link>
      </div>
      {error && <div className="error-message">{error}</div>}
    </div>
  );
}

export default Register;
