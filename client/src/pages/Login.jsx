import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Eye, EyeOff, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

const DEMO_USERS = [
  { role: 'Admin', email: 'admin@dms.com', password: 'Admin@123' },
  { role: 'HOD', email: 'hod@dms.com', password: 'Hod@123' },
  { role: 'Employee', email: 'employee@dms.com', password: 'Employee@123' },
];

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Please enter email and password'); return;
    }
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="brand-icon" style={{ width: 54, height: 54, borderRadius: 16 }}>
            <Lock size={26} color="white" />
          </div>
          <div>
            <div style={{ fontSize: 23, fontWeight: 900, color: 'var(--slate-900)', letterSpacing: '-.5px' }}>BlockDMS</div>
            <div style={{ fontSize: 12, color: 'var(--slate-500)', fontWeight: 500 }}>Secure Document System</div>
          </div>
        </div>

        <h1 className="login-title">Sign In to Your Account</h1>
        <p className="login-subtitle">Blockchain-secured document management platform</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              className="form-control"
              type="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="password-wrapper">
              <input
                className="form-control"
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
              />
              <button type="button" className="password-toggle" onClick={() => setShowPass(v => !v)}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
            {loading ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2, borderColor: 'rgba(255,255,255,.3)', borderTopColor: 'white' }} />Signing in...</> : <><Shield size={16} />Sign In Securely</>}
          </button>
        </form>

        <div className="demo-creds">
          <h4>🔑 Demo Credentials</h4>
          {DEMO_USERS.map(u => (
            <div key={u.role} className="demo-cred-item">
              <span className="cred-role">{u.role}</span>
              <span className="cred-info">{u.email}</span>
              <button className="fill-btn" onClick={() => setForm({ email: u.email, password: u.password })}>Fill</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
