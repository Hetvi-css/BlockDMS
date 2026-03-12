import React, { useState, useRef } from 'react';
import { getDocuments, verifyDocument } from '../services/api';
import { Shield, CheckCircle, XCircle, Upload, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function VerifyDocument() {
  const [mode, setMode] = useState('upload'); // 'upload' | 'id'
  const [file, setFile] = useState(null);
  const [docId, setDocId] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();

  const searchDocs = async (q) => {
    if (q.length < 2) return;
    try {
      const res = await getDocuments({ search: q });
      setSearchResults(res.data.documents || []);
    } catch {}
  };

  const toBase64 = (f) => new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => res(reader.result.split(',')[1]);
    reader.onerror = rej;
    reader.readAsDataURL(f);
  });

  const handleVerify = async () => {
    const id = selectedDoc?._id || docId;
    if (!id) { toast.error('Select a document first'); return; }
    setLoading(true);
    try {
      let payload = {};
      if (file) payload.fileData = await toBase64(file);
      const res = await verifyDocument(id, payload);
      setResult(res.data);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div className="section-header" style={{ marginBottom: 20 }}>
        <div>
          <div className="section-title">Document Verification</div>
          <div className="section-subtitle">Verify document integrity against the blockchain record</div>
        </div>
      </div>

      {!result ? (
        <div className="card">
          <div className="card-header"><span className="card-title">Enter Verification Details</span></div>
          <div className="card-body">
            {/* Search by name */}
            <div className="form-group">
              <label className="form-label">Search Document</label>
              <div className="search-input-wrap">
                <Search size={15} className="search-icon" />
                <input
                  className="form-control search-input"
                  placeholder="Type document title to search..."
                  onChange={e => searchDocs(e.target.value)}
                />
              </div>
              {searchResults.length > 0 && (
                <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, marginTop: 4, overflow: 'hidden', background: 'white', boxShadow: '0 4px 12px rgba(0,0,0,.1)', zIndex: 10, position: 'relative' }}>
                  {searchResults.map(d => (
                    <div
                      key={d._id}
                      onClick={() => { setSelectedDoc(d); setSearchResults([]); }}
                      style={{ padding: '10px 16px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6', transition: 'background .15s' }}
                      onMouseEnter={e => e.target.style.background = '#f9fafb'}
                      onMouseLeave={e => e.target.style.background = 'white'}
                    >
                      <div style={{ fontWeight: 500, fontSize: 14 }}>{d.title}</div>
                      <div style={{ fontSize: 12, color: '#9ca3af' }}>{d.fileName} • {d.status}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedDoc && (
              <div className="alert alert-info" style={{ marginBottom: 16 }}>
                <Shield size={16} />
                <div>
                  <strong>Selected:</strong> {selectedDoc.title}
                  <div style={{ fontSize: 12, marginTop: 2 }}>Stored Hash: <code>{selectedDoc.hash?.substring(0, 32)}...</code></div>
                </div>
              </div>
            )}

            <div className="divider" />

            <div className="form-group">
              <label className="form-label">Upload File to Verify (optional)</label>
              <div className="file-upload-area" onClick={() => fileRef.current?.click()}>
                <Upload size={28} className="file-upload-icon" />
                <div className="file-upload-text">Upload the original file to compare its hash</div>
                <div className="file-upload-subtext">If not provided, stored hash will be used for verification</div>
                <input ref={fileRef} type="file" style={{ display: 'none' }} onChange={e => setFile(e.target.files[0])} />
              </div>
              {file && <div className="file-selected" style={{ marginTop: 10 }}><span className="file-selected-name">{file.name}</span><span className="file-selected-size">{(file.size/1024).toFixed(1)} KB</span></div>}
            </div>

            <button className="btn btn-primary btn-lg" disabled={loading || !selectedDoc} onClick={handleVerify} style={{ width: '100%', justifyContent: 'center' }}>
              {loading ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2, borderColor: 'rgba(255,255,255,.3)', borderTopColor: 'white' }} />Verifying on Blockchain...</> : <><Shield size={16} />Verify Document Integrity</>}
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-body verify-result">
              {result.verified ? (
                <>
                  <CheckCircle size={72} className="verify-icon" color="#16A34A" />
                  <div className="verify-title verify-valid">✅ Document is Authentic</div>
                  <p style={{ color: '#6b7280', maxWidth: 400, margin: '0 auto 24px' }}>
                    The document hash matches the blockchain record. No tampering has been detected.
                  </p>
                </>
              ) : (
                <>
                  <XCircle size={72} className="verify-icon" color="#DC2626" />
                  <div className="verify-title verify-invalid">⚠️ Tampering Detected!</div>
                  <p style={{ color: '#6b7280', maxWidth: 400, margin: '0 auto 24px' }}>
                    The document hash does NOT match the blockchain record. This document may have been modified.
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header"><span className="card-title">Verification Details</span></div>
            <div className="card-body">
              <div style={{ display: 'grid', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>STORED HASH (Blockchain)</div>
                  <div className={`hash-block ${result.verified ? 'hash-valid' : ''}`}>{result.blockchain?.originalHash || result.document?.storedHash}</div>
                </div>
                {result.document?.currentHash && result.document?.currentHash !== result.document?.storedHash && (
                  <div>
                    <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>PROVIDED FILE HASH</div>
                    <div className={`hash-block ${result.verified ? 'hash-valid' : 'hash-invalid'}`}>{result.document?.currentHash}</div>
                  </div>
                )}
                <div className="grid-2">
                  <div>
                    <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>TRANSACTION ID</div>
                    <div className="hash-block" style={{ fontSize: 11 }}>{result.blockchain?.transactionId}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>BLOCK NUMBER</div>
                    <div style={{ fontWeight: 700, fontSize: 18, color: '#1E3A8A' }}>#{result.blockchain?.blockNumber}</div>
                  </div>
                </div>
                {result.blockchain?.registeredAt && (
                  <div>
                    <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>ORIGINALLY REGISTERED</div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{format(new Date(result.blockchain.registeredAt), 'dd MMM yyyy, HH:mm:ss')}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" onClick={() => { setResult(null); setSelectedDoc(null); setFile(null); }}>Verify Another Document</button>
          </div>
        </div>
      )}
    </div>
  );
}
