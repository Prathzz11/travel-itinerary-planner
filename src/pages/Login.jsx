import React, { useState } from 'react';
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
    <div className="page-container d-flex align-items-center justify-content-center">
      <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '420px' }}>
        <div className="card-body p-4 p-md-5">
          <div className="text-center mb-4">
            <div className="d-inline-flex p-3 rounded-circle mb-3" style={{ background: 'rgba(56, 189, 248, 0.1)' }}>
              <LogIn size={32} color="var(--color-primary)" />
            </div>
            <h2 className="fw-bold mb-1">Welcome Back</h2>
            <p className="text-muted mb-0">Enter your credentials to access your trips.</p>
          </div>

          {error && (
            <div className="alert alert-danger py-2 text-center" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <div className="input-group">
                <span className="input-group-text bg-transparent border-end-0"><Mail size={18} className="text-muted" /></span>
                <input
                  type="email"
                  name="email"
                  className={`form-control border-start-0 ${touched.email && errors.email ? 'is-invalid' : ''}`}
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Email address"
                  aria-label="Email address"
                />
              </div>
              {touched.email && errors.email && <div className="text-danger small mt-1">{errors.email}</div>}
            </div>

            <div className="mb-3">
              <div className="input-group">
                <span className="input-group-text bg-transparent border-end-0"><Lock size={18} className="text-muted" /></span>
                <input
                  type="password"
                  name="password"
                  className={`form-control border-start-0 ${touched.password && errors.password ? 'is-invalid' : ''}`}
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Password"
                />
              </div>
              {touched.password && errors.password && <div className="text-danger small mt-1">{errors.password}</div>}
            </div>

            <div className="d-flex justify-content-between align-items-center mb-3 small">
              <div className="form-check">
                <input className="form-check-input" type="checkbox" id="rememberMe" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                <label className="form-check-label text-muted" htmlFor="rememberMe">Remember me</label>
              </div>
              <a href="#" className="text-decoration-none" style={{ color: 'var(--color-primary)' }} onClick={(e) => { e.preventDefault(); alert('Forgot password flow coming soon'); }}>
                Forgot password?
              </a>
            </div>

            <LoadingButton type="submit" isLoading={loading} disabled={!isValid} loadingText="Logging in..." style={{ width: '100%' }}>
              Sign In <ChevronRight size={18} />
            </LoadingButton>
          </form>

          <div className="text-center mt-4 small">
            <span className="text-muted">Don't have an account? </span>
            <Link to="/signup" style={{ color: 'var(--color-primary)' }}>Sign up</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;