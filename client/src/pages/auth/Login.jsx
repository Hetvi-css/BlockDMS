import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { setCredentials } from '../../store/authSlice.js';
import { authAPI, deptAPI } from '../../services/api.js';
import { Shield, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function Login() {
    const [mode, setMode] = useState('login'); // 'login' | 'register'
    const [form, setForm] = useState({ email: '', password: '', name: '', departmentId: '' });
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [departments, setDepartments] = useState([]);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const loadDepartments = async () => {
        try {
            const r = await deptAPI.list();
            setDepartments(r.data.departments || []);
        } catch { }
    };

    const handleModeSwitch = (m) => {
        setMode(m); setError(''); setSuccess('');
        if (m === 'register') loadDepartments();
    };

    const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleLogin = async (e) => {
        e.preventDefault(); setError(''); setLoading(true);
        try {
            const r = await authAPI.login({ email: form.email, password: form.password });
            dispatch(setCredentials({ user: r.data.user, token: r.data.token }));
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally { setLoading(false); }
    };

    const handleRegister = async (e) => {
        e.preventDefault(); setError(''); setLoading(true);
        try {
            await authAPI.register({ name: form.name, email: form.email, password: form.password, departmentId: form.departmentId });
            setSuccess('Registration submitted! Your account is pending admin approval. You will be notified once activated.');
            setMode('login');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed.');
        } finally { setLoading(false); }
    };

    const demoFill = (role) => {
        const creds = {
            admin: { email: 'admin@ipr.gov.in', password: 'Admin@123' },
            hod: { email: 'hod.rnd@ipr.gov.in', password: 'Hod@123' },
            employee: { email: 'employee1@ipr.gov.in', password: 'Emp@123' }
        };
        setForm(f => ({ ...f, ...creds[role] }));
        setError(''); setSuccess('');
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-header">
                    <div className="login-logo">⛓</div>
                    <h1>IPR BlockDMS</h1>
                    <p>Blockchain-Based Document Management System<br />Institute for Plasma Research</p>
                </div>

                <div className="login-form">
                    {/* Tab Toggle */}
                    <div style={{ display: 'flex', background: 'var(--gray-100)', borderRadius: 8, padding: 4, marginBottom: 20 }}>
                        {['login', 'register'].map(m => (
                            <button key={m} onClick={() => handleModeSwitch(m)}
                                style={{
                                    flex: 1, padding: '7px', border: 'none', borderRadius: 6, cursor: 'pointer',
                                    background: mode === m ? 'var(--royal-blue)' : 'transparent',
                                    color: mode === m ? 'white' : 'var(--gray-600)',
                                    fontWeight: 600, fontSize: 13, transition: 'all 0.15s'
                                }}>
                                {m === 'login' ? '🔐 Sign In' : '📝 Register'}
                            </button>
                        ))}
                    </div>

                    {error && (
                        <div className="alert alert-error">
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}
                    {success && (
                        <div className="alert alert-success">✅ {success}</div>
                    )}

                    {mode === 'login' ? (
                        <form onSubmit={handleLogin}>
                            <div className="form-group">
                                <label>Email Address</label>
                                <input name="email" type="email" className="form-control" required
                                    placeholder="your@ipr.gov.in" value={form.email} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input name="password" type={showPw ? 'text' : 'password'} className="form-control"
                                        required placeholder="Enter password" value={form.password} onChange={handleChange}
                                        style={{ paddingRight: 40 }} />
                                    <button type="button" onClick={() => setShowPw(!showPw)}
                                        style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)' }}>
                                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading}>
                                {loading ? '⏳ Signing in...' : '🔐 Sign In'}
                            </button>

                            <div className="login-divider"><span>Quick Demo Access</span></div>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                {[['admin', '👨‍💼 Admin'], ['hod', '👔 HOD'], ['employee', '👤 Employee']].map(([r, l]) => (
                                    <button key={r} type="button" onClick={() => demoFill(r)} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>{l}</button>
                                ))}
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleRegister}>
                            <div className="form-group">
                                <label>Full Name</label>
                                <input name="name" className="form-control" required placeholder="Dr. / Mr. / Ms. Full Name" value={form.name} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Email Address</label>
                                <input name="email" type="email" className="form-control" required placeholder="name@ipr.gov.in" value={form.email} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Password</label>
                                <input name="password" type="password" className="form-control" required minLength={6} placeholder="Min 6 characters" value={form.password} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Department (Optional)</label>
                                <select name="departmentId" className="form-control" value={form.departmentId} onChange={handleChange}>
                                    <option value="">Select Department</option>
                                    {departments.map(d => <option key={d._id} value={d._id}>{d.name} ({d.code})</option>)}
                                </select>
                            </div>
                            <div className="alert alert-info" style={{ margin: 0, marginBottom: 16 }}>
                                ℹ️ Registration is for employees only. Your account requires admin approval before activation.
                            </div>
                            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                                {loading ? '⏳ Submitting...' : '📝 Submit Registration'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
