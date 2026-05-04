import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, UserPlus, ChevronRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useForm } from '../hooks/useForm';
import { useNotification } from '../contexts/NotificationContext';
import { validateEmail } from '../utils/validators';
import LoadingButton from '../components/ui/LoadingButton';

const validate = (formValues) => {
  const errs = {};
  if (!formValues.name.trim()) errs.name = 'Name is required';
  if (!formValues.email) errs.email = 'Email is required';
  else if (!validateEmail(formValues.email)) errs.email = 'Invalid email address';
  if (!formValues.password) errs.password = 'Password is required';
  else if (formValues.password.length < 6) errs.password = 'Password must be at least 6 characters';
  if (formValues.password !== formValues.confirmPassword) errs.confirmPassword = 'Passwords do not match';
  return errs;
};

const Signup = () => {
  const { signup, loading } = useAuth();
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const [error, setError] = useState('');

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
    <div className="page-container d-flex align-items-center justify-content-center">
      <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '480px' }}>
        <div className="card-body p-4 p-md-5">
          <div className="text-center mb-4">
            <div className="d-inline-flex p-3 rounded-circle mb-3" style={{ background: 'rgba(192, 132, 252, 0.1)' }}>
              <UserPlus size={32} color="var(--color-secondary)" />
            </div>
            <h2 className="fw-bold mb-1">Create Account</h2>
            <p className="text-muted mb-0">Join us and start planning your next adventure.</p>
          </div>

          {error && (
            <div className="alert alert-danger py-2 text-center" role="alert">{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <div className="input-group">
                <span className="input-group-text bg-transparent border-end-0"><User size={18} className="text-muted" /></span>
                <input type="text" name="name" className={`form-control border-start-0 ${touched.name && errors.name ? 'is-invalid' : ''}`}
                  value={values.name} onChange={handleChange} onBlur={handleBlur} placeholder="Full Name" aria-label="Full Name" />
              </div>
              {touched.name && errors.name && <div className="text-danger small mt-1">{errors.name}</div>}
            </div>

            <div className="mb-3">
              <div className="input-group">
                <span className="input-group-text bg-transparent border-end-0"><Mail size={18} className="text-muted" /></span>
                <input type="email" name="email" className={`form-control border-start-0 ${touched.email && errors.email ? 'is-invalid' : ''}`}
                  value={values.email} onChange={handleChange} onBlur={handleBlur} placeholder="Email address" aria-label="Email address" />
              </div>
              {touched.email && errors.email && <div className="text-danger small mt-1">{errors.email}</div>}
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-end-0"><Lock size={18} className="text-muted" /></span>
                  <input type="password" name="password" className={`form-control border-start-0 ${touched.password && errors.password ? 'is-invalid' : ''}`}
                    value={values.password} onChange={handleChange} onBlur={handleBlur} placeholder="Password" />
                </div>
                {touched.password && errors.password && <div className="text-danger small mt-1">{errors.password}</div>}
              </div>
              <div className="col-md-6">
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-end-0"><Lock size={18} className="text-muted" /></span>
                  <input type="password" name="confirmPassword" className={`form-control border-start-0 ${touched.confirmPassword && errors.confirmPassword ? 'is-invalid' : ''}`}
                    value={values.confirmPassword} onChange={handleChange} onBlur={handleBlur} placeholder="Confirm" />
                </div>
                {touched.confirmPassword && errors.confirmPassword && <div className="text-danger small mt-1">{errors.confirmPassword}</div>}
              </div>
            </div>

            <LoadingButton type="submit" isLoading={loading} disabled={!isValid} loadingText="Creating Account..." style={{ width: '100%' }}>
              Sign Up <ChevronRight size={18} />
            </LoadingButton>
          </form>

          <div className="text-center mt-4 small">
            <span className="text-muted">Already have an account? </span>
            <Link to="/login" style={{ color: 'var(--color-secondary)' }}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;