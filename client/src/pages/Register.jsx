import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { Compass, User, Mail, Lock } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const validate = () => {
    const errs = {};
    if (!form.username.trim()) errs.username = 'Username is required';
    else if (form.username.length < 3) errs.username = 'Username must be at least 3 characters';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (!form.confirm) errs.confirm = 'Please confirm your password';
    else if (form.password !== form.confirm) errs.confirm = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;
    setLoading(true);
    try {
      await register(form.username, form.email, form.password);
      toast.success('Account created! Welcome aboard!');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setApiError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const field = (name, label, type, icon, placeholder, autoComplete) => (
    <div className="form-group">
      <label>{label}</label>
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex' }}>{icon}</span>
        <input
          className={`input${errors[name] ? ' error' : ''}`}
          style={{ paddingLeft: '2.25rem' }}
          type={type}
          value={form[name]}
          onChange={(e) => setForm({ ...form, [name]: e.target.value })}
          placeholder={placeholder}
          autoComplete={autoComplete}
        />
      </div>
      {errors[name] && <div className="error-msg">{errors[name]}</div>}
    </div>
  );

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', background: '#f8fafc' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Compass size={36} color="#2563eb" style={{ margin: '0 auto 0.75rem' }} />
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Create your account</h1>
          <p style={{ color: '#64748b', marginTop: '0.35rem' }}>Start planning your perfect trips today</p>
        </div>

        <div className="card card-body" style={{ padding: '2rem' }}>
          {apiError && (
            <div style={{ background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.88rem' }}>
              {apiError}
            </div>
          )}
          <form onSubmit={handleSubmit} noValidate>
            {field('username', 'Username', 'text', <User size={16} />, 'johndoe', 'username')}
            {field('email', 'Email address', 'email', <Mail size={16} />, 'you@example.com', 'email')}
            {field('password', 'Password', 'password', <Lock size={16} />, 'At least 6 characters', 'new-password')}
            {field('confirm', 'Confirm Password', 'password', <Lock size={16} />, 'Repeat password', 'new-password')}
            <button type="submit" className="btn btn-primary w-full" style={{ marginTop: '0.5rem', justifyContent: 'center' }} disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.25rem', color: '#64748b', fontSize: '0.9rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#2563eb', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
