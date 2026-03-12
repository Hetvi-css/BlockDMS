import React, { useEffect, useState } from 'react';
import { getBlockchainRecords, getBlockchainStats } from '../services/api';
import { Link2 } from 'lucide-react';
import { format } from 'date-fns';

const ACTION_COLORS = {
  UPLOAD: '#1E3A8A', APPROVE: '#16A34A', REJECT: '#DC2626', ESCALATE: '#F59E0B', VERIFY: '#0ea5e9'
};

export default function BlockchainExplorer() {
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    Promise.all([
      getBlockchainRecords({ limit: 100 }).then(r => setRecords(r.data.records || [])),
      getBlockchainStats().then(r => setStats(r.data.stats))
    ]).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="section-title">🔗 Blockchain Explorer</div>
          <div className="section-subtitle">Immutable transaction ledger — Hyperledger Fabric (Simulated)</div>
        </div>
      </div>

      {stats && (
        <div className="stat-cards" style={{ marginBottom: 24 }}>
          <div className="stat-card">
            <div className="stat-icon blue"><Link2 size={22} /></div>
            <div className="stat-info">
              <div className="stat-value">{stats.totalTransactions}</div>
              <div className="stat-label">Total Transactions</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon purple"><Link2 size={22} /></div>
            <div className="stat-info">
              <div className="stat-value">#{stats.latestBlock}</div>
              <div className="stat-label">Latest Block</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green"><Link2 size={22} /></div>
            <div className="stat-info">
              <div className="stat-value">{stats.network?.split(' ')[0]}</div>
              <div className="stat-label">Network</div>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
        ) : records.length === 0 ? (
          <div className="empty-state">
            <Link2 size={48} className="empty-state-icon" />
            <div className="empty-state-title">No blockchain records yet</div>
            <div className="empty-state-text">Records will appear here as documents are processed</div>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Block #</th><th>Transaction ID</th><th>Action</th><th>Document</th><th>Initiated By</th><th>Timestamp</th><th></th></tr>
              </thead>
              <tbody>
                {records.map(r => (
                  <React.Fragment key={r._id}>
                    <tr>
                      <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1E3A8A' }}>#{r.blockNumber}</td>
                      <td>
                        <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#6b7280', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {r.transactionId}
                        </div>
                      </td>
                      <td>
                        <span style={{
                          background: (ACTION_COLORS[r.action] || '#6b7280') + '1a',
                          color: ACTION_COLORS[r.action] || '#6b7280',
                          padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600
                        }}>{r.action}</span>
                      </td>
                      <td style={{ fontSize: 13 }}>{r.documentId?.title || '—'}</td>
                      <td style={{ fontSize: 13 }}>{r.initiatedBy?.name || '—'}</td>
                      <td style={{ fontSize: 12, color: '#6b7280' }}>{format(new Date(r.timestamp), 'dd MMM yyyy, HH:mm')}</td>
                      <td>
                        <button className="btn btn-secondary btn-sm" onClick={() => setExpanded(expanded === r._id ? null : r._id)}>
                          {expanded === r._id ? 'Hide' : 'Details'}
                        </button>
                      </td>
                    </tr>
                    {expanded === r._id && (
                      <tr>
                        <td colSpan={7} style={{ background: '#f9fafb', padding: '16px 24px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div>
                              <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>BLOCK HASH</div>
                              <div className="hash-block">{r.blockHash}</div>
                            </div>
                            <div>
                              <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>DOCUMENT HASH</div>
                              <div className="hash-block">{r.documentHash}</div>
                            </div>
                            <div>
                              <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>CHANNEL</div>
                              <div style={{ fontSize: 13, fontWeight: 500 }}>{r.channelName}</div>
                            </div>
                            <div>
                              <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>CHAINCODE</div>
                              <div style={{ fontSize: 13, fontWeight: 500 }}>{r.chaincodeName}</div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
