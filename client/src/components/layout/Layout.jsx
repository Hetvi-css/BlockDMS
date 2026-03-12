import React from 'react';
import { useSelector } from 'react-redux';
import Sidebar from './Sidebar.jsx';

export default function Layout({ children, title, subtitle }) {
    const { user } = useSelector(s => s.auth);

    const now = new Date().toLocaleString('en-IN', {
        weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });

    const roleBadge = { admin: 'badge-admin', hod: 'badge-hod', employee: 'badge-employee' };

    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-content">
                <header className="top-header">
                    <div>
                        <div className="header-title">{title}</div>
                        {subtitle && <div className="header-subtitle">{subtitle}</div>}
                    </div>
                    <div className="header-actions">
                        <div className="header-time">🕐 {now}</div>
                        <span className={`badge ${roleBadge[user?.role] || ''}`}>
                            {user?.role === 'hod' ? 'Dept. Authority' : user?.role}
                        </span>
                    </div>
                </header>
                <main className="page-content fade-in">
                    {children}
                </main>
            </div>
        </div>
    );
}
