import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ChevronRight, LogIn } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useForm } from '../hooks/useForm';
import { useNotification } from '../contexts/NotificationContext';
import { validateEmail } from '../utils/validators';
import LoadingButton from '../components/ui/LoadingButton';

const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const validate = (formValues) => {
    const errs = {};
    if (!formValues.email) errs.email = 'Email is required';
    else if (!validateEmail(formValues.email)) errs.email = 'Invalid email address';
    
    if (!formValues.password) errs.password = 'Password is required';
    else if (formValues.password.length < 6) errs.password = 'Password must be at least 6 characters';
    
    return errs;
  };

  const { values, errors, touched, isValid, handleChange, handleBlur, handleSubmit } = useForm({
    initialValues: { email: '', password: '' },
    validate,
    onSubmit: async (formValues) => {
      setError('');
      try {
        await login(formValues, rememberMe);
        addNotification('Welcome back!', 'success');
        navigate('/dashboard');
      } catch (err) {
        setError('Failed to login. Please check your credentials.');
        addNotification('Login failed. Please check your credentials.', 'error');
      }
    }
  });

  return (
    <div className="page-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <motion.div
        className="glass-panel"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{
          width: '100%',
          maxWidth: '400px',
          padding: 'var(--space-8)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-6)'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            display: 'inline-flex', 
            padding: 'var(--space-4)', 
            background: 'rgba(56, 189, 248, 0.1)', 
            borderRadius: 'var(--radius-full)',
            marginBottom: 'var(--space-4)'
          }}>
            <LogIn size={32} color="var(--color-primary)" />
          </div>
          <h2 style={{ fontSize: '2rem', margin: '0 0 var(--space-2) 0' }}>Welcome Back</h2>
          <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>
            Enter your credentials to access your trips.
          </p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }} 
            style={{ 
              background: 'rgba(239, 68, 68, 0.1)', 
              color: 'var(--color-danger)', 
              padding: 'var(--space-3)', 
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              fontSize: '0.9rem',
              textAlign: 'center'
            }}
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ position: 'relative' }}>
            <Mail size={18} color="var(--color-text-muted)" style={{ position: 'absolute', top: '50%', left: 'var(--space-3)', transform: 'translateY(-50%)' }} />
            <input
              aria-label="Email address"
              type="email"
              name="email"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Email address"
              style={{
                width: '100%',
                background: 'rgba(15, 23, 42, 0.5)',
                border: `1px solid ${touched.email && errors.email ? 'var(--color-danger)' : 'var(--color-border)'}`,
                color: 'var(--color-text)',
                padding: 'var(--space-3) var(--space-3) var(--space-3) 2.5rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '1rem',
                transition: 'border-color 0.2s, box-shadow 0.2s'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = touched.email && errors.email ? 'var(--color-danger)' : 'var(--color-primary)';
                e.target.style.boxShadow = touched.email && errors.email ? '0 0 0 2px rgba(239, 68, 68, 0.3)' : '0 0 0 2px var(--color-primary-glow)';
              }}
              onBlur={(e) => {
                handleBlur(e);
                e.target.style.borderColor = touched.email && errors.email ? 'var(--color-danger)' : 'var(--color-border)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
          {touched.email && errors.email && (
            <div style={{ color: 'var(--color-danger)', fontSize: '0.85rem', marginTop: '-12px', marginLeft: '4px' }}>
              {errors.email}
            </div>
          )}

          <div style={{ position: 'relative' }}>
            <Lock size={18} color="var(--color-text-muted)" style={{ position: 'absolute', top: '50%', left: 'var(--space-3)', transform: 'translateY(-50%)' }} />
            <input
              type="password"
              name="password"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Password"
              style={{
                width: '100%',
                background: 'rgba(15, 23, 42, 0.5)',
                border: `1px solid ${touched.password && errors.password ? 'var(--color-danger)' : 'var(--color-border)'}`,
                color: 'var(--color-text)',
                padding: 'var(--space-3) var(--space-3) var(--space-3) 2.5rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '1rem',
                transition: 'border-color 0.2s, box-shadow 0.2s'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = touched.password && errors.password ? 'var(--color-danger)' : 'var(--color-primary)';
                e.target.style.boxShadow = touched.password && errors.password ? '0 0 0 2px rgba(239, 68, 68, 0.3)' : '0 0 0 2px var(--color-primary-glow)';
              }}
              onBlur={(e) => {
                handleBlur(e);
                e.target.style.borderColor = touched.password && errors.password ? 'var(--color-danger)' : 'var(--color-border)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
          {touched.password && errors.password && (
            <div style={{ color: 'var(--color-danger)', fontSize: '0.85rem', marginTop: '-12px', marginLeft: '4px' }}>
              {errors.password}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
              <input 
                type="checkbox" 
                checked={rememberMe} 
                onChange={(e) => setRememberMe(e.target.checked)} 
                style={{ cursor: 'pointer' }}
              />
              Remember me
            </label>
            <a href="#" onClick={(e) => { e.preventDefault(); alert('Forgot password flow coming soon'); }} style={{ color: 'var(--color-primary)' }}>
              Forgot password?
            </a>
          </div>

          <LoadingButton
            type="submit"
            isLoading={loading}
            disabled={!isValid}
            loadingText="Logging in..."
            style={{ width: '100%', marginTop: 'var(--space-2)' }}
          >
            Sign In <ChevronRight size={18} />
          </LoadingButton>
        </form>

        <div style={{ textAlign: 'center', marginTop: 'var(--space-2)', fontSize: '0.9rem' }}>
          <span style={{ color: 'var(--color-text-muted)' }}>Don't have an account? </span>
          <Link to="/signup" style={{ color: 'var(--color-primary)', fontWeight: 500 }}>
            Sign up
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;