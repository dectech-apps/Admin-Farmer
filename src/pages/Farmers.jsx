import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import DataTable from '../components/DataTable';
import { Shield, ShieldOff, DollarSign, Search, Leaf, ChevronLeft, ChevronRight, Edit2, Trash2, X, AlertCircle } from 'lucide-react';

export default function Farmers() {
  const { user } = useAuth();

  // Check if user is admin (empty permissions array means super admin with all access)
  const isAdmin = !user?.permissions || user.permissions.length === 0;

  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  // Edit modal state
  const [editModal, setEditModal] = useState(false);
  const [editData, setEditData] = useState({ name: '', email: '', phone: '' });
  const [editingFarmer, setEditingFarmer] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState(false);
  const [deletingFarmer, setDeletingFarmer] = useState(null);
  const [deleting, setDeleting] = useState(false);

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

  // Open edit modal
  const openEditModal = (farmer) => {
    setEditingFarmer(farmer);
    setEditData({
      name: farmer.name || '',
      email: farmer.email || '',
      phone: farmer.phone || '',
    });
    setEditError('');
    setEditModal(true);
  };

  // Handle edit submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingFarmer?.farm_id) return;

    setSaving(true);
    setEditError('');
    try {
      await adminAPI.updateFarmer(editingFarmer.farm_id, editData);
      setEditModal(false);
      fetchFarmers();
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update farmer');
    } finally {
      setSaving(false);
    }
  };

  // Open delete modal
  const openDeleteModal = (farmer) => {
    setDeletingFarmer(farmer);
    setDeleteModal(true);
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deletingFarmer?.farm_id) return;

    setDeleting(true);
    try {
      await adminAPI.deleteFarmer(deletingFarmer.farm_id);
      setDeleteModal(false);
      fetchFarmers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete farmer');
    } finally {
      setDeleting(false);
    }
  };

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

                        {/* Actions */}
                        <td className="fm-td">
                          <div className="fm-actions">
                            <Link to={`/farmers/${row.id}`} className="fm-view-btn">
                              View
                            </Link>
                            {isAdmin && (
                              <>
                                <button className="fm-action-btn fm-action-edit" onClick={() => openEditModal(row)}>
                                  <Edit2 size={14} />
                                </button>
                                <button className="fm-action-btn fm-action-delete" onClick={() => openDeleteModal(row)}>
                                  <Trash2 size={14} />
                                </button>
                              </>
                            )}
                          </div>
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

        {/* Edit Modal */}
        {editModal && (
          <div className="fm-modal-overlay" onClick={() => setEditModal(false)}>
            <div className="fm-modal" onClick={e => e.stopPropagation()}>
              <div className="fm-modal-header">
                <h2 className="fm-modal-title">Edit Farmer</h2>
                <button className="fm-modal-close" onClick={() => setEditModal(false)}>
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleEditSubmit} className="fm-modal-form">
                {editError && (
                  <div className="fm-form-error">
                    <AlertCircle size={16} />
                    {editError}
                  </div>
                )}
                <div className="fm-form-group">
                  <label className="fm-form-label">Name</label>
                  <input
                    type="text"
                    className="fm-form-input"
                    value={editData.name}
                    onChange={e => setEditData({ ...editData, name: e.target.value })}
                    placeholder="Enter name"
                  />
                </div>
                <div className="fm-form-group">
                  <label className="fm-form-label">Email</label>
                  <input
                    type="email"
                    className="fm-form-input"
                    value={editData.email}
                    onChange={e => setEditData({ ...editData, email: e.target.value })}
                    placeholder="Enter email"
                  />
                </div>
                <div className="fm-form-group">
                  <label className="fm-form-label">Phone</label>
                  <input
                    type="text"
                    className="fm-form-input"
                    value={editData.phone}
                    onChange={e => setEditData({ ...editData, phone: e.target.value })}
                    placeholder="Enter phone"
                  />
                </div>
                <div className="fm-form-actions">
                  <button type="button" className="fm-btn-cancel" onClick={() => setEditModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="fm-btn-save" disabled={saving}>
                    {saving && <span className="fm-btn-spinner" />}
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteModal && (
          <div className="fm-modal-overlay" onClick={() => setDeleteModal(false)}>
            <div className="fm-confirm-modal" onClick={e => e.stopPropagation()}>
              <div className="fm-confirm-icon">
                <Trash2 size={24} color="#dc2626" />
              </div>
              <h3 className="fm-confirm-title">Delete Farmer</h3>
              <p className="fm-confirm-text">
                Are you sure you want to delete <strong>{deletingFarmer?.name}</strong>?
                This will also delete their farm and all associated data. This action cannot be undone.
              </p>
              <div className="fm-confirm-actions">
                <button className="fm-btn-cancel" onClick={() => setDeleteModal(false)}>
                  Cancel
                </button>
                <button className="fm-btn-delete" onClick={handleDelete} disabled={deleting}>
                  {deleting && <span className="fm-btn-spinner" />}
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
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

/* actions */
.fm-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.fm-action-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, transform 0.15s;
}
.fm-action-edit {
  background: #f0f9ff;
  color: #0369a1;
}
.fm-action-edit:hover {
  background: #e0f2fe;
  transform: scale(1.05);
}
.fm-action-delete {
  background: #fef2f2;
  color: #dc2626;
}
.fm-action-delete:hover {
  background: #fee2e2;
  transform: scale(1.05);
}

/* modal */
.fm-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  backdrop-filter: blur(2px);
}
.fm-modal {
  background: #fff;
  border-radius: 20px;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
}
.fm-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #f0ede6;
}
.fm-modal-title {
  font-family: 'Fraunces', serif;
  font-size: 18px;
  font-weight: 600;
  color: #1a2e1a;
  margin: 0;
}
.fm-modal-close {
  width: 36px;
  height: 36px;
  border: none;
  background: #f5f2ec;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888;
  transition: background 0.2s;
}
.fm-modal-close:hover {
  background: #ebe8e0;
}
.fm-modal-form {
  padding: 20px 24px;
}
.fm-form-error {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 10px;
  color: #dc2626;
  font-size: 13px;
  margin-bottom: 16px;
}
.fm-form-group {
  margin-bottom: 16px;
}
.fm-form-label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #555;
  margin-bottom: 6px;
}
.fm-form-input {
  width: 100%;
  padding: 10px 14px;
  background: #fff;
  border: 1.5px solid #e8e4dc;
  border-radius: 10px;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  transition: border-color 0.2s;
}
.fm-form-input:focus {
  outline: none;
  border-color: #2d5a27;
}
.fm-form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #f0ede6;
}
.fm-btn-cancel {
  padding: 10px 20px;
  background: #f5f2ec;
  border: none;
  border-radius: 10px;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: background 0.2s;
}
.fm-btn-cancel:hover {
  background: #ebe8e0;
}
.fm-btn-save {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  background: #2d5a27;
  border: none;
  border-radius: 10px;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  transition: background 0.2s;
}
.fm-btn-save:hover:not(:disabled) {
  background: #1a2e1a;
}
.fm-btn-save:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.fm-btn-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: fmspin 0.6s linear infinite;
}

/* confirm modal */
.fm-confirm-modal {
  background: #fff;
  border-radius: 20px;
  padding: 28px;
  width: 100%;
  max-width: 360px;
  text-align: center;
}
.fm-confirm-icon {
  width: 56px;
  height: 56px;
  background: #fef2f2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}
.fm-confirm-title {
  font-family: 'Fraunces', serif;
  font-size: 18px;
  font-weight: 600;
  color: #1a2e1a;
  margin: 0 0 8px;
}
.fm-confirm-text {
  font-size: 14px;
  color: #666;
  margin: 0 0 24px;
  line-height: 1.5;
}
.fm-confirm-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}
.fm-btn-delete {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  background: #dc2626;
  border: none;
  border-radius: 10px;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  transition: background 0.2s;
}
.fm-btn-delete:hover:not(:disabled) {
  background: #b91c1c;
}
.fm-btn-delete:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
`;