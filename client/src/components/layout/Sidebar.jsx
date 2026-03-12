import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice.js';
import { approvalAPI } from '../../services/api.js';
import {
    LayoutDashboard, Upload, FileText, CheckSquare, Shield,
    Users, Building2, BarChart3, Link, ClipboardList, LogOut,
    Settings, ShieldCheck
} from 'lucide-react';

export default function Sidebar() {
    const { user } = useSelector(s => s.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        if (user?.role === 'hod' || user?.role === 'admin') {
            approvalAPI.pending().then(r => setPendingCount(r.data.total || 0)).catch(() => { });
        }
    }, [user?.role]);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

    const employeeLinks = [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/upload', icon: Upload, label: 'Upload Document' },
        { to: '/my-documents', icon: FileText, label: 'My Documents' },
        { to: '/audit-logs', icon: ClipboardList, label: 'My Audit Logs' },
        { to: '/verify', icon: ShieldCheck, label: 'Verify Document' },
    ];

    const hodLinks = [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/pending-approvals', icon: CheckSquare, label: 'Pending Approvals', badge: pendingCount },
        { to: '/department-documents', icon: FileText, label: 'Dept. Documents' },
        { to: '/audit-logs', icon: ClipboardList, label: 'Audit Logs' },
        { to: '/verify', icon: ShieldCheck, label: 'Verify Document' },
    ];

    const adminLinks = [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/pending-approvals', icon: CheckSquare, label: 'Approvals', badge: pendingCount },
        { to: '/user-management', icon: Users, label: 'User Management' },
        { to: '/department-management', icon: Building2, label: 'Departments' },
        { to: '/all-documents', icon: FileText, label: 'All Documents' },
        { to: '/audit-logs', icon: ClipboardList, label: 'Audit Logs' },
        { to: '/blockchain-logs', icon: Link, label: 'Blockchain Ledger' },
        { to: '/reports', icon: BarChart3, label: 'Reports' },
        { to: '/verify', icon: ShieldCheck, label: 'Verify Document' },
    ];

    const links = user?.role === 'admin' ? adminLinks : user?.role === 'hod' ? hodLinks : employeeLinks;

    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <div className="sidebar-brand-logo">
                    <div className="logo-icon">⛓</div>
                    <div>
                        <h1>IPR BlockDMS</h1>
                        <p>Institute for Plasma Research</p>
                    </div>
                </div>
            </div>

            <div className="sidebar-section">
                <div className="sidebar-section-label">Navigation</div>
                {links.map(({ to, icon: Icon, label, badge }) => (
                    <NavLink key={to} to={to} className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
                        <Icon className="nav-icon" size={16} />
                        {label}
                        {badge > 0 && <span className="sidebar-badge">{badge}</span>}
                    </NavLink>
                ))}
            </div>

            <div className="sidebar-footer">
                <div className="sidebar-user">
                    <div className="sidebar-user-avatar">{initials}</div>
                    <div className="sidebar-user-info" style={{ flex: 1, overflow: 'hidden' }}>
                        <div className="name truncate">{user?.name}</div>
                        <div className="role">{user?.role === 'hod' ? 'Dept. Authority' : user?.role}</div>
                    </div>
                    <button onClick={handleLogout} title="Logout" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', padding: '4px' }}>
                        <LogOut size={16} />
                    </button>
                </div>
            </div>
        </aside>
    );
}
