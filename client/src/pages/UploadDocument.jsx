import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadDocument } from '../services/api';
import { Upload, File, X, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function UploadDocument() {
  const navigate = useNavigate();
  const fileRef = useRef();
  const [form, setForm] = useState({ title: '', description: '', category: 'other', tags: '' });
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  const handleFile = (f) => {
    if (!f) return;
    if (f.size > 25 * 1024 * 1024) { toast.error('File too large (max 25 MB)'); return; }
    setFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const toBase64 = (f) => new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => res(reader.result.split(',')[1]);
    reader.onerror = rej;
    reader.readAsDataURL(f);
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { toast.error('Please select a file'); return; }
    if (!form.title.trim()) { toast.error('Document title is required'); return; }
    setLoading(true);
    try {
      const fileData = await toBase64(file);
      const res = await uploadDocument({
        title: form.title,
        description: form.description,
        category: form.category,
        tags: form.tags,
        fileData,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size
      });
      setSuccess(res.data);
      toast.success('Document uploaded and recorded on blockchain!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="card" style={{ maxWidth: 600, margin: '0 auto' }}>
        <div className="card-body" style={{ textAlign: 'center', padding: '48px 32px' }}>
          <CheckCircle size={64} color="#16A34A" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1f2937', marginBottom: 8 }}>Upload Successful!</h2>
          <p style={{ color: '#6b7280', marginBottom: 24 }}>Your document has been securely uploaded and recorded on the blockchain.</p>

          <div style={{ textAlign: 'left', background: '#f9fafb', borderRadius: 8, padding: 16, marginBottom: 24 }}>
            <div style={{ marginBottom: 10 }}>
              <span style={{ fontSize: 12, color: '#6b7280' }}>Document Title</span>
              <div style={{ fontWeight: 600 }}>{success.document?.title}</div>
            </div>
            <div style={{ marginBottom: 10 }}>
              <span style={{ fontSize: 12, color: '#6b7280' }}>IPFS CID</span>
              <div className="hash-block">{success.ipfs?.cid}</div>
            </div>
            <div style={{ marginBottom: 10 }}>
              <span style={{ fontSize: 12, color: '#6b7280' }}>SHA-256 Hash</span>
              <div className="hash-block">{success.document?.hash}</div>
            </div>
            <div style={{ marginBottom: 10 }}>
              <span style={{ fontSize: 12, color: '#6b7280' }}>Blockchain Transaction ID</span>
              <div className="hash-block">{success.blockchain?.transactionId}</div>
            </div>
            <div>
              <span style={{ fontSize: 12, color: '#6b7280' }}>Block Number</span>
              <div style={{ fontWeight: 600 }}>#{success.blockchain?.blockNumber}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => navigate(`/documents/${success.document?._id}`)}>View Document</button>
            <button className="btn btn-secondary" onClick={() => { setSuccess(null); setFile(null); setForm({ title: '', description: '', category: 'other', tags: '' }); }}>Upload Another</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <div className="section-header" style={{ marginBottom: 20 }}>
        <div>
          <div className="section-title">Upload Document</div>
          <div className="section-subtitle">Your document will be hashed, stored on IPFS, and recorded on blockchain</div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-header"><span className="card-title">Document Information</span></div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">Document Title *</label>
              <input className="form-control" placeholder="e.g. Q3 Research Report 2024" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-control" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  <option value="other">Other</option>
                  <option value="report">Report</option>
                  <option value="contract">Contract</option>
                  <option value="policy">Policy</option>
                  <option value="invoice">Invoice</option>
                  <option value="research">Research</option>
                  <option value="proposal">Proposal</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Tags (comma-separated)</label>
                <input className="form-control" placeholder="e.g. finance, 2024, q3" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Description</label>
              <textarea className="form-control" placeholder="Brief description of this document..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-header"><span className="card-title">File Upload</span></div>
          <div className="card-body">
            <div
              className={`file-upload-area${dragOver ? ' drag-over' : ''}`}
              onClick={() => fileRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <Upload size={36} className="file-upload-icon" />
              <div className="file-upload-text">Click to browse or drag & drop your file</div>
              <div className="file-upload-subtext">PDF, DOCX, XLSX, PNG, JPG — Max 25 MB</div>
              <input ref={fileRef} type="file" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
            </div>
            {file && (
              <div className="file-selected">
                <File size={20} color="#1E3A8A" />
                <div className="file-selected-name">{file.name}</div>
                <div className="file-selected-size">{(file.size / 1024).toFixed(1)} KB</div>
                <button type="button" onClick={() => setFile(null)} style={{ background: 'none', color: '#dc2626', padding: 4 }}><X size={16} /></button>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2, borderColor: 'rgba(255,255,255,.3)', borderTopColor: 'white' }} />Uploading & Hashing...</> : <><Upload size={16} />Upload & Record on Blockchain</>}
          </button>
          <button type="button" className="btn btn-secondary btn-lg" onClick={() => navigate('/documents')}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
