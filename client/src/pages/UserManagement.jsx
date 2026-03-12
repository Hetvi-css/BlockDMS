import React, { useEffect, useState } from 'react';
import { getUsers, createUser, updateUser, deleteUser } from '../services/api';
import { Users, Plus, Edit2, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const EMPTY_FORM = { name: '', email: '', password: '', role: 'employee', department: '', employeeId: '', phone: '' };

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'create' | 'edit' | 'delete'
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    getUsers().then(r => setUsers(r.data.users || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(EMPTY_FORM); setModal('create'); };
  const openEdit = (u) => { setSelected(u); setForm({ name: u.name, email: u.email, password: '', role: u.role, department: u.department || '', employeeId: u.employeeId || '', phone: u.phone || '' }); setModal('edit'); };

  const handleCreate = async () => {
    if (!form.name || !form.email || !form.password) { toast.error('Name, email, and password are required'); return; }
    setSubmitting(true);
    try { await createUser(form); toast.success('User created'); load(); setModal(null); }
    catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const handleEdit = async () => {
    setSubmitting(true);
    try { await updateUser(selected._id, form); toast.success('User updated'); load(); setModal(null); }
    catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try { await deleteUser(selected._id); toast.success('User deactivated'); load(); setModal(null); }
    catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const ROLE_BADGE = { admin: 'badge-admin', hod: 'badge-hod', employee: 'badge-employee' };

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="section-title">User Management</div>
          <div className="section-subtitle">{users.length} registered users</div>
        </div>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={16} />Add User</button>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Name</th><th>Email</th><th>Role</th><th>Department</th><th>Employee ID</th><th>Status</th><th>Last Login</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td style={{ fontWeight: 500 }}>{u.name}</td>
                    <td style={{ fontSize: 13 }}>{u.email}</td>
                    <td><span className={`badge ${ROLE_BADGE[u.role]}`}>{u.role}</span></td>
                    <td>{u.department || '—'}</td>
                    <td style={{ fontSize: 13, fontFamily: 'monospace' }}>{u.employeeId || '—'}</td>
                    <td>
                      <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 20, background: u.isActive ? '#dcfce7' : '#fee2e2', color: u.isActive ? '#14532d' : '#7f1d1d', fontWeight: 600 }}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: '#9ca3af' }}>{u.lastLogin ? format(new Date(u.lastLogin), 'dd MMM, HH:mm') : 'Never'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(u)}><Edit2 size={13} /></button>
                        <button className="btn btn-danger btn-sm" onClick={() => { setSelected(u); setModal('delete'); }}><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {(modal === 'create' || modal === 'edit') && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{modal === 'create' ? 'Create New User' : 'Edit User'}</div>
              <button className="modal-close" onClick={() => setModal(null)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input className="form-control" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="John Doe" />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input className="form-control" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="john@company.com" />
                </div>
                <div className="form-group">
                  <label className="form-label">Password {modal === 'edit' ? '(leave blank to keep)' : '*'}</label>
                  <input className="form-control" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" />
                </div>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select className="form-control" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                    <option value="employee">Employee</option>
                    <option value="hod">HOD (Department Authority)</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <input className="form-control" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} placeholder="Computer Science" />
                </div>
                <div className="form-group">
                  <label className="form-label">Employee ID</label>
                  <input className="form-control" value={form.employeeId} onChange={e => setForm(f => ({ ...f, employeeId: e.target.value }))} placeholder="EMP006" />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Phone</label>
                <input className="form-control" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91-9999000000" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-primary" disabled={submitting} onClick={modal === 'create' ? handleCreate : handleEdit}>
                {submitting ? 'Saving...' : modal === 'create' ? 'Create User' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {modal === 'delete' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Deactivate User</div>
              <button className="modal-close" onClick={() => setModal(null)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="alert alert-warning">
                <div>Are you sure you want to deactivate <strong>{selected?.name}</strong>? They will no longer be able to log in.</div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-danger" disabled={submitting} onClick={handleDelete}>{submitting ? 'Deactivating...' : 'Confirm Deactivate'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
