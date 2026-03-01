import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Shield, ShieldOff, DollarSign, Search, ShoppingBag, ChevronLeft, ChevronRight, Star, MapPin, Edit2, Trash2, X, AlertCircle } from 'lucide-react';

export default function Boutiques() {
  const { user } = useAuth();

  // Check if user is admin (empty permissions array means super admin with all access)
  const isAdmin = !user?.permissions || user.permissions.length === 0;

  const [boutiques, setBoutiques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  // Edit modal state
  const [editModal, setEditModal] = useState(false);
  const [editData, setEditData] = useState({ name: '', email: '', phone: '' });
  const [editingBoutique, setEditingBoutique] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState(false);
  const [deletingBoutique, setDeletingBoutique] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { fetchBoutiques(); }, [page, search]);

  const fetchBoutiques = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getBoutiques({ page, limit: 10, search });
      const payload = response.data || {};
      const rows = Array.isArray(payload.data) ? payload.data : [];
      const pagination = payload.pagination || {};
      setBoutiques(rows);
      setTotalPages(pagination.pages || 1);
    } catch (err) {
      console.error('Failed to fetch boutiques:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (row) => {
    if (!row.id) return;
    const nextVerified = !row.is_verified;
    setUpdatingId(row.id);
    try {
      await adminAPI.updateBoutiqueVerification(row.id, nextVerified);
      setBoutiques(prev =>
        prev.map(b => b.id === row.id ? { ...b, is_verified: nextVerified } : b)
      );
    } catch (err) {
      console.error('Failed to update verification:', err);
      fetchBoutiques();
    } finally {
      setUpdatingId(null);
    }
  };

  const initials = (name) => name?.charAt(0)?.toUpperCase() || 'B';

  // Open edit modal
  const openEditModal = (boutique) => {
    setEditingBoutique(boutique);
    setEditData({
      name: boutique.owner_name || '',
      email: boutique.owner_email || '',
      phone: boutique.owner_phone || '',
    });
    setEditError('');
    setEditModal(true);
  };

  // Handle edit submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingBoutique?.id) return;

    setSaving(true);
    setEditError('');
    try {
      await adminAPI.updateBoutique(editingBoutique.id, editData);
      setEditModal(false);
      fetchBoutiques();
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update boutique');
    } finally {
      setSaving(false);
    }
  };

  // Open delete modal
  const openDeleteModal = (boutique) => {
    setDeletingBoutique(boutique);
    setDeleteModal(true);
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deletingBoutique?.id) return;

    setDeleting(true);
    try {
      await adminAPI.deleteBoutique(deletingBoutique.id);
      setDeleteModal(false);
      fetchBoutiques();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete boutique');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <style>{styles}</style>

      <div className="bt-root">

        {/* Page header */}
        <div className="bt-header">
          <div className="bt-header-icon">
            <ShoppingBag size={22} color="#8b5cf6" />
          </div>
          <div>
            <h1 className="bt-title">Boutiques</h1>
            <p className="bt-sub">Manage boutique accounts and verification</p>
          </div>
        </div>

        {/* Table card */}
        <div className="bt-card">

          {/* Search */}
          <div className="bt-toolbar">
            <div className="bt-search-wrap">
              <Search size={15} className="bt-search-icon" />
              <input
                className="bt-search"
                placeholder="Search boutiques by name or owner..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <span className="bt-count">
              {boutiques.length} result{boutiques.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Table */}
          <div className="bt-table-wrap">
            {loading ? (
              <div className="bt-loading">
                <div className="bt-spinner" />
                <p>Loading boutiques...</p>
              </div>
            ) : boutiques.length === 0 ? (
              <div className="bt-empty">
                <ShoppingBag size={32} color="#c4bfb5" />
                <p>No boutiques found</p>
              </div>
            ) : (
              <table className="bt-table">
                <thead>
                  <tr>
                    {['Boutique', 'Owner', 'Location', 'Rating', 'Earnings', 'Status', 'Joined', ''].map(h => (
                      <th key={h} className="bt-th">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {boutiques.map((row, i) => {
                    const isUpdating = updatingId === row.id;

                    return (
                      <tr key={row.id || i} className="bt-tr">

                        {/* Boutique */}
                        <td className="bt-td">
                          <div className="bt-boutique-cell">
                            <div className="bt-avatar" style={{ background: row.image_url ? `url(${row.image_url}) center/cover` : '#f3e8ff' }}>
                              {!row.image_url && initials(row.name)}
                            </div>
                            <div>
                              <p className="bt-boutique-name">{row.name || '—'}</p>
                              <p className="bt-boutique-category">
                                {row.fashion_categories?.slice(0, 2).join(', ') || 'No category set'}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Owner */}
                        <td className="bt-td">
                          <p className="bt-cell-bold">{row.owner_name || '—'}</p>
                          <p className="bt-cell-muted">{row.owner_email || '—'}</p>
                        </td>

                        {/* Location */}
                        <td className="bt-td">
                          <div className="bt-location">
                            <MapPin size={13} color="#888" />
                            <span>{row.city || 'No location'}</span>
                          </div>
                        </td>

                        {/* Rating */}
                        <td className="bt-td">
                          <div className="bt-rating">
                            <Star size={14} color="#8b5cf6" fill="#8b5cf6" />
                            <span>{parseFloat(row.rating || 0).toFixed(1)}</span>
                            <span className="bt-review-count">({row.review_count || 0})</span>
                          </div>
                        </td>

                        {/* Earnings */}
                        <td className="bt-td">
                          <div className="bt-earnings">
                            <DollarSign size={13} color="#8b5cf6" />
                            <span>{parseFloat(row.wallet?.total_earned || 0).toLocaleString()}</span>
                          </div>
                        </td>

                        {/* Verification toggle */}
                        <td className="bt-td">
                          <button
                            onClick={() => handleVerification(row)}
                            disabled={!row.id || isUpdating}
                            className={`bt-badge ${row.is_verified ? 'bt-badge-verified' : 'bt-badge-unverified'} ${(!row.id || isUpdating) ? 'bt-badge-disabled' : ''}`}
                          >
                            {isUpdating ? (
                              <span className="bt-badge-spinner" />
                            ) : row.is_verified ? (
                              <Shield size={12} />
                            ) : (
                              <ShieldOff size={12} />
                            )}
                            {row.is_verified ? 'Verified' : 'Unverified'}
                          </button>
                        </td>

                        {/* Joined */}
                        <td className="bt-td">
                          <span className="bt-cell-text">
                            {row.created_at
                              ? new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                              : '—'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="bt-td">
                          <div className="bt-actions">
                            <Link to={`/boutiques/${row.id}`} className="bt-view-btn">
                              View
                            </Link>
                            {isAdmin && (
                              <>
                                <button className="bt-action-btn bt-action-edit" onClick={() => openEditModal(row)}>
                                  <Edit2 size={14} />
                                </button>
                                <button className="bt-action-btn bt-action-delete" onClick={() => openDeleteModal(row)}>
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
            <div className="bt-pagination">
              <button
                className="bt-page-btn"
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                <ChevronLeft size={15} /> Prev
              </button>

              <div className="bt-page-pills">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                  .reduce((acc, n, idx, arr) => {
                    if (idx > 0 && n - arr[idx - 1] > 1) acc.push('...');
                    acc.push(n);
                    return acc;
                  }, [])
                  .map((item, idx) =>
                    item === '...'
                      ? <span key={`ellipsis-${idx}`} className="bt-page-ellipsis">...</span>
                      : <button
                          key={item}
                          className={`bt-page-num ${item === page ? 'bt-page-active' : ''}`}
                          onClick={() => setPage(item)}
                        >{item}</button>
                  )}
              </div>

              <button
                className="bt-page-btn"
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
          <div className="bt-modal-overlay" onClick={() => setEditModal(false)}>
            <div className="bt-modal" onClick={e => e.stopPropagation()}>
              <div className="bt-modal-header">
                <h2 className="bt-modal-title">Edit Boutique Owner</h2>
                <button className="bt-modal-close" onClick={() => setEditModal(false)}>
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleEditSubmit} className="bt-modal-form">
                {editError && (
                  <div className="bt-form-error">
                    <AlertCircle size={16} />
                    {editError}
                  </div>
                )}
                <div className="bt-form-group">
                  <label className="bt-form-label">Owner Name</label>
                  <input
                    type="text"
                    className="bt-form-input"
                    value={editData.name}
                    onChange={e => setEditData({ ...editData, name: e.target.value })}
                    placeholder="Enter name"
                  />
                </div>
                <div className="bt-form-group">
                  <label className="bt-form-label">Email</label>
                  <input
                    type="email"
                    className="bt-form-input"
                    value={editData.email}
                    onChange={e => setEditData({ ...editData, email: e.target.value })}
                    placeholder="Enter email"
                  />
                </div>
                <div className="bt-form-group">
                  <label className="bt-form-label">Phone</label>
                  <input
                    type="text"
                    className="bt-form-input"
                    value={editData.phone}
                    onChange={e => setEditData({ ...editData, phone: e.target.value })}
                    placeholder="Enter phone"
                  />
                </div>
                <div className="bt-form-actions">
                  <button type="button" className="bt-btn-cancel" onClick={() => setEditModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="bt-btn-save" disabled={saving}>
                    {saving && <span className="bt-btn-spinner" />}
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteModal && (
          <div className="bt-modal-overlay" onClick={() => setDeleteModal(false)}>
            <div className="bt-confirm-modal" onClick={e => e.stopPropagation()}>
              <div className="bt-confirm-icon">
                <Trash2 size={24} color="#dc2626" />
              </div>
              <h3 className="bt-confirm-title">Delete Boutique</h3>
              <p className="bt-confirm-text">
                Are you sure you want to delete <strong>{deletingBoutique?.name}</strong>?
                This will also delete the owner account and all associated data. This action cannot be undone.
              </p>
              <div className="bt-confirm-actions">
                <button className="bt-btn-cancel" onClick={() => setDeleteModal(false)}>
                  Cancel
                </button>
                <button className="bt-btn-delete" onClick={handleDelete} disabled={deleting}>
                  {deleting && <span className="bt-btn-spinner" />}
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

.bt-root {
  font-family: 'DM Sans', sans-serif;
  padding: 32px 28px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-height: 100vh;
  background: #f5f2ec;
}

/* header */
.bt-header {
  display: flex;
  align-items: center;
  gap: 16px;
}
.bt-header-icon {
  width: 48px; height: 48px;
  background: #1a2e1a;
  border-radius: 15px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 6px 18px rgba(26,46,26,0.25);
}
.bt-title {
  font-family: 'Fraunces', serif;
  font-size: 26px; font-weight: 600;
  color: #1a2e1a; margin: 0 0 3px;
}
.bt-sub { font-size: 13.5px; color: #999; margin: 0; }

/* card */
.bt-card {
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 4px 20px rgba(0,0,0,0.06);
  overflow: hidden;
}

/* toolbar */
.bt-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 24px;
  border-bottom: 1px solid #f0ede6;
  flex-wrap: wrap;
}
.bt-search-wrap {
  position: relative;
  flex: 1;
  max-width: 340px;
}
.bt-search-icon {
  position: absolute;
  left: 12px; top: 50%;
  transform: translateY(-50%);
  color: #bbb;
  pointer-events: none;
}
.bt-search {
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
.bt-search::placeholder { color: #c4bfb5; }
.bt-search:focus {
  border-color: #8b5cf6;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(139,92,246,0.08);
}
.bt-count { font-size: 12.5px; color: #bbb; white-space: nowrap; }

/* table */
.bt-table-wrap { overflow-x: auto; }
.bt-table { width: 100%; border-collapse: collapse; }

.bt-th {
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

.bt-tr {
  border-bottom: 1px solid #f7f5f1;
  transition: background 0.15s;
}
.bt-tr:last-child { border-bottom: none; }
.bt-tr:hover { background: #faf9f6; }

.bt-td {
  padding: 14px 20px;
  vertical-align: middle;
}

/* boutique cell */
.bt-boutique-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}
.bt-avatar {
  width: 42px; height: 42px;
  border-radius: 12px;
  background: #f3e8ff;
  color: #8b5cf6;
  font-weight: 600;
  font-size: 15px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.bt-boutique-name { font-size: 14px; font-weight: 500; color: #1a1a1a; margin: 0 0 2px; }
.bt-boutique-category { font-size: 12px; color: #aaa; margin: 0; }

.bt-cell-text { font-size: 13.5px; color: #555; }
.bt-cell-bold { font-size: 13.5px; font-weight: 500; color: #222; margin: 0 0 2px; }
.bt-cell-muted { font-size: 12px; color: #aaa; margin: 0; }

/* location */
.bt-location {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #666;
}

/* rating */
.bt-rating {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13.5px;
  font-weight: 600;
  color: #8b5cf6;
}
.bt-review-count {
  font-weight: 400;
  color: #aaa;
  font-size: 12px;
}

/* earnings */
.bt-earnings {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13.5px;
  font-weight: 600;
  color: #8b5cf6;
  background: #f3e8ff;
  padding: 4px 10px;
  border-radius: 8px;
}

/* badge */
.bt-badge {
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
.bt-badge:hover:not(.bt-badge-disabled) { opacity: 0.82; transform: scale(0.97); }
.bt-badge-verified   { background: #f3e8ff; color: #8b5cf6; }
.bt-badge-unverified { background: #f5f2ec; color: #999; }
.bt-badge-disabled   { opacity: 0.45; cursor: not-allowed; }

.bt-badge-spinner {
  width: 12px; height: 12px;
  border: 1.5px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: btspin 0.6s linear infinite;
  opacity: 0.6;
}
@keyframes btspin { to { transform: rotate(360deg); } }

/* view button */
.bt-view-btn {
  font-size: 13px;
  font-weight: 500;
  color: #8b5cf6;
  text-decoration: none;
  padding: 6px 14px;
  border: 1.5px solid #ddd6fe;
  border-radius: 9px;
  background: #fff;
  transition: background 0.15s, border-color 0.15s;
  white-space: nowrap;
  display: inline-block;
}
.bt-view-btn:hover {
  background: #f3e8ff;
  border-color: #8b5cf6;
}

/* loading / empty */
.bt-loading, .bt-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 64px 24px;
  color: #bbb;
  font-size: 14px;
}
.bt-spinner {
  width: 36px; height: 36px;
  border: 2.5px solid #e8e4dc;
  border-top-color: #8b5cf6;
  border-radius: 50%;
  animation: btspin 0.7s linear infinite;
}

/* pagination */
.bt-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 18px 24px;
  border-top: 1px solid #f0ede6;
  flex-wrap: wrap;
}
.bt-page-btn {
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
.bt-page-btn:hover:not(:disabled) { background: #f0ede6; border-color: #d4cfc5; }
.bt-page-btn:disabled { opacity: 0.35; cursor: not-allowed; }

.bt-page-pills { display: flex; align-items: center; gap: 4px; }
.bt-page-num {
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
.bt-page-num:hover { background: #f5f2ec; }
.bt-page-active {
  background: #8b5cf6 !important;
  color: #fff !important;
  border-color: #8b5cf6 !important;
}
.bt-page-ellipsis { font-size: 13px; color: #bbb; padding: 0 4px; }

/* actions */
.bt-actions { display: flex; align-items: center; gap: 8px; }
.bt-action-btn {
  width: 32px; height: 32px;
  border: none; border-radius: 8px;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.2s, transform 0.15s;
}
.bt-action-edit { background: #f0f9ff; color: #0369a1; }
.bt-action-edit:hover { background: #e0f2fe; transform: scale(1.05); }
.bt-action-delete { background: #fef2f2; color: #dc2626; }
.bt-action-delete:hover { background: #fee2e2; transform: scale(1.05); }

/* modal */
.bt-modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: 20px;
  backdrop-filter: blur(2px);
}
.bt-modal {
  background: #fff; border-radius: 20px;
  width: 100%; max-width: 440px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
}
.bt-modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px; border-bottom: 1px solid #f0ede6;
}
.bt-modal-title {
  font-family: 'Fraunces', serif;
  font-size: 18px; font-weight: 600; color: #1a2e1a; margin: 0;
}
.bt-modal-close {
  width: 36px; height: 36px; border: none;
  background: #f5f2ec; border-radius: 10px;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  color: #888; transition: background 0.2s;
}
.bt-modal-close:hover { background: #ebe8e0; }
.bt-modal-form { padding: 20px 24px; }
.bt-form-error {
  display: flex; align-items: center; gap: 10px;
  padding: 12px 16px; background: #fef2f2;
  border: 1px solid #fecaca; border-radius: 10px;
  color: #dc2626; font-size: 13px; margin-bottom: 16px;
}
.bt-form-group { margin-bottom: 16px; }
.bt-form-label { display: block; font-size: 13px; font-weight: 500; color: #555; margin-bottom: 6px; }
.bt-form-input {
  width: 100%; padding: 10px 14px;
  background: #fff; border: 1.5px solid #e8e4dc;
  border-radius: 10px; font-family: 'DM Sans', sans-serif;
  font-size: 14px; transition: border-color 0.2s;
}
.bt-form-input:focus { outline: none; border-color: #8b5cf6; }
.bt-form-actions {
  display: flex; justify-content: flex-end; gap: 12px;
  margin-top: 20px; padding-top: 16px; border-top: 1px solid #f0ede6;
}
.bt-btn-cancel {
  padding: 10px 20px; background: #f5f2ec; border: none;
  border-radius: 10px; font-family: 'DM Sans', sans-serif;
  font-size: 14px; font-weight: 500; color: #666;
  cursor: pointer; transition: background 0.2s;
}
.bt-btn-cancel:hover { background: #ebe8e0; }
.bt-btn-save {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 24px; background: #8b5cf6; border: none;
  border-radius: 10px; font-family: 'DM Sans', sans-serif;
  font-size: 14px; font-weight: 600; color: #fff;
  cursor: pointer; transition: background 0.2s;
}
.bt-btn-save:hover:not(:disabled) { background: #7c3aed; }
.bt-btn-save:disabled { opacity: 0.7; cursor: not-allowed; }
.bt-btn-spinner {
  width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff; border-radius: 50%;
  animation: btspin 0.6s linear infinite;
}

/* confirm modal */
.bt-confirm-modal {
  background: #fff; border-radius: 20px;
  padding: 28px; width: 100%; max-width: 360px;
  text-align: center;
}
.bt-confirm-icon {
  width: 56px; height: 56px; background: #fef2f2;
  border-radius: 50%; display: flex; align-items: center;
  justify-content: center; margin: 0 auto 16px;
}
.bt-confirm-title {
  font-family: 'Fraunces', serif;
  font-size: 18px; font-weight: 600; color: #1a2e1a; margin: 0 0 8px;
}
.bt-confirm-text { font-size: 14px; color: #666; margin: 0 0 24px; line-height: 1.5; }
.bt-confirm-actions { display: flex; gap: 12px; justify-content: center; }
.bt-btn-delete {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 24px; background: #dc2626; border: none;
  border-radius: 10px; font-family: 'DM Sans', sans-serif;
  font-size: 14px; font-weight: 600; color: #fff;
  cursor: pointer; transition: background 0.2s;
}
.bt-btn-delete:hover:not(:disabled) { background: #b91c1c; }
.bt-btn-delete:disabled { opacity: 0.7; cursor: not-allowed; }
`;
