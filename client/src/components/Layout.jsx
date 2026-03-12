import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, FileText, Upload, CheckSquare,
  ScrollText, Link2, Shield, Users, BarChart2, LogOut, Lock
} from 'lucide-react';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['employee','hod','admin'] },
  { label: 'My Documents', icon: FileText, path: '/documents', roles: ['employee','hod','admin'] },
  { label: 'Upload Document', icon: Upload, path: '/documents/upload', roles: ['employee','hod','admin'] },
  { label: 'Pending Approvals', icon: CheckSquare, path: '/approvals', roles: ['hod','admin'] },
  { label: 'Verify Document', icon: Shield, path: '/verify', roles: ['employee','hod','admin'] },
  { label: 'Audit Logs', icon: ScrollText, path: '/audit', roles: ['employee','hod','admin'] },
  { label: 'Blockchain Explorer', icon: Link2, path: '/blockchain', roles: ['hod','admin'] },
  { label: 'Reports', icon: BarChart2, path: '/reports', roles: ['hod','admin'] },
  { label: 'User Management', icon: Users, path: '/users', roles: ['admin'] },
];

const ROLE_COLORS = { admin: '#F59E0B', hod: '#0ea5e9', employee: '#16A34A' };

const Sidebar = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U';
  const visibleItems = NAV_ITEMS.filter(item => item.roles.includes(user?.role));

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-logo">
          <div className="brand-icon">
            <Lock size={20} color="white" />
          </div>
          <div>
            <div className="brand-name">BlockDMS</div>
            <div className="brand-tag">Secure Document System</div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-title">Navigation</div>
        {visibleItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <item.icon size={18} className="icon" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-user">
        <div className="user-info">
          <div className="user-avatar">{initials}</div>
          <div className="user-meta">
            <div className="user-name">{user?.name}</div>
            <div className="user-role" style={{ color: ROLE_COLORS[user?.role] }}>
              ● {user?.role?.toUpperCase()}
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};

const Topbar = ({ title }) => (
  <header className="topbar">
    <h1 className="topbar-title">{title}</h1>
  </header>
);

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/documents': 'My Documents',
  '/documents/upload': 'Upload Document',
  '/approvals': 'Pending Approvals',
  '/verify': 'Verify Document',
  '/audit': 'Audit Logs',
  '/blockchain': 'Blockchain Explorer',
  '/reports': 'Reports & Analytics',
  '/users': 'User Management',
};

const Layout = () => {
  const location = useLocation();
  const title = Object.entries(PAGE_TITLES).find(([path]) => location.pathname.startsWith(path))?.[1] || 'BlockDMS';

  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <Topbar title={title} />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
