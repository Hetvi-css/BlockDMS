import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDocuments } from '../services/api';
import { FileText, Search, Eye, Upload } from 'lucide-react';
import { format } from 'date-fns';

const statusColors = {
  pending: 'badge-pending', approved: 'badge-approved',
  rejected: 'badge-rejected', escalated: 'badge-escalated', under_review: 'badge-under_review'
};

export default function MyDocuments() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ search: '', status: '', category: '' });
  const navigate = useNavigate();

  const fetchDocs = () => {
    setLoading(true);
    getDocuments({ search: filter.search, status: filter.status, category: filter.category })
      .then(r => setDocs(r.data.documents || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDocs(); }, [filter.status, filter.category]);

  const handleSearch = (e) => { e.preventDefault(); fetchDocs(); };

  const formatSize = (bytes) => {
    if (!bytes) return '—';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="section-title">My Documents</div>
          <div className="section-subtitle">All documents you've uploaded to the system</div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/documents/upload')}>
          <Upload size={16} /> Upload New
        </button>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, flex: 1 }}>
          <div className="search-input-wrap">
            <Search size={15} className="search-icon" />
            <input
              className="form-control search-input"
              placeholder="Search documents..."
              value={filter.search}
              onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-sm">Search</button>
        </form>
        <select className="form-control" style={{ width: 140 }} value={filter.status} onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}>
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="escalated">Escalated</option>
        </select>
        <select className="form-control" style={{ width: 140 }} value={filter.category} onChange={e => setFilter(f => ({ ...f, category: e.target.value }))}>
          <option value="">All Categories</option>
          <option value="report">Report</option>
          <option value="contract">Contract</option>
          <option value="policy">Policy</option>
          <option value="invoice">Invoice</option>
          <option value="research">Research</option>
          <option value="proposal">Proposal</option>
        </select>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
        ) : docs.length === 0 ? (
          <div className="empty-state">
            <FileText size={48} className="empty-state-icon" />
            <div className="empty-state-title">No documents found</div>
            <div className="empty-state-text">Upload your first document to get started</div>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Document</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Size</th>
                  <th>Uploaded</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {docs.map(doc => (
                  <tr key={doc._id}>
                    <td>
                      <div style={{ fontWeight: 500, color: '#1f2937' }}>{doc.title}</div>
                      <div style={{ fontSize: 12, color: '#9ca3af' }}>{doc.fileName}</div>
                    </td>
                    <td><span style={{ textTransform: 'capitalize' }}>{doc.category}</span></td>
                    <td>
                      <span className={`badge ${statusColors[doc.status] || ''}`} style={{ textTransform: 'capitalize' }}>
                        {doc.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td>{formatSize(doc.fileSize)}</td>
                    <td>{format(new Date(doc.createdAt), 'dd MMM yyyy')}</td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/documents/${doc._id}`)}>
                        <Eye size={14} /> View
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
