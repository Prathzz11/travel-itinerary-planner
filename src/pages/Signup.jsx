import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, UserPlus, ChevronRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useForm } from '../hooks/useForm';
import { useNotification } from '../contexts/NotificationContext';
import { validateEmail } from '../utils/validators';
import LoadingButton from '../components/ui/LoadingButton';

const Signup = () => {
  const { signup, loading } = useAuth();
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const [error, setError] = useState('');

  const validate = (formValues) => {
    const errs = {};
    if (!formValues.name.trim()) errs.name = 'Name is required';
    
    if (!formValues.email) errs.email = 'Email is required';
    else if (!validateEmail(formValues.email)) errs.email = 'Invalid email address';
    
    if (!formValues.password) errs.password = 'Password is required';
    else if (formValues.password.length < 6) errs.password = 'Password must be at least 6 characters';
    
    if (formValues.password !== formValues.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }
    
    return errs;
  };

  const { values, errors, touched, isValid, handleChange, handleBlur, handleSubmit } = useForm({
    initialValues: { name: '', email: '', password: '', confirmPassword: '' },
    validate,
    onSubmit: async (formValues) => {
      setError('');
      try {
        await signup({ name: formValues.name, email: formValues.email, password: formValues.password });
        addNotification('Account created successfully!', 'success');
        navigate('/dashboard');
      } catch (err) {
        setError('Failed to create account. Please try again.');
        addNotification('Sign up failed. Please try again.', 'error');
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
          maxWidth: '450px',
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
            background: 'rgba(192, 132, 252, 0.1)', 
            borderRadius: 'var(--radius-full)',
            marginBottom: 'var(--space-4)'
          }}>
            <UserPlus size={32} color="var(--color-secondary)" />
          </div>
          <h2 style={{ fontSize: '2rem', margin: '0 0 var(--space-2) 0' }}>Create Account</h2>
          <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>
            Join us and start planning your next adventure.
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
            <User size={18} color="var(--color-text-muted)" style={{ position: 'absolute', top: '50%', left: 'var(--space-3)', transform: 'translateY(-50%)' }} />
            <input
              aria-label="Full Name"
              type="text"
              name="name"
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Full Name"
              style={{
                width: '100%',
                background: 'rgba(15, 23, 42, 0.5)',
                border: `1px solid ${touched.name && errors.name ? 'var(--color-danger)' : 'var(--color-border)'}`,
                color: 'var(--color-text)',
                padding: 'var(--space-3) var(--space-3) var(--space-3) 2.5rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '1rem',
                transition: 'border-color 0.2s, box-shadow 0.2s'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = touched.name && errors.name ? 'var(--color-danger)' : 'var(--color-secondary)';
                e.target.style.boxShadow = touched.name && errors.name ? '0 0 0 2px rgba(239, 68, 68, 0.3)' : '0 0 0 2px rgba(192, 132, 252, 0.3)';
              }}
              onBlur={(e) => {
                handleBlur(e);
                e.target.style.borderColor = touched.name && errors.name ? 'var(--color-danger)' : 'var(--color-border)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
          {touched.name && errors.name && (
            <span role="alert" style={{ color: 'var(--color-danger)', fontSize: '0.85rem', marginTop: '-8px', marginLeft: '4px', display: 'block' }}>
              {errors.name}
            </span>
          )}

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
                e.target.style.borderColor = touched.email && errors.email ? 'var(--color-danger)' : 'var(--color-secondary)';
                e.target.style.boxShadow = touched.email && errors.email ? '0 0 0 2px rgba(239, 68, 68, 0.3)' : '0 0 0 2px rgba(192, 132, 252, 0.3)';
              }}
              onBlur={(e) => {
                handleBlur(e);
                e.target.style.borderColor = touched.email && errors.email ? 'var(--color-danger)' : 'var(--color-border)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
          {touched.email && errors.email && (
            <span role="alert" style={{ color: 'var(--color-danger)', fontSize: '0.85rem', marginTop: '-8px', marginLeft: '4px', display: 'block' }}>
              {errors.email}
            </span>
          )}

          <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
            <div style={{ position: 'relative', flex: 1 }}>
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
                  e.target.style.borderColor = touched.password && errors.password ? 'var(--color-danger)' : 'var(--color-secondary)';
                  e.target.style.boxShadow = touched.password && errors.password ? '0 0 0 2px rgba(239, 68, 68, 0.3)' : '0 0 0 2px rgba(192, 132, 252, 0.3)';
                }}
                onBlur={(e) => {
                  handleBlur(e);
                  e.target.style.borderColor = touched.password && errors.password ? 'var(--color-danger)' : 'var(--color-border)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              {touched.password && errors.password && (
                <span role="alert" style={{ color: 'var(--color-danger)', fontSize: '0.85rem', marginTop: '4px', display: 'block' }}>
                  {errors.password}
                </span>
              )}
            </div>

            <div style={{ position: 'relative', flex: 1 }}>
              <Lock size={18} color="var(--color-text-muted)" style={{ position: 'absolute', top: '50%', left: 'var(--space-3)', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                name="confirmPassword"
                value={values.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Confirm"
                style={{
                  width: '100%',
                  background: 'rgba(15, 23, 42, 0.5)',
                  border: `1px solid ${touched.confirmPassword && errors.confirmPassword ? 'var(--color-danger)' : 'var(--color-border)'}`,
                  color: 'var(--color-text)',
                  padding: 'var(--space-3) var(--space-3) var(--space-3) 2.5rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '1rem',
                  transition: 'border-color 0.2s, box-shadow 0.2s'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = touched.confirmPassword && errors.confirmPassword ? 'var(--color-danger)' : 'var(--color-secondary)';
                  e.target.style.boxShadow = touched.confirmPassword && errors.confirmPassword ? '0 0 0 2px rgba(239, 68, 68, 0.3)' : '0 0 0 2px rgba(192, 132, 252, 0.3)';
                }}
                onBlur={(e) => {
                  handleBlur(e);
                  e.target.style.borderColor = touched.confirmPassword && errors.confirmPassword ? 'var(--color-danger)' : 'var(--color-border)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              {touched.confirmPassword && errors.confirmPassword && (
                <span role="alert" style={{ color: 'var(--color-danger)', fontSize: '0.85rem', marginTop: '4px', display: 'block' }}>
                  {errors.confirmPassword}
                </span>
              )}
            </div>
          </div>

          <LoadingButton
            type="submit"
            isLoading={loading}
            disabled={!isValid}
            loadingText="Creating Account..."
            style={{ width: '100%', marginTop: 'var(--space-2)' }}
          >
            Sign Up <ChevronRight size={18} />
          </LoadingButton>
        </form>

        <div style={{ textAlign: 'center', marginTop: 'var(--space-2)', fontSize: '0.9rem' }}>
          <span style={{ color: 'var(--color-text-muted)' }}>Already have an account? </span>
          <Link to="/login" style={{ color: 'var(--color-secondary)', fontWeight: 500 }}>
            Sign in
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;