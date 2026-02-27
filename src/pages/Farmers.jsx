import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../services/api';
import DataTable from '../components/DataTable';
import { Shield, ShieldOff, DollarSign, Search, Leaf, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Farmers() {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => { fetchFarmers(); }, [page, search]);

  const fetchFarmers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getFarmers({ page, limit: 10, search });
      const payload = response.data || {};
      const rows = Array.isArray(payload.data)
        ? payload.data
        : Array.isArray(payload.data?.data)
          ? payload.data.data
          : Array.isArray(payload.farmers)
            ? payload.farmers
            : [];
      const pagination = payload.pagination || payload.data?.pagination || payload.meta?.pagination || {};
      setFarmers(rows);
      setTotalPages(pagination.pages || pagination.totalPages || 1);
    } catch (err) {
      console.error('Failed to fetch farmers:', err);
    } finally {
      setLoading(false);
    }
  };

  const getVerificationValue = (row) =>
    row?.farm_verified ?? row?.is_verified ?? row?.verified ?? false;

  const getVerificationTarget = (row) => {
    if (row?.farm_id) return { id: row.farm_id, type: 'farm' };
    if (row?.id) return { id: row.id, type: 'user' };
    return { id: null, type: null };
  };

  const handleVerification = async (row) => {
    const target = getVerificationTarget(row);
    if (!target.id) return;
    const nextVerified = !getVerificationValue(row);
    setUpdatingId(target.id);
    try {
      if (target.type === 'farm') {
        await adminAPI.updateFarmVerification(target.id, nextVerified);
      } else {
        await adminAPI.updateUserStatus(target.id, nextVerified ? 'verified' : 'unverified');
      }
      setFarmers(prev =>
        prev.map(farmer => {
          const ft = getVerificationTarget(farmer);
          if (ft.id !== target.id || ft.type !== target.type) return farmer;
          return { ...farmer, farm_verified: nextVerified, is_verified: nextVerified };
        })
      );
    } catch (err) {
      console.error('Failed to update verification:', err);
      fetchFarmers();
    } finally {
      setUpdatingId(null);
    }
  };

  const initials = (name) => name?.charAt(0)?.toUpperCase() || 'F';

  return (
    <>
      <style>{styles}</style>

      <div className="fm-root">

        {/* Page header */}
        <div className="fm-header">
          <div className="fm-header-icon">
            <Leaf size={22} color="#a3d977" />
          </div>
          <div>
            <h1 className="fm-title">Farmers</h1>
            <p className="fm-sub">Manage farmer accounts and farm verification</p>
          </div>
        </div>

        {/* Table card */}
        <div className="fm-card">

          {/* Search */}
          <div className="fm-toolbar">
            <div className="fm-search-wrap">
              <Search size={15} className="fm-search-icon" />
              <input
                className="fm-search"
                placeholder="Search farmers by name or email…"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <span className="fm-count">
              {farmers.length} result{farmers.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Table */}
          <div className="fm-table-wrap">
            {loading ? (
              <div className="fm-loading">
                <div className="fm-spinner" />
                <p>Loading farmers…</p>
              </div>
            ) : farmers.length === 0 ? (
              <div className="fm-empty">
                <Leaf size={32} color="#c4bfb5" />
                <p>No farmers found</p>
              </div>
            ) : (
              <table className="fm-table">
                <thead>
                  <tr>
                    {['Farmer', 'Phone', 'Farm', 'Earnings', 'Status', 'Joined', ''].map(h => (
                      <th key={h} className="fm-th">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {farmers.map((row, i) => {
                    const target = getVerificationTarget(row);
                    const isVerified = getVerificationValue(row);
                    const isUpdating = updatingId === target.id;

                    return (
                      <tr key={row.id || i} className="fm-tr">

                        {/* Farmer */}
                        <td className="fm-td">
                          <div className="fm-farmer-cell">
                            <div className="fm-avatar">
                              {initials(row.name)}
                            </div>
                            <div>
                              <p className="fm-farmer-name">{row.name || '—'}</p>
                              <p className="fm-farmer-email">{row.email || '—'}</p>
                            </div>
                          </div>
                        </td>

                        {/* Phone */}
                        <td className="fm-td">
                          <span className="fm-cell-text">{row.phone || '—'}</span>
                        </td>

                        {/* Farm */}
                        <td className="fm-td">
                          <p className="fm-cell-bold">{row.farm_name || 'No farm'}</p>
                          {row.farm_status && (
                            <p className="fm-cell-muted" style={{ textTransform: 'capitalize' }}>
                              {row.farm_status}
                            </p>
                          )}
                        </td>

                        {/* Earnings */}
                        <td className="fm-td">
                          <div className="fm-earnings">
                            <DollarSign size={13} color="#2d5a27" />
                            <span>{parseFloat(row.wallet?.total_earned || 0).toLocaleString()}</span>
                          </div>
                        </td>

                        {/* Verification toggle */}
                        <td className="fm-td">
                          <button
                            onClick={() => handleVerification(row)}
                            disabled={!target.id || isUpdating}
                            className={`fm-badge ${isVerified ? 'fm-badge-verified' : 'fm-badge-unverified'} ${(!target.id || isUpdating) ? 'fm-badge-disabled' : ''}`}
                          >
                            {isUpdating ? (
                              <span className="fm-badge-spinner" />
                            ) : isVerified ? (
                              <Shield size={12} />
                            ) : (
                              <ShieldOff size={12} />
                            )}
                            {isVerified ? 'Verified' : 'Unverified'}
                          </button>
                        </td>

                        {/* Joined */}
                        <td className="fm-td">
                          <span className="fm-cell-text">
                            {row.created_at
                              ? new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                              : '—'}
                          </span>
                        </td>

                        {/* Action */}
                        <td className="fm-td">
                          <Link to={`/farmers/${row.id}`} className="fm-view-btn">
                            View →
                          </Link>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="fm-pagination">
              <button
                className="fm-page-btn"
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                <ChevronLeft size={15} /> Prev
              </button>

              <div className="fm-page-pills">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                  .reduce((acc, n, idx, arr) => {
                    if (idx > 0 && n - arr[idx - 1] > 1) acc.push('…');
                    acc.push(n);
                    return acc;
                  }, [])
                  .map((item, idx) =>
                    item === '…'
                      ? <span key={`ellipsis-${idx}`} className="fm-page-ellipsis">…</span>
                      : <button
                          key={item}
                          className={`fm-page-num ${item === page ? 'fm-page-active' : ''}`}
                          onClick={() => setPage(item)}
                        >{item}</button>
                  )}
              </div>

              <button
                className="fm-page-btn"
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              >
                Next <ChevronRight size={15} />
              </button>
            </div>
          )}

        </div>
      </div>
    </>
  );
}

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,600&family=DM+Sans:wght@300;400;500&display=swap');

.fm-root {
  font-family: 'DM Sans', sans-serif;
  padding: 32px 28px;
  max-width: 1280px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-height: 100vh;
  background: #f5f2ec;
}

/* header */
.fm-header {
  display: flex;
  align-items: center;
  gap: 16px;
}
.fm-header-icon {
  width: 48px; height: 48px;
  background: #1a2e1a;
  border-radius: 15px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 6px 18px rgba(26,46,26,0.25);
}
.fm-title {
  font-family: 'Fraunces', serif;
  font-size: 26px; font-weight: 600;
  color: #1a2e1a; margin: 0 0 3px;
}
.fm-sub { font-size: 13.5px; color: #999; margin: 0; }

/* card */
.fm-card {
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 4px 20px rgba(0,0,0,0.06);
  overflow: hidden;
}

/* toolbar */
.fm-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 24px;
  border-bottom: 1px solid #f0ede6;
  flex-wrap: wrap;
}
.fm-search-wrap {
  position: relative;
  flex: 1;
  max-width: 340px;
}
.fm-search-icon {
  position: absolute;
  left: 12px; top: 50%;
  transform: translateY(-50%);
  color: #bbb;
  pointer-events: none;
}
.fm-search {
  width: 100%;
  padding: 9px 14px 9px 36px;
  font-family: 'DM Sans', sans-serif;
  font-size: 13.5px;
  background: #f9f8f6;
  border: 1.5px solid #e8e4dc;
  border-radius: 10px;
  outline: none;
  color: #222;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.fm-search::placeholder { color: #c4bfb5; }
.fm-search:focus {
  border-color: #2d5a27;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(45,90,39,0.08);
}
.fm-count { font-size: 12.5px; color: #bbb; white-space: nowrap; }

/* table */
.fm-table-wrap { overflow-x: auto; }
.fm-table { width: 100%; border-collapse: collapse; }

.fm-th {
  padding: 11px 20px;
  text-align: left;
  font-size: 11.5px;
  font-weight: 500;
  color: #aaa;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  background: #faf9f6;
  border-bottom: 1px solid #f0ede6;
  white-space: nowrap;
}

.fm-tr {
  border-bottom: 1px solid #f7f5f1;
  transition: background 0.15s;
}
.fm-tr:last-child { border-bottom: none; }
.fm-tr:hover { background: #faf9f6; }

.fm-td {
  padding: 14px 20px;
  vertical-align: middle;
}

/* farmer cell */
.fm-farmer-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}
.fm-avatar {
  width: 38px; height: 38px;
  border-radius: 12px;
  background: #e8f5e0;
  color: #2d5a27;
  font-weight: 600;
  font-size: 15px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.fm-farmer-name { font-size: 14px; font-weight: 500; color: #1a1a1a; margin: 0 0 2px; }
.fm-farmer-email { font-size: 12px; color: #aaa; margin: 0; }

.fm-cell-text { font-size: 13.5px; color: #555; }
.fm-cell-bold { font-size: 13.5px; font-weight: 500; color: #222; margin: 0 0 2px; }
.fm-cell-muted { font-size: 12px; color: #aaa; margin: 0; }

/* earnings */
.fm-earnings {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13.5px;
  font-weight: 600;
  color: #2d5a27;
  background: #f0faf0;
  padding: 4px 10px;
  border-radius: 8px;
}

/* badge */
.fm-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border-radius: 99px;
  font-size: 12.5px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.15s;
  white-space: nowrap;
}
.fm-badge:hover:not(.fm-badge-disabled) { opacity: 0.82; transform: scale(0.97); }
.fm-badge-verified   { background: #e8f5e0; color: #2d5a27; }
.fm-badge-unverified { background: #f5f2ec; color: #999; }
.fm-badge-disabled   { opacity: 0.45; cursor: not-allowed; }

.fm-badge-spinner {
  width: 12px; height: 12px;
  border: 1.5px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: fmspin 0.6s linear infinite;
  opacity: 0.6;
}
@keyframes fmspin { to { transform: rotate(360deg); } }

/* view button */
.fm-view-btn {
  font-size: 13px;
  font-weight: 500;
  color: #2d5a27;
  text-decoration: none;
  padding: 6px 14px;
  border: 1.5px solid #d0e8cc;
  border-radius: 9px;
  background: #fff;
  transition: background 0.15s, border-color 0.15s;
  white-space: nowrap;
  display: inline-block;
}
.fm-view-btn:hover {
  background: #f0faf0;
  border-color: #2d5a27;
}

/* loading / empty */
.fm-loading, .fm-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 64px 24px;
  color: #bbb;
  font-size: 14px;
}
.fm-spinner {
  width: 36px; height: 36px;
  border: 2.5px solid #e8e4dc;
  border-top-color: #2d5a27;
  border-radius: 50%;
  animation: fmspin 0.7s linear infinite;
}

/* pagination */
.fm-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 18px 24px;
  border-top: 1px solid #f0ede6;
  flex-wrap: wrap;
}
.fm-page-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 7px 14px;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: #555;
  background: #f9f8f6;
  border: 1.5px solid #e8e4dc;
  border-radius: 9px;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}
.fm-page-btn:hover:not(:disabled) { background: #f0ede6; border-color: #d4cfc5; }
.fm-page-btn:disabled { opacity: 0.35; cursor: not-allowed; }

.fm-page-pills { display: flex; align-items: center; gap: 4px; }
.fm-page-num {
  width: 34px; height: 34px;
  display: flex; align-items: center; justify-content: center;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px; font-weight: 500;
  color: #666;
  background: transparent;
  border: 1.5px solid transparent;
  border-radius: 9px;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}
.fm-page-num:hover { background: #f5f2ec; }
.fm-page-active {
  background: #1a2e1a !important;
  color: #fff !important;
  border-color: #1a2e1a !important;
}
.fm-page-ellipsis { font-size: 13px; color: #bbb; padding: 0 4px; }
`;