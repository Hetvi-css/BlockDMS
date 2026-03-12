import React, { useEffect, useState } from 'react';
import { getAuditLogs } from '../services/api';
import { ScrollText } from 'lucide-react';
import { format } from 'date-fns';

const ACTION_COLORS = {
  DOCUMENT_APPROVED: '#16A34A', DOCUMENT_REJECTED: '#DC2626',
  DOCUMENT_UPLOADED: '#1E3A8A', DOCUMENT_ESCALATED: '#F59E0B',
  DOCUMENT_VERIFIED: '#0ea5e9', BLOCKCHAIN_RECORDED: '#7c3aed',
  USER_LOGIN: '#6b7280', USER_CREATED: '#059669',
  DOCUMENT_TAMPERED: '#DC2626'
};

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [action, setAction] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    getAuditLogs({ action, page, limit: 30 })
      .then(r => { setLogs(r.data.logs || []); setTotal(r.data.total || 0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [action, page]);

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="section-title">Audit Logs</div>
          <div className="section-subtitle">Complete tamper-proof activity trail • {total} total records</div>
        </div>
        <select className="form-control" style={{ width: 220 }} value={action} onChange={e => { setAction(e.target.value); setPage(1); }}>
          <option value="">All Actions</option>
          <option value="DOCUMENT_UPLOADED">Document Uploaded</option>
          <option value="DOCUMENT_APPROVED">Document Approved</option>
          <option value="DOCUMENT_REJECTED">Document Rejected</option>
          <option value="DOCUMENT_ESCALATED">Document Escalated</option>
          <option value="DOCUMENT_VERIFIED">Document Verified</option>
          <option value="BLOCKCHAIN_RECORDED">Blockchain Recorded</option>
          <option value="USER_LOGIN">User Login</option>
          <option value="USER_CREATED">User Created</option>
        </select>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
        ) : logs.length === 0 ? (
          <div className="empty-state">
            <ScrollText size={48} className="empty-state-icon" />
            <div className="empty-state-title">No audit logs</div>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Timestamp</th><th>Action</th><th>Performed By</th><th>Document</th><th>Details</th></tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log._id}>
                    <td style={{ fontSize: 13, color: '#6b7280', whiteSpace: 'nowrap' }}>
                      {format(new Date(log.timestamp), 'dd MMM yyyy')}<br />
                      <span style={{ fontSize: 11 }}>{format(new Date(log.timestamp), 'HH:mm:ss')}</span>
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-block',
                        background: (ACTION_COLORS[log.action] || '#6b7280') + '1a',
                        color: ACTION_COLORS[log.action] || '#6b7280',
                        padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600
                      }}>{log.action?.replace(/_/g, ' ')}</span>
                    </td>
                    <td>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{log.performedBy?.name || 'System'}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af' }}>{log.performedBy?.role}</div>
                    </td>
                    <td style={{ fontSize: 13 }}>{log.targetDocument?.title || '—'}</td>
                    <td style={{ fontSize: 12, color: '#4b5563', maxWidth: 260 }}>{log.details || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ padding: '12px 20px', display: 'flex', gap: 8, justifyContent: 'flex-end', borderTop: '1px solid #f3f4f6' }}>
              <button className="btn btn-secondary btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Previous</button>
              <span style={{ fontSize: 13, color: '#6b7280', lineHeight: '34px' }}>Page {page}</span>
              <button className="btn btn-secondary btn-sm" disabled={logs.length < 30} onClick={() => setPage(p => p + 1)}>Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
