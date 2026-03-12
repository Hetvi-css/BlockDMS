import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/layout/Layout.jsx';
import { userAPI, deptAPI } from '../../services/api.js';
import { UserPlus, Check, X, ToggleLeft, ToggleRight, ChevronLeft, ChevronRight } from 'lucide-react';

export default function UserManagement() {
    const [tab, setTab] = useState('all'); // 'all' | 'pending'
    const [users, setUsers] = useState([]);
    const [pending, setPending] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [modal, setModal] = useState(false);
    const [rejectModal, setRejectModal] = useState(null);
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'employee', departmentId: '', employeeId: '' });
    const [formError, setFormError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [actionMsg, setActionMsg] = useState('');

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [uRes, pRes, dRes, sRes] = await Promise.all([
                userAPI.list({ page, limit: 15, search, role: roleFilter }),
                userAPI.pendingApprovals(),
                deptAPI.list(),
                userAPI.stats()
            ]);
            setUsers(uRes.data.users || []);
            setTotal(uRes.data.total || 0);
            setTotalPages(uRes.data.totalPages || 1);
            setPending(pRes.data.users || []);
            setDepartments(dRes.data.departments || []);
            setStats(sRes.data.stats || {});
        } catch { } finally { setLoading(false); }
    }, [page, search, roleFilter]);

    useEffect(() => { load(); }, [load]);

    const handleCreate = async (e) => {
        e.preventDefault(); setFormError(''); setSubmitting(true);
        try {
            await userAPI.create(form);
            setModal(false);
            setForm({ name: '', email: '', password: '', role: 'employee', departmentId: '', employeeId: '' });
            load();
        } catch (err) { setFormError(err.response?.data?.message || 'Failed to create user.'); }
        finally { setSubmitting(false); }
    };

    const handleApprove = async (id) => {
        try { await userAPI.approve(id); load(); setActionMsg('User approved successfully.'); setTimeout(() => setActionMsg(''), 3000); }
        catch (err) { alert(err.response?.data?.message || 'Failed.'); }
    };

    const handleReject = async () => {
        if (!rejectModal || !rejectReason) return;
        try { await userAPI.reject(rejectModal, { reason: rejectReason }); setRejectModal(null); setRejectReason(''); load(); }
        catch (err) { alert(err.response?.data?.message || 'Failed.'); }
    };

    const handleToggle = async (id) => {
        try { await userAPI.toggleActive(id); load(); }
        catch (err) { alert(err.response?.data?.message || 'Failed.'); }
    };

    const roleBadge = (r) => <span className={`badge badge-${r}`}>{r === 'hod' ? 'Dept. Authority' : r}</span>;

    return (
        <Layout title="User Management" subtitle="Manage all system users and approvals">
            {/* Stats */}
            <div className="stats-grid" style={{ marginBottom: 20 }}>
                {[
                    { label: 'Total Users', val: stats.total, color: '#2563EB', bg: '#DBEAFE' },
                    { label: 'Employees', val: stats.employees, color: '#16A34A', bg: '#DCFCE7' },
                    { label: 'Dept. Authorities', val: stats.hods, color: '#7C3AED', bg: '#EDE9FE' },
                    { label: 'Pending Approval', val: stats.pending, color: '#D97706', bg: '#FEF3C7' },
                ].map(s => (
                    <div key={s.label} className="stat-card">
                        <div className="stat-value" style={{ color: s.color }}>{s.val ?? '—'}</div>
                        <div className="stat-label">{s.label}</div>
                    </div>
                ))}
            </div>

            {actionMsg && <div className="alert alert-success">{actionMsg}</div>}

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 16, borderBottom: '2px solid var(--gray-200)', paddingBottom: 0 }}>
                {[['all', `All Users (${total})`], ['pending', `Pending Approvals (${pending.length})`]].map(([t, l]) => (
                    <button key={t} onClick={() => setTab(t)} style={{
                        padding: '8px 18px', border: 'none', background: 'none', cursor: 'pointer',
                        fontWeight: 600, fontSize: 13,
                        color: tab === t ? 'var(--royal-blue)' : 'var(--gray-500)',
                        borderBottom: tab === t ? '2px solid var(--royal-blue)' : '2px solid transparent',
                        marginBottom: -2, transition: 'all 0.15s'
                    }}>{l}</button>
                ))}
                <button className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }} onClick={() => setModal(true)}>
                    <UserPlus size={14} /> Add User
                </button>
            </div>

            {tab === 'all' ? (
                <>
                    <div className="filter-bar" style={{ marginBottom: 16 }}>
                        <input className="search-input" style={{ flex: 1 }} placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)} />
                        <select className="form-control" style={{ width: 180 }} value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }}>
                            <option value="">All Roles</option>
                            <option value="admin">Admin</option>
                            <option value="hod">Dept. Authority</option>
                            <option value="employee">Employee</option>
                        </select>
                    </div>
                    {loading ? <div className="loading-container"><div className="spinner" /></div> : (
                        <div className="table-wrap">
                            <table>
                                <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Department</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u._id}>
                                            <td style={{ fontWeight: 600 }}>{u.name}{u.employeeId && <span style={{ fontSize: 10, color: 'var(--gray-400)', marginLeft: 6 }}>{u.employeeId}</span>}</td>
                                            <td style={{ fontSize: 12, color: 'var(--gray-600)' }}>{u.email}</td>
                                            <td>{roleBadge(u.role)}</td>
                                            <td style={{ fontSize: 12 }}>{u.department?.name || '—'}</td>
                                            <td>
                                                <span style={{ fontSize: 11, fontWeight: 700, color: u.isActive ? 'var(--success)' : 'var(--error)' }}>
                                                    {u.isActive ? '● Active' : u.isApproved === false ? '⏳ Pending' : '● Inactive'}
                                                </span>
                                            </td>
                                            <td style={{ fontSize: 12, color: 'var(--gray-500)' }}>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                                            <td>
                                                {u.role !== 'admin' && (
                                                    <button className="btn btn-secondary btn-sm" onClick={() => handleToggle(u._id)} title={u.isActive ? 'Deactivate' : 'Activate'}>
                                                        {u.isActive ? <ToggleRight size={14} color="var(--success)" /> : <ToggleLeft size={14} />}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {totalPages > 1 && (
                        <div className="pagination">
                            <button className="page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft size={14} /></button>
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(pg => (
                                <button key={pg} className={`page-btn${pg === page ? ' active' : ''}`} onClick={() => setPage(pg)}>{pg}</button>
                            ))}
                            <button className="page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}><ChevronRight size={14} /></button>
                        </div>
                    )}
                </>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {pending.length === 0 ? (
                        <div className="empty-state"><div className="empty-state-icon">✅</div><h3>No pending approvals</h3></div>
                    ) : pending.map(u => (
                        <div key={u._id} className="card">
                            <div className="card-body" style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 700, fontSize: 15 }}>{u.name}</div>
                                    <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{u.email} · {u.department?.name || 'No department'}</div>
                                    <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 4 }}>Registered: {new Date(u.createdAt).toLocaleString('en-IN')}</div>
                                </div>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <button className="btn btn-success btn-sm" onClick={() => handleApprove(u._id)}><Check size={13} /> Approve & Activate</button>
                                    <button className="btn btn-danger btn-sm" onClick={() => setRejectModal(u._id)}><X size={13} /> Reject</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create User Modal */}
            {modal && (
                <div className="modal-overlay" onClick={() => setModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header"><h2>➕ Add New User</h2><button className="modal-close" onClick={() => setModal(false)}>✕</button></div>
                        <form onSubmit={handleCreate}>
                            <div className="modal-body">
                                {formError && <div className="alert alert-error">{formError}</div>}
                                {form.role === 'admin' && <div className="alert alert-warning">⚠️ Only ONE admin is allowed. Creating another admin will fail if one exists.</div>}
                                <div className="form-row">
                                    <div className="form-group"><label>Full Name *</label><input className="form-control" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Dr. / Mr. / Ms. Full Name" /></div>
                                    <div className="form-group"><label>Employee ID</label><input className="form-control" value={form.employeeId} onChange={e => setForm(f => ({ ...f, employeeId: e.target.value }))} placeholder="IPR-EMP-XXX" /></div>
                                </div>
                                <div className="form-group"><label>Email *</label><input type="email" className="form-control" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="name@ipr.gov.in" /></div>
                                <div className="form-group"><label>Password *</label><input type="password" className="form-control" required minLength={6} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Min 6 characters" /></div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Role *</label>
                                        <select className="form-control" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                                            <option value="employee">Employee</option>
                                            <option value="hod">Dept. Authority (HOD)</option>
                                            <option value="admin">Admin (Singleton)</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Department</label>
                                        <select className="form-control" value={form.departmentId} onChange={e => setForm(f => ({ ...f, departmentId: e.target.value }))}>
                                            <option value="">None</option>
                                            {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? '⏳ Creating…' : 'Create User'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {rejectModal && (
                <div className="modal-overlay" onClick={() => setRejectModal(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header"><h2>❌ Reject Registration</h2><button className="modal-close" onClick={() => setRejectModal(null)}>✕</button></div>
                        <div className="modal-body">
                            <div className="form-group"><label>Rejection Reason *</label><textarea className="form-control" value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="State the reason for rejection…" /></div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setRejectModal(null)}>Cancel</button>
                            <button className="btn btn-danger" onClick={handleReject} disabled={!rejectReason}>Reject Application</button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}
