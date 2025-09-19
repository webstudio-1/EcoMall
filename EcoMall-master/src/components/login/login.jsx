// src/components/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';
import { FaUser, FaLock, FaArrowRight } from 'react-icons/fa';
import { postJson } from '../../services/api';
import { useAuth } from '../../context/AuthContext.jsx';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      setSubmitting(true);
      const res = await postJson('/EcoMall/login/', { email, password });
      if (res?.user) {
        setUser(res.user);
      }
      setSuccess(res?.message || 'Login successful');
      setTimeout(() => navigate('/'), 300);
    } catch (err) {
      const message = err?.payload?.error || err?.message || 'Login failed';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <h2>Welcome Back</h2>
        <p className={styles.subtitle}>Sign in to your EcoMall account</p>
        
        <form onSubmit={handleSubmit} className={styles.loginForm}>
          {error && <div className={styles.error}>{error}</div>}
          {success && <div className={styles.success}>{success}</div>}
          <div className={styles.inputGroup}>
            <FaUser className={styles.inputIcon} />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className={styles.inputGroup}>
            <FaLock className={styles.inputIcon} />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <div className={styles.options}>
            <label className={styles.rememberMe}>
              <input type="checkbox" />
              Remember me
            </label>
            <a href="/forgot-password" className={styles.forgotPassword}>
              Forgot Password?
            </a>
          </div>
          
          <button type="submit" className={styles.loginButton} disabled={submitting}>
            {submitting ? 'Signing in...' : 'Sign In'} <FaArrowRight className={styles.arrowIcon} />
          </button>
          
          <p className={styles.signupLink}>
            Don't have an account?{' '}
            <a href="/register" className={styles.signupText}>
              Sign up
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;