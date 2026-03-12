import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout.jsx';
import { deptAPI, userAPI } from '../../services/api.js';
import { Plus, Edit2, Trash2, Building2 } from 'lucide-react';

export default function DepartmentManagement() {
    const [departments, setDepartments] = useState([]);
    const [hods, setHods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: '', code: '', description: '', hodId: '' });
    const [formError, setFormError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const [dRes, uRes] = await Promise.all([deptAPI.list(), userAPI.list({ role: 'hod', isActive: 'true', limit: 100 })]);
            setDepartments(dRes.data.departments || []);
            setHods(uRes.data.users || []);
        } catch { } finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const openAdd = () => { setEditing(null); setForm({ name: '', code: '', description: '', hodId: '' }); setFormError(''); setModal(true); };
    const openEdit = (d) => { setEditing(d); setForm({ name: d.name, code: d.code, description: d.description || '', hodId: d.hod?._id || '' }); setFormError(''); setModal(true); };

    const handleSubmit = async (e) => {
        e.preventDefault(); setFormError(''); setSubmitting(true);
        try {
            if (editing) await deptAPI.update(editing._id, form);
            else await deptAPI.create(form);
            setModal(false); load();
        } catch (err) { setFormError(err.response?.data?.message || 'Failed.'); }
        finally { setSubmitting(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Deactivate this department?')) return;
        try { await deptAPI.delete(id); load(); } catch (err) { alert(err.response?.data?.message || 'Failed.'); }
    };

    return (
        <Layout title="Department Management" subtitle={`${departments.length} active departments`}>
            <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-primary" onClick={openAdd}><Plus size={16} /> Add Department</button>
            </div>

            {loading ? <div className="loading-container"><div className="spinner" /></div> : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                    {departments.map(d => (
                        <div key={d._id} className="card">
                            <div className="card-body">
                                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                                    <div style={{ width: 48, height: 48, background: 'var(--blue-100)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <Building2 size={22} color="var(--royal-blue)" />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 800, fontSize: 15 }}>{d.name}</div>
                                        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                                            <span style={{ fontSize: 11, fontWeight: 700, background: 'var(--blue-100)', color: 'var(--royal-blue)', padding: '2px 8px', borderRadius: 4 }}>{d.code}</span>
                                            <span style={{ fontSize: 11, color: d.isActive ? 'var(--success)' : 'var(--error)', fontWeight: 600 }}>{d.isActive ? '● Active' : '● Inactive'}</span>
                                        </div>
                                        {d.description && <p style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 8 }}>{d.description}</p>}
                                        <div style={{ marginTop: 10, fontSize: 12 }}>
                                            <span style={{ fontWeight: 600, color: 'var(--gray-700)' }}>HOD: </span>
                                            <span style={{ color: d.hod ? 'var(--gray-700)' : 'var(--gray-400)' }}>{d.hod?.name || 'Not assigned'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
                                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(d)}><Edit2 size={13} /> Edit</button>
                                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(d._id)}><Trash2 size={13} /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {modal && (
                <div className="modal-overlay" onClick={() => setModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editing ? '✏️ Edit Department' : '➕ New Department'}</h2>
                            <button className="modal-close" onClick={() => setModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                {formError && <div className="alert alert-error">{formError}</div>}
                                <div className="form-row">
                                    <div className="form-group"><label>Department Name *</label><input className="form-control" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Research & Development" /></div>
                                    <div className="form-group"><label>Code *</label><input className="form-control" required value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="e.g. RND" maxLength={6} /></div>
                                </div>
                                <div className="form-group"><label>Description</label><textarea className="form-control" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description..." /></div>
                                <div className="form-group">
                                    <label>Assign HOD</label>
                                    <select className="form-control" value={form.hodId} onChange={e => setForm(f => ({ ...f, hodId: e.target.value }))}>
                                        <option value="">Not assigned</option>
                                        {hods.map(h => <option key={h._id} value={h._id}>{h.name} ({h.email})</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? '⏳…' : editing ? 'Update' : 'Create'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
}
