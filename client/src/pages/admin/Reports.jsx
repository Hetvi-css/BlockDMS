import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout.jsx';
import { reportAPI } from '../../services/api.js';
import { BarChart3, FileText, Users, Building2, TrendingUp, Download } from 'lucide-react';

export default function Reports() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        reportAPI.summary().then(r => setData(r.data.report)).catch(() => { }).finally(() => setLoading(false));
    }, []);

    const MAX_BAR = (arr) => Math.max(...arr.map(a => a.count || 0), 1);

    if (loading) return <Layout title="Reports"><div className="loading-container"><div className="spinner" /></div></Layout>;
    if (!data) return <Layout title="Reports"><div className="alert alert-error">Failed to load report data.</div></Layout>;

    const { documents, users, departments, monthlyUploads, docsByDepartment } = data;

    return (
        <Layout title="System Reports" subtitle="Analytics and statistics">
            {/* Summary Cards */}
            <div className="stats-grid" style={{ marginBottom: 24 }}>
                {[
                    { label: 'Total Documents', val: documents?.total, icon: FileText, color: '#2563EB', bg: '#DBEAFE' },
                    { label: 'Approved', val: documents?.approved, icon: FileText, color: '#16A34A', bg: '#DCFCE7' },
                    { label: 'Pending Review', val: documents?.pending, icon: FileText, color: '#D97706', bg: '#FEF3C7' },
                    { label: 'Total Users', val: users?.total, icon: Users, color: '#7C3AED', bg: '#EDE9FE' },
                    { label: 'Employees', val: users?.employees, icon: Users, color: '#0891B2', bg: '#CFFAFE' },
                    { label: 'Departments', val: departments?.total, icon: Building2, color: '#DC2626', bg: '#FEE2E2' },
                ].map(({ label, val, icon: Icon, color, bg }) => (
                    <div key={label} className="stat-card">
                        <div className="stat-icon" style={{ background: bg }}><Icon size={20} color={color} /></div>
                        <div className="stat-value" style={{ color }}>{val ?? '—'}</div>
                        <div className="stat-label">{label}</div>
                    </div>
                ))}
            </div>

            <div className="grid-2">
                {/* Monthly Upload Chart */}
                <div className="card">
                    <div className="card-header"><div className="card-title">📅 Monthly Uploads (Last 12 Months)</div></div>
                    <div className="card-body">
                        {(!monthlyUploads || monthlyUploads.length === 0) ? (
                            <div className="empty-state"><div className="empty-state-icon">📊</div><h3>No data yet</h3></div>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 140, padding: '0 8px' }}>
                                {monthlyUploads.slice(-12).map((m, i) => {
                                    const height = Math.max(8, (m.count / MAX_BAR(monthlyUploads)) * 120);
                                    return (
                                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                                            <div style={{ fontSize: 9, color: 'var(--gray-500)', fontWeight: 700 }}>{m.count}</div>
                                            <div style={{ width: '100%', height, background: 'var(--royal-blue)', borderRadius: '3px 3px 0 0', transition: 'height 0.3s ease' }} title={`${m.month}: ${m.count}`} />
                                            <div style={{ fontSize: 9, color: 'var(--gray-400)', transform: 'rotate(-45deg)', whiteSpace: 'nowrap', transformOrigin: 'top left' }}>{m.month?.slice(0, 6)}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Documents by Department */}
                <div className="card">
                    <div className="card-header"><div className="card-title">🏢 Documents by Department</div></div>
                    <div className="card-body">
                        {(!docsByDepartment || docsByDepartment.length === 0) ? (
                            <div className="empty-state"><div className="empty-state-icon">📊</div><h3>No data yet</h3></div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {docsByDepartment.map((d, i) => (
                                    <div key={i}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                            <span style={{ fontSize: 13, fontWeight: 600 }}>{d.name}</span>
                                            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--royal-blue)' }}>{d.count}</span>
                                        </div>
                                        <div style={{ height: 8, background: 'var(--gray-100)', borderRadius: 4, overflow: 'hidden' }}>
                                            <div style={{
                                                height: '100%',
                                                width: `${(d.count / MAX_BAR(docsByDepartment)) * 100}%`,
                                                background: `hsl(${220 + i * 30}, 70%, 50%)`,
                                                borderRadius: 4, transition: 'width 0.5s ease'
                                            }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Document Status Breakdown */}
            <div className="card" style={{ marginTop: 20 }}>
                <div className="card-header"><div className="card-title">📋 Document Status Breakdown</div></div>
                <div className="card-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
                    {[
                        { key: 'pending', label: 'Pending', color: '#D97706', bg: '#FEF3C7' },
                        { key: 'under_review', label: 'Under Review', color: '#2563EB', bg: '#DBEAFE' },
                        { key: 'approved', label: 'Approved', color: '#16A34A', bg: '#DCFCE7' },
                        { key: 'rejected', label: 'Rejected', color: '#DC2626', bg: '#FEE2E2' },
                        { key: 'escalated', label: 'Escalated', color: '#0891B2', bg: '#CFFAFE' },
                    ].map(({ key, label, color, bg }) => (
                        <div key={key} style={{ background: bg, borderRadius: 10, padding: '14px', textAlign: 'center' }}>
                            <div style={{ fontSize: 24, fontWeight: 900, color }}>{documents?.[key] ?? 0}</div>
                            <div style={{ fontSize: 12, color, fontWeight: 600, marginTop: 4 }}>{label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </Layout>
    );
}
