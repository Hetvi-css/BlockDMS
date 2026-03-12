import React, { useEffect, useState } from 'react';
import { getOverviewReport } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format } from 'date-fns';
import { BarChart2 } from 'lucide-react';

const STATUS_COLORS = { approved: '#16A34A', pending: '#F59E0B', rejected: '#DC2626', escalated: '#7c3aed', under_review: '#0ea5e9' };
const PIE_COLORS = ['#1E3A8A', '#16A34A', '#F59E0B', '#DC2626', '#7c3aed', '#0ea5e9'];

export default function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOverviewReport().then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: 80 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>;
  if (!data) return <div className="empty-state"><div className="empty-state-title">Could not load report data</div></div>;

  const { overview, recentActivity } = data;

  const statusChartData = overview.docsByStatus.map(s => ({
    name: s._id?.replace('_', ' ').toUpperCase() || 'UNKNOWN',
    value: s.count,
    fill: STATUS_COLORS[s._id] || '#6b7280'
  }));

  const categoryChartData = overview.docsByCategory.map(c => ({
    name: c._id?.charAt(0).toUpperCase() + c._id?.slice(1) || 'Unknown',
    count: c.count
  }));

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="section-title">Reports & Analytics</div>
          <div className="section-subtitle">System overview and document pipeline metrics</div>
        </div>
      </div>

      {/* KPIs */}
      <div className="stat-cards" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Documents', value: overview.totalDocuments, color: '#1E3A8A' },
          { label: 'Active Users', value: overview.totalUsers, color: '#16A34A' },
          { label: 'Blockchain Tx', value: overview.totalChainTx, color: '#7c3aed' },
          { label: 'Audit Records', value: overview.totalAuditLogs, color: '#F59E0B' },
        ].map(kpi => (
          <div key={kpi.label} className="stat-card">
            <div style={{ width: 50, height: 50, borderRadius: 12, background: kpi.color + '1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BarChart2 size={22} color={kpi.color} />
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#1f2937' }}>{kpi.value}</div>
              <div style={{ fontSize: 13, color: '#6b7280' }}>{kpi.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Status Pie Chart */}
        <div className="card">
          <div className="card-header"><span className="card-title">Documents by Status</span></div>
          <div className="card-body">
            {statusChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={statusChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                    {statusChartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <div className="empty-state"><div className="empty-state-text">No data yet</div></div>}
          </div>
        </div>

        {/* Category Bar Chart */}
        <div className="card">
          <div className="card-header"><span className="card-title">Documents by Category</span></div>
          <div className="card-body">
            {categoryChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={categoryChartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#1E3A8A" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="empty-state"><div className="empty-state-text">No data yet</div></div>}
          </div>
        </div>
      </div>

      {/* Department breakdown */}
      {overview.docsByDept?.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header"><span className="card-title">Documents by Department</span></div>
          <div className="card-body">
            {overview.docsByDept.map(d => (
              <div key={d._id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <div style={{ width: 140, fontSize: 13, fontWeight: 500, color: '#374151', flexShrink: 0 }}>{d._id || 'Unknown'}</div>
                <div style={{ flex: 1, background: '#f3f4f6', borderRadius: 4, height: 8, overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min((d.count / overview.totalDocuments) * 100, 100)}%`, height: '100%', background: '#1E3A8A', borderRadius: 4, transition: 'width .5s' }} />
                </div>
                <div style={{ width: 30, fontSize: 13, fontWeight: 600, color: '#1E3A8A', textAlign: 'right' }}>{d.count}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="card">
        <div className="card-header"><span className="card-title">Recent System Activity</span></div>
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Action</th><th>Performed By</th><th>Document</th><th>Time</th></tr></thead>
              <tbody>
                {recentActivity.map(log => (
                  <tr key={log._id}>
                    <td><span style={{ fontSize: 12, fontWeight: 600, color: '#1E3A8A' }}>{log.action?.replace(/_/g, ' ')}</span></td>
                    <td style={{ fontSize: 13 }}>{log.performedBy?.name}<div style={{ fontSize: 11, color: '#9ca3af' }}>{log.performedBy?.role}</div></td>
                    <td style={{ fontSize: 13 }}>{log.targetDocument?.title || '—'}</td>
                    <td style={{ fontSize: 12, color: '#9ca3af' }}>{format(new Date(log.timestamp), 'dd MMM, HH:mm')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
