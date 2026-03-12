import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDocumentStats, getBlockchainStats, getAuditLogs } from '../services/api';
import { FileText, CheckCircle, Clock, XCircle, Link2, ScrollText, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const StatCard = ({ icon: Icon, label, value, colorClass }) => (
  <div className="stat-card">
    <div className={`stat-icon ${colorClass}`}><Icon size={24} /></div>
    <div className="stat-info">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  </div>
);

const ACTION_LABELS = {
  DOCUMENT_UPLOADED: 'Document Uploaded',
  DOCUMENT_APPROVED: 'Document Approved',
  DOCUMENT_REJECTED: 'Document Rejected',
  DOCUMENT_ESCALATED: 'Document Escalated',
  DOCUMENT_VERIFIED: 'Document Verified',
  USER_LOGIN: 'User Login',
  USER_CREATED: 'User Created',
  BLOCKCHAIN_RECORDED: 'Blockchain Recorded',
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [docStats, setDocStats] = useState(null);
  const [chainStats, setChainStats] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);

  useEffect(() => {
    getDocumentStats().then(r => setDocStats(r.data.stats)).catch(() => {});
    getBlockchainStats().then(r => setChainStats(r.data.stats)).catch(() => {});
    getAuditLogs({ limit: 8 }).then(r => setRecentLogs(r.data.logs || [])).catch(() => {});
  }, []);

  const getCount = (status) => {
    return docStats?.byStatus?.find(s => s._id === status)?.count || 0;
  };

  return (
    <div>
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="welcome-title">Welcome back, {user?.name}! 👋</div>
        <div className="welcome-sub">
          {user?.department} &nbsp;•&nbsp; {user?.role?.toUpperCase()} &nbsp;•&nbsp; {format(new Date(), 'EEEE, dd MMM yyyy')}
        </div>
        <div style={{ marginTop: 16 }}>
          <span className="chain-status">
            <span className="chain-status-dot" />
            Blockchain Network Live
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-cards" style={{ marginBottom: 24 }}>
        <StatCard icon={FileText} label="Total Documents" value={docStats?.total ?? '—'} colorClass="blue" />
        <StatCard icon={CheckCircle} label="Approved" value={getCount('approved')} colorClass="green" />
        <StatCard icon={Clock} label="Pending" value={getCount('pending')} colorClass="amber" />
        <StatCard icon={XCircle} label="Rejected" value={getCount('rejected')} colorClass="red" />
        <StatCard icon={Link2} label="Blockchain Tx" value={chainStats?.totalTransactions ?? '—'} colorClass="purple" />
      </div>

      {/* Actions + Recent Logs */}
      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Quick Actions */}
        <div className="card">
          <div className="card-header"><span className="card-title">Quick Actions</span></div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button className="btn btn-primary" onClick={() => navigate('/documents/upload')}>
              <Upload size={16} /> Upload New Document
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/documents')}>
              <FileText size={16} /> View My Documents
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/verify')}>
              <Link2 size={16} /> Verify a Document
            </button>
            {(user?.role === 'hod' || user?.role === 'admin') && (
              <button className="btn btn-secondary" onClick={() => navigate('/approvals')}>
                <CheckCircle size={16} /> Review Pending Approvals
              </button>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <span className="card-title"><ScrollText size={16} style={{ display: 'inline', marginRight: 6 }} />Recent Activity</span>
          </div>
          <div className="card-body" style={{ padding: '8px 0' }}>
            {recentLogs.length === 0 ? (
              <div className="empty-state"><div className="empty-state-text">No activity yet</div></div>
            ) : recentLogs.map(log => (
              <div key={log._id} style={{ padding: '10px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>
                    {ACTION_LABELS[log.action] || log.action}
                  </div>
                  <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
                    {log.performedBy?.name} • {format(new Date(log.timestamp), 'dd MMM, HH:mm')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Blockchain Status */}
      {chainStats && (
        <div className="card" style={{ marginTop: 20 }}>
          <div className="card-header"><span className="card-title">🔗 Blockchain Network Status</span></div>
          <div className="card-body">
            <div className="grid-3">
              <div style={{ textAlign: 'center', padding: '12px 0' }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#1E3A8A' }}>{chainStats.totalTransactions}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>Total Transactions</div>
              </div>
              <div style={{ textAlign: 'center', padding: '12px 0' }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#16A34A' }}>{chainStats.latestBlock}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>Latest Block</div>
              </div>
              <div style={{ textAlign: 'center', padding: '12px 0' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>Hyperledger Fabric</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>Channel: {chainStats.channel}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
