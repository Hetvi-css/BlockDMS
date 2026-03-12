import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout.jsx';
import { blockchainAPI } from '../../services/api.js';
import { ChevronLeft, ChevronRight, CheckCircle, AlertTriangle } from 'lucide-react';

export default function BlockchainLogs() {
    const [blocks, setBlocks] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [integrity, setIntegrity] = useState(null);
    const [checking, setChecking] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const r = await blockchainAPI.chain({ page, limit: 10 });
            setBlocks(r.data.blocks || []);
            setTotal(r.data.total || 0);
            setTotalPages(r.data.totalPages || 1);
        } catch { } finally { setLoading(false); }
    };

    useEffect(() => { load(); }, [page]);

    const handleIntegrityCheck = async () => {
        setChecking(true);
        try {
            const r = await blockchainAPI.integrity();
            setIntegrity(r.data.integrity);
        } catch { } finally { setChecking(false); }
    };

    const txTypeColor = { UPLOAD_DOCUMENT: '#2563EB', APPROVE_DOCUMENT: '#16A34A', REJECT_DOCUMENT: '#DC2626', ESCALATE_DOCUMENT: '#F59E0B', VERIFY_DOCUMENT: '#6D28D9', REGISTER_USER: '#0891B2' };

    return (
        <Layout title="Blockchain Ledger" subtitle={`${total} blocks in the chain`}>
            {/* Integrity Check Banner */}
            <div className="card" style={{ marginBottom: 20, background: 'var(--navy-900)', border: 'none' }}>
                <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ color: 'white', fontWeight: 800, fontSize: 16 }}>⛓ Full Chain Integrity Verification</div>
                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 4 }}>
                            Recompute all {total} block hashes and verify SHA-256 linkage integrity
                        </div>
                        {integrity && (
                            <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                                {integrity.isValid ? (
                                    <div className="integrity-valid"><CheckCircle size={18} /> CHAIN VALID — All {integrity.totalBlocks} blocks verified · No tampering detected</div>
                                ) : (
                                    <div className="integrity-invalid"><AlertTriangle size={18} /> CHAIN COMPROMISED — {integrity.issues?.length} issue(s) found!</div>
                                )}
                            </div>
                        )}
                    </div>
                    <button className="btn btn-outline" style={{ borderColor: '#60A5FA', color: '#60A5FA' }} onClick={handleIntegrityCheck} disabled={checking}>
                        {checking ? '⏳ Verifying…' : '🔍 Run Integrity Check'}
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="loading-container"><div className="spinner" /></div>
            ) : (
                <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {blocks.map(block => (
                            <div key={block._id} className="block-card">
                                <div className="block-header">
                                    <div>
                                        <div className="block-index">BLOCK #{block.blockIndex}</div>
                                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace', marginTop: 2 }}>{new Date(block.timestamp).toLocaleString('en-IN')}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>Nonce: {block.nonce}</div>
                                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{block.transactions?.length || 0} tx(s)</div>
                                    </div>
                                </div>
                                <div className="block-body">
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                                        <div>
                                            <div className="block-field-label">Block Hash</div>
                                            <div className="block-field-value" style={{ color: '#16A34A' }}>{block.hash}</div>
                                        </div>
                                        <div>
                                            <div className="block-field-label">Previous Hash</div>
                                            <div className="block-field-value" style={{ color: 'var(--gray-500)' }}>{block.previousHash?.slice(0, 40)}…</div>
                                        </div>
                                        <div>
                                            <div className="block-field-label">Merkle Root</div>
                                            <div className="block-field-value">{block.merkleRoot?.slice(0, 40)}…</div>
                                        </div>
                                        <div>
                                            <div className="block-field-label">Validator</div>
                                            <div className="block-field-value">{block.validator}</div>
                                        </div>
                                    </div>
                                    {block.transactions?.length > 0 && (
                                        <div>
                                            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--gray-400)', letterSpacing: '0.06em', marginBottom: 8 }}>Transactions</div>
                                            {block.transactions.map((tx, i) => (
                                                <div key={i} className="block-tx">
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span style={{ fontWeight: 700, color: txTypeColor[tx.type] || 'var(--gray-600)', fontSize: 11 }}>{tx.type?.replace(/_/g, ' ')}</span>
                                                        <span style={{ fontSize: 10, color: 'var(--gray-400)', fontFamily: 'monospace' }}>{tx.txId?.slice(0, 14)}…</span>
                                                    </div>
                                                    {tx.documentHash && <div style={{ fontSize: 10, color: 'var(--gray-500)', fontFamily: 'monospace', marginTop: 3 }}>Hash: {tx.documentHash?.slice(0, 36)}…</div>}
                                                    {tx.data?.action && <div style={{ fontSize: 10, color: 'var(--gray-400)', marginTop: 2 }}>Action: {tx.data.action}</div>}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    {totalPages > 1 && (
                        <div className="pagination" style={{ marginTop: 20 }}>
                            <button className="page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft size={14} /></button>
                            {[...Array(Math.min(5, totalPages))].map((_, i) => {
                                const pg = page <= 3 ? i + 1 : page + i - 2;
                                if (pg < 1 || pg > totalPages) return null;
                                return <button key={pg} className={`page-btn${pg === page ? ' active' : ''}`} onClick={() => setPage(pg)}>{pg}</button>;
                            })}
                            <button className="page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}><ChevronRight size={14} /></button>
                        </div>
                    )}
                </>
            )}
        </Layout>
    );
}
