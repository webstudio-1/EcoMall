import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './Register.module.css';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaArrowRight } from 'react-icons/fa';
import { postJson } from '../../services/api';
import { useAuth } from '../../context/AuthContext.jsx';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Map frontend fields to backend expected fields
    const [first, ...rest] = formData.name.trim().split(' ');
    const last = (rest.join(' ').trim()) || 'NA'; // Ensure last_name is not blank
    const phoneDigits = formData.phone.replace(/\D/g, ''); // keep only numbers
    const payload = {
      first_name: first || formData.name,
      last_name: last,
      email: formData.email,
      mobile_number: phoneDigits,
      password: formData.password,
    };

    try {
      setSubmitting(true);
      const res = await postJson('/EcoMall/register/', payload);
      if (res?.user) {
        setUser(res.user);
      }
      setSuccess(res?.message || 'Registered successfully');
      // navigate after a short delay so user sees success
      setTimeout(() => navigate('/'), 500);
    } catch (err) {
      // Prefer server-provided message if available
      const serverMsg =
        typeof err?.payload === 'object'
          ? Object.values(err.payload).flat().join(' ') // DRF serializer errors
          : err?.message;
      setError(serverMsg || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.registerContainer}>
      <div className={styles.registerCard}>
        <h2>Create an Account</h2>
        <p className={styles.subtitle}>Join EcoMall for a sustainable shopping experience</p>
        
        <form onSubmit={handleSubmit} className={styles.registerForm}>
          {error && <div className={styles.error}>{error}</div>}
          {success && <div className={styles.success}>{success}</div>}
          <div className={styles.inputGroup}>
            <FaUser className={styles.inputIcon} />
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className={styles.inputGroup}>
            <FaEnvelope className={styles.inputIcon} />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className={styles.inputGroup}>
            <FaPhone className={styles.inputIcon} />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className={styles.inputGroup}>
            <FaLock className={styles.inputIcon} />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className={styles.inputGroup}>
            <FaLock className={styles.inputIcon} />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className={styles.terms}>
            <label className={styles.termsLabel}>
              <input type="checkbox" required />
              I agree to the <a href="/terms" className={styles.termsLink}>Terms & Conditions</a> and 
              <a href="/privacy" className={styles.termsLink}> Privacy Policy</a>
            </label>
          </div>
          
          <button type="submit" className={styles.registerButton} disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Account'} <FaArrowRight className={styles.arrowIcon} />
          </button>
          
          <p className={styles.loginLink}>
            Already have an account?{' '}
            <Link to="/login" className={styles.loginText}>
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;