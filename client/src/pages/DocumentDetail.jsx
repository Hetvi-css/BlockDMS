import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDocumentById, approveDocument, rejectDocument, escalateDocument, getDocumentChain } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, XCircle, ArrowUp, Link2, Calendar, User, Hash, File } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const statusBadge = { pending: 'badge-pending', approved: 'badge-approved', rejected: 'badge-rejected', escalated: 'badge-escalated', under_review: 'badge-under_review' };

export default function DocumentDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [doc, setDoc] = useState(null);
  const [chain, setChain] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [comment, setComment] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      getDocumentById(id).then(r => setDoc(r.data.document)),
      getDocumentChain(id).then(r => setChain(r.data.history || []))
    ]).catch(e => toast.error('Failed to load document')).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const doApprove = async () => {
    setSubmitting(true);
    try { await approveDocument(id, { comment }); toast.success('Document approved'); load(); setModal(null); setComment(''); }
    catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const doReject = async () => {
    if (!reason.trim()) { toast.error('Rejection reason is required'); return; }
    setSubmitting(true);
    try { await rejectDocument(id, { reason, comment }); toast.success('Document rejected'); load(); setModal(null); setReason(''); setComment(''); }
    catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const doEscalate = async () => {
    setSubmitting(true);
    try { await escalateDocument(id, { comment }); toast.success('Document escalated to Admin'); load(); setModal(null); setComment(''); }
    catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>;
  if (!doc) return <div className="empty-state"><div className="empty-state-title">Document not found</div></div>;

  const canReview = (user?.role === 'hod' || user?.role === 'admin') && ['pending', 'under_review', 'escalated'].includes(doc.status);

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="section-title">{doc.title}</div>
          <div className="section-subtitle">{doc.fileName} • {doc.category}</div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className={`badge ${statusBadge[doc.status] || ''}`} style={{ fontSize: 13, padding: '5px 14px' }}>
            {doc.status?.replace('_', ' ').toUpperCase()}
          </span>
          {canReview && <>
            <button className="btn btn-success btn-sm" onClick={() => setModal('approve')}><CheckCircle size={14} />Approve</button>
            <button className="btn btn-danger btn-sm" onClick={() => setModal('reject')}><XCircle size={14} />Reject</button>
            {user?.role === 'hod' && <button className="btn btn-warning btn-sm" onClick={() => setModal('escalate')}><ArrowUp size={14} />Escalate</button>}
          </>}
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Left: Document Info */}
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header"><span className="card-title">Document Details</span></div>
            <div className="card-body">
              {[
                { icon: User, label: 'Uploaded By', value: doc.uploadedBy?.name },
                { icon: Calendar, label: 'Upload Date', value: format(new Date(doc.createdAt), 'dd MMM yyyy, HH:mm') },
                { icon: File, label: 'File Type', value: doc.fileType || 'N/A' },
                { icon: Hash, label: 'SHA-256 Hash', value: doc.hash, mono: true },
                { icon: Link2, label: 'IPFS CID', value: doc.cid, mono: true },
                { icon: Link2, label: 'Blockchain TX', value: doc.blockchainTxId, mono: true },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <row.icon size={16} style={{ color: '#9ca3af', flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 2 }}>{row.label}</div>
                    {row.mono ? (
                      <div className="hash-block" style={{ marginTop: 4, fontSize: 11 }}>{row.value || '—'}</div>
                    ) : (
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{row.value || '—'}</div>
                    )}
                  </div>
                </div>
              ))}
              {doc.description && (
                <div style={{ paddingTop: 12 }}>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 6 }}>DESCRIPTION</div>
                  <div style={{ fontSize: 14, color: '#374151' }}>{doc.description}</div>
                </div>
              )}
              {doc.rejectionReason && (
                <div className="alert alert-error" style={{ marginTop: 12 }}>
                  <XCircle size={16} /><div><strong>Rejection Reason:</strong> {doc.rejectionReason}</div>
                </div>
              )}
            </div>
          </div>

          {/* Comments */}
          {doc.comments?.length > 0 && (
            <div className="card">
              <div className="card-header"><span className="card-title">Comments</span></div>
              <div className="card-body" style={{ padding: '8px 20px' }}>
                {doc.comments.map((c, i) => (
                  <div key={i} style={{ padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{c.user?.name}</span>
                      <span style={{ fontSize: 12, color: '#9ca3af' }}>{format(new Date(c.timestamp), 'dd MMM, HH:mm')}</span>
                    </div>
                    <div style={{ fontSize: 14, color: '#4b5563' }}>{c.text}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Blockchain History */}
        <div className="card">
          <div className="card-header"><span className="card-title">🔗 Blockchain History</span></div>
          <div className="card-body">
            {chain.length === 0 ? (
              <div className="empty-state"><div className="empty-state-text">No blockchain records yet</div></div>
            ) : (
              <div className="timeline">
                {chain.map((record, i) => (
                  <div className="timeline-item" key={record._id}>
                    <div className="timeline-dot" style={{ background: record.action === 'UPLOAD' ? '#1E3A8A' : record.action === 'APPROVE' ? '#16A34A' : record.action === 'REJECT' ? '#DC2626' : '#F59E0B' }} />
                    <div className="timeline-content">
                      <div className="timeline-time">{format(new Date(record.timestamp), 'dd MMM yyyy, HH:mm:ss')}</div>
                      <div className="timeline-title">{record.action} — Block #{record.blockNumber}</div>
                      <div className="timeline-desc">By: {record.initiatedBy?.name}</div>
                      <div className="hash-block" style={{ marginTop: 6, fontSize: 10 }}>{record.transactionId}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                {modal === 'approve' ? '✅ Approve Document' : modal === 'reject' ? '❌ Reject Document' : '⬆️ Escalate to Admin'}
              </div>
              <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              {modal === 'reject' && (
                <div className="form-group">
                  <label className="form-label">Rejection Reason *</label>
                  <input className="form-control" placeholder="State the reason for rejection..." value={reason} onChange={e => setReason(e.target.value)} />
                </div>
              )}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Additional Comment (optional)</label>
                <textarea className="form-control" placeholder="Add any comment..." value={comment} onChange={e => setComment(e.target.value)} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
              <button
                disabled={submitting}
                className={`btn ${modal === 'approve' ? 'btn-success' : modal === 'reject' ? 'btn-danger' : 'btn-warning'}`}
                onClick={modal === 'approve' ? doApprove : modal === 'reject' ? doReject : doEscalate}
              >
                {submitting ? 'Processing...' : modal === 'approve' ? 'Confirm Approval' : modal === 'reject' ? 'Confirm Rejection' : 'Escalate to Admin'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
