import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDocuments } from '../services/api';
import { CheckSquare, Eye } from 'lucide-react';
import { format } from 'date-fns';

const statusBadge = { pending: 'badge-pending', approved: 'badge-approved', rejected: 'badge-rejected', escalated: 'badge-escalated', under_review: 'badge-under_review' };

export default function PendingApprovals() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    getDocuments({ status: statusFilter || undefined })
      .then(r => setDocs(r.data.documents || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [statusFilter]);

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="section-title">Pending Approvals</div>
          <div className="section-subtitle">Review and action documents in your department</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['pending', 'escalated', 'under_review', 'approved', 'rejected'].map(s => (
            <button
              key={s}
              className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setStatusFilter(s)}
              style={{ textTransform: 'capitalize' }}
            >{s.replace('_', ' ')}</button>
          ))}
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
        ) : docs.length === 0 ? (
          <div className="empty-state">
            <CheckSquare size={48} className="empty-state-icon" />
            <div className="empty-state-title">No documents to review</div>
            <div className="empty-state-text">All documents in this category have been processed</div>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Document</th><th>Uploaded By</th><th>Department</th><th>Category</th><th>Status</th><th>Date</th><th>Action</th></tr>
              </thead>
              <tbody>
                {docs.map(doc => (
                  <tr key={doc._id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{doc.title}</div>
                      <div style={{ fontSize: 12, color: '#9ca3af' }}>{doc.fileName}</div>
                    </td>
                    <td>{doc.uploadedBy?.name}<div style={{ fontSize: 12, color: '#9ca3af' }}>{doc.uploadedBy?.email}</div></td>
                    <td>{doc.department || '—'}</td>
                    <td style={{ textTransform: 'capitalize' }}>{doc.category}</td>
                    <td><span className={`badge ${statusBadge[doc.status]}`}>{doc.status?.replace('_', ' ')}</span></td>
                    <td>{format(new Date(doc.createdAt), 'dd MMM yyyy')}</td>
                    <td>
                      <button className="btn btn-primary btn-sm" onClick={() => navigate(`/documents/${doc._id}`)}>
                        <Eye size={14} /> Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
