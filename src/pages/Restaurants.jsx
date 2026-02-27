import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../services/api';
import { Shield, ShieldOff, DollarSign, Search, UtensilsCrossed, ChevronLeft, ChevronRight, Star, MapPin, Edit2, Trash2, X, AlertCircle } from 'lucide-react';

export default function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  // Edit modal state
  const [editModal, setEditModal] = useState(false);
  const [editData, setEditData] = useState({ name: '', email: '', phone: '' });
  const [editingRestaurant, setEditingRestaurant] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState(false);
  const [deletingRestaurant, setDeletingRestaurant] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { fetchRestaurants(); }, [page, search]);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getRestaurants({ page, limit: 10, search });
      const payload = response.data || {};
      const rows = Array.isArray(payload.data) ? payload.data : [];
      const pagination = payload.pagination || {};
      setRestaurants(rows);
      setTotalPages(pagination.pages || 1);
    } catch (err) {
      console.error('Failed to fetch restaurants:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (row) => {
    if (!row.id) return;
    const nextVerified = !row.is_verified;
    setUpdatingId(row.id);
    try {
      await adminAPI.updateRestaurantVerification(row.id, nextVerified);
      setRestaurants(prev =>
        prev.map(r => r.id === row.id ? { ...r, is_verified: nextVerified } : r)
      );
    } catch (err) {
      console.error('Failed to update verification:', err);
      fetchRestaurants();
    } finally {
      setUpdatingId(null);
    }
  };

  const initials = (name) => name?.charAt(0)?.toUpperCase() || 'R';

  // Open edit modal
  const openEditModal = (restaurant) => {
    setEditingRestaurant(restaurant);
    setEditData({
      name: restaurant.owner_name || '',
      email: restaurant.owner_email || '',
      phone: restaurant.owner_phone || '',
    });
    setEditError('');
    setEditModal(true);
  };

  // Handle edit submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingRestaurant?.id) return;

    setSaving(true);
    setEditError('');
    try {
      await adminAPI.updateRestaurant(editingRestaurant.id, editData);
      setEditModal(false);
      fetchRestaurants();
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update restaurant');
    } finally {
      setSaving(false);
    }
  };

  // Open delete modal
  const openDeleteModal = (restaurant) => {
    setDeletingRestaurant(restaurant);
    setDeleteModal(true);
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deletingRestaurant?.id) return;

    setDeleting(true);
    try {
      await adminAPI.deleteRestaurant(deletingRestaurant.id);
      setDeleteModal(false);
      fetchRestaurants();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete restaurant');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <style>{styles}</style>

      <div className="rs-root">

        {/* Page header */}
        <div className="rs-header">
          <div className="rs-header-icon">
            <UtensilsCrossed size={22} color="#f59e0b" />
          </div>
          <div>
            <h1 className="rs-title">Restaurants</h1>
            <p className="rs-sub">Manage restaurant accounts and verification</p>
          </div>
        </div>

        {/* Table card */}
        <div className="rs-card">

          {/* Search */}
          <div className="rs-toolbar">
            <div className="rs-search-wrap">
              <Search size={15} className="rs-search-icon" />
              <input
                className="rs-search"
                placeholder="Search restaurants by name or owner..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <span className="rs-count">
              {restaurants.length} result{restaurants.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Table */}
          <div className="rs-table-wrap">
            {loading ? (
              <div className="rs-loading">
                <div className="rs-spinner" />
                <p>Loading restaurants...</p>
              </div>
            ) : restaurants.length === 0 ? (
              <div className="rs-empty">
                <UtensilsCrossed size={32} color="#c4bfb5" />
                <p>No restaurants found</p>
              </div>
            ) : (
              <table className="rs-table">
                <thead>
                  <tr>
                    {['Restaurant', 'Owner', 'Location', 'Rating', 'Earnings', 'Status', 'Joined', ''].map(h => (
                      <th key={h} className="rs-th">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {restaurants.map((row, i) => {
                    const isUpdating = updatingId === row.id;

                    return (
                      <tr key={row.id || i} className="rs-tr">

                        {/* Restaurant */}
                        <td className="rs-td">
                          <div className="rs-restaurant-cell">
                            <div className="rs-avatar" style={{ background: row.image_url ? `url(${row.image_url}) center/cover` : '#fff3e0' }}>
                              {!row.image_url && initials(row.name)}
                            </div>
                            <div>
                              <p className="rs-restaurant-name">{row.name || '—'}</p>
                              <p className="rs-restaurant-cuisine">
                                {row.cuisine_types?.slice(0, 2).join(', ') || 'No cuisine set'}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Owner */}
                        <td className="rs-td">
                          <p className="rs-cell-bold">{row.owner_name || '—'}</p>
                          <p className="rs-cell-muted">{row.owner_email || '—'}</p>
                        </td>

                        {/* Location */}
                        <td className="rs-td">
                          <div className="rs-location">
                            <MapPin size={13} color="#888" />
                            <span>{row.city || 'No location'}</span>
                          </div>
                        </td>

                        {/* Rating */}
                        <td className="rs-td">
                          <div className="rs-rating">
                            <Star size={14} color="#f59e0b" fill="#f59e0b" />
                            <span>{parseFloat(row.rating || 0).toFixed(1)}</span>
                            <span className="rs-review-count">({row.review_count || 0})</span>
                          </div>
                        </td>

                        {/* Earnings */}
                        <td className="rs-td">
                          <div className="rs-earnings">
                            <DollarSign size={13} color="#f59e0b" />
                            <span>{parseFloat(row.wallet?.total_earned || 0).toLocaleString()}</span>
                          </div>
                        </td>

                        {/* Verification toggle */}
                        <td className="rs-td">
                          <button
                            onClick={() => handleVerification(row)}
                            disabled={!row.id || isUpdating}
                            className={`rs-badge ${row.is_verified ? 'rs-badge-verified' : 'rs-badge-unverified'} ${(!row.id || isUpdating) ? 'rs-badge-disabled' : ''}`}
                          >
                            {isUpdating ? (
                              <span className="rs-badge-spinner" />
                            ) : row.is_verified ? (
                              <Shield size={12} />
                            ) : (
                              <ShieldOff size={12} />
                            )}
                            {row.is_verified ? 'Verified' : 'Unverified'}
                          </button>
                        </td>

                        {/* Joined */}
                        <td className="rs-td">
                          <span className="rs-cell-text">
                            {row.created_at
                              ? new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                              : '—'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="rs-td">
                          <div className="rs-actions">
                            <Link to={`/restaurants/${row.id}`} className="rs-view-btn">
                              View
                            </Link>
                            <button className="rs-action-btn rs-action-edit" onClick={() => openEditModal(row)}>
                              <Edit2 size={14} />
                            </button>
                            <button className="rs-action-btn rs-action-delete" onClick={() => openDeleteModal(row)}>
                              <Trash2 size={14} />
                            </button>
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
            <div className="rs-pagination">
              <button
                className="rs-page-btn"
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                <ChevronLeft size={15} /> Prev
              </button>

              <div className="rs-page-pills">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                  .reduce((acc, n, idx, arr) => {
                    if (idx > 0 && n - arr[idx - 1] > 1) acc.push('...');
                    acc.push(n);
                    return acc;
                  }, [])
                  .map((item, idx) =>
                    item === '...'
                      ? <span key={`ellipsis-${idx}`} className="rs-page-ellipsis">...</span>
                      : <button
                          key={item}
                          className={`rs-page-num ${item === page ? 'rs-page-active' : ''}`}
                          onClick={() => setPage(item)}
                        >{item}</button>
                  )}
              </div>

              <button
                className="rs-page-btn"
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
          <div className="rs-modal-overlay" onClick={() => setEditModal(false)}>
            <div className="rs-modal" onClick={e => e.stopPropagation()}>
              <div className="rs-modal-header">
                <h2 className="rs-modal-title">Edit Restaurant Owner</h2>
                <button className="rs-modal-close" onClick={() => setEditModal(false)}>
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleEditSubmit} className="rs-modal-form">
                {editError && (
                  <div className="rs-form-error">
                    <AlertCircle size={16} />
                    {editError}
                  </div>
                )}
                <div className="rs-form-group">
                  <label className="rs-form-label">Owner Name</label>
                  <input
                    type="text"
                    className="rs-form-input"
                    value={editData.name}
                    onChange={e => setEditData({ ...editData, name: e.target.value })}
                    placeholder="Enter name"
                  />
                </div>
                <div className="rs-form-group">
                  <label className="rs-form-label">Email</label>
                  <input
                    type="email"
                    className="rs-form-input"
                    value={editData.email}
                    onChange={e => setEditData({ ...editData, email: e.target.value })}
                    placeholder="Enter email"
                  />
                </div>
                <div className="rs-form-group">
                  <label className="rs-form-label">Phone</label>
                  <input
                    type="text"
                    className="rs-form-input"
                    value={editData.phone}
                    onChange={e => setEditData({ ...editData, phone: e.target.value })}
                    placeholder="Enter phone"
                  />
                </div>
                <div className="rs-form-actions">
                  <button type="button" className="rs-btn-cancel" onClick={() => setEditModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="rs-btn-save" disabled={saving}>
                    {saving && <span className="rs-btn-spinner" />}
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteModal && (
          <div className="rs-modal-overlay" onClick={() => setDeleteModal(false)}>
            <div className="rs-confirm-modal" onClick={e => e.stopPropagation()}>
              <div className="rs-confirm-icon">
                <Trash2 size={24} color="#dc2626" />
              </div>
              <h3 className="rs-confirm-title">Delete Restaurant</h3>
              <p className="rs-confirm-text">
                Are you sure you want to delete <strong>{deletingRestaurant?.name}</strong>?
                This will also delete the owner account and all associated data. This action cannot be undone.
              </p>
              <div className="rs-confirm-actions">
                <button className="rs-btn-cancel" onClick={() => setDeleteModal(false)}>
                  Cancel
                </button>
                <button className="rs-btn-delete" onClick={handleDelete} disabled={deleting}>
                  {deleting && <span className="rs-btn-spinner" />}
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

.rs-root {
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
.rs-header {
  display: flex;
  align-items: center;
  gap: 16px;
}
.rs-header-icon {
  width: 48px; height: 48px;
  background: #1a2e1a;
  border-radius: 15px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 6px 18px rgba(26,46,26,0.25);
}
.rs-title {
  font-family: 'Fraunces', serif;
  font-size: 26px; font-weight: 600;
  color: #1a2e1a; margin: 0 0 3px;
}
.rs-sub { font-size: 13.5px; color: #999; margin: 0; }

/* card */
.rs-card {
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 4px 20px rgba(0,0,0,0.06);
  overflow: hidden;
}

/* toolbar */
.rs-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 24px;
  border-bottom: 1px solid #f0ede6;
  flex-wrap: wrap;
}
.rs-search-wrap {
  position: relative;
  flex: 1;
  max-width: 340px;
}
.rs-search-icon {
  position: absolute;
  left: 12px; top: 50%;
  transform: translateY(-50%);
  color: #bbb;
  pointer-events: none;
}
.rs-search {
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
.rs-search::placeholder { color: #c4bfb5; }
.rs-search:focus {
  border-color: #f59e0b;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(245,158,11,0.08);
}
.rs-count { font-size: 12.5px; color: #bbb; white-space: nowrap; }

/* table */
.rs-table-wrap { overflow-x: auto; }
.rs-table { width: 100%; border-collapse: collapse; }

.rs-th {
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

.rs-tr {
  border-bottom: 1px solid #f7f5f1;
  transition: background 0.15s;
}
.rs-tr:last-child { border-bottom: none; }
.rs-tr:hover { background: #faf9f6; }

.rs-td {
  padding: 14px 20px;
  vertical-align: middle;
}

/* restaurant cell */
.rs-restaurant-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}
.rs-avatar {
  width: 42px; height: 42px;
  border-radius: 12px;
  background: #fff3e0;
  color: #f59e0b;
  font-weight: 600;
  font-size: 15px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.rs-restaurant-name { font-size: 14px; font-weight: 500; color: #1a1a1a; margin: 0 0 2px; }
.rs-restaurant-cuisine { font-size: 12px; color: #aaa; margin: 0; }

.rs-cell-text { font-size: 13.5px; color: #555; }
.rs-cell-bold { font-size: 13.5px; font-weight: 500; color: #222; margin: 0 0 2px; }
.rs-cell-muted { font-size: 12px; color: #aaa; margin: 0; }

/* location */
.rs-location {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #666;
}

/* rating */
.rs-rating {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13.5px;
  font-weight: 600;
  color: #f59e0b;
}
.rs-review-count {
  font-weight: 400;
  color: #aaa;
  font-size: 12px;
}

/* earnings */
.rs-earnings {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13.5px;
  font-weight: 600;
  color: #f59e0b;
  background: #fff8eb;
  padding: 4px 10px;
  border-radius: 8px;
}

/* badge */
.rs-badge {
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
.rs-badge:hover:not(.rs-badge-disabled) { opacity: 0.82; transform: scale(0.97); }
.rs-badge-verified   { background: #fff8eb; color: #f59e0b; }
.rs-badge-unverified { background: #f5f2ec; color: #999; }
.rs-badge-disabled   { opacity: 0.45; cursor: not-allowed; }

.rs-badge-spinner {
  width: 12px; height: 12px;
  border: 1.5px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: rsspin 0.6s linear infinite;
  opacity: 0.6;
}
@keyframes rsspin { to { transform: rotate(360deg); } }

/* view button */
.rs-view-btn {
  font-size: 13px;
  font-weight: 500;
  color: #f59e0b;
  text-decoration: none;
  padding: 6px 14px;
  border: 1.5px solid #fed7aa;
  border-radius: 9px;
  background: #fff;
  transition: background 0.15s, border-color 0.15s;
  white-space: nowrap;
  display: inline-block;
}
.rs-view-btn:hover {
  background: #fff8eb;
  border-color: #f59e0b;
}

/* loading / empty */
.rs-loading, .rs-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 64px 24px;
  color: #bbb;
  font-size: 14px;
}
.rs-spinner {
  width: 36px; height: 36px;
  border: 2.5px solid #e8e4dc;
  border-top-color: #f59e0b;
  border-radius: 50%;
  animation: rsspin 0.7s linear infinite;
}

/* pagination */
.rs-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 18px 24px;
  border-top: 1px solid #f0ede6;
  flex-wrap: wrap;
}
.rs-page-btn {
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
.rs-page-btn:hover:not(:disabled) { background: #f0ede6; border-color: #d4cfc5; }
.rs-page-btn:disabled { opacity: 0.35; cursor: not-allowed; }

.rs-page-pills { display: flex; align-items: center; gap: 4px; }
.rs-page-num {
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
.rs-page-num:hover { background: #f5f2ec; }
.rs-page-active {
  background: #f59e0b !important;
  color: #fff !important;
  border-color: #f59e0b !important;
}
.rs-page-ellipsis { font-size: 13px; color: #bbb; padding: 0 4px; }

/* actions */
.rs-actions { display: flex; align-items: center; gap: 8px; }
.rs-action-btn {
  width: 32px; height: 32px;
  border: none; border-radius: 8px;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.2s, transform 0.15s;
}
.rs-action-edit { background: #f0f9ff; color: #0369a1; }
.rs-action-edit:hover { background: #e0f2fe; transform: scale(1.05); }
.rs-action-delete { background: #fef2f2; color: #dc2626; }
.rs-action-delete:hover { background: #fee2e2; transform: scale(1.05); }

/* modal */
.rs-modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: 20px;
  backdrop-filter: blur(2px);
}
.rs-modal {
  background: #fff; border-radius: 20px;
  width: 100%; max-width: 440px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
}
.rs-modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px; border-bottom: 1px solid #f0ede6;
}
.rs-modal-title {
  font-family: 'Fraunces', serif;
  font-size: 18px; font-weight: 600; color: #1a2e1a; margin: 0;
}
.rs-modal-close {
  width: 36px; height: 36px; border: none;
  background: #f5f2ec; border-radius: 10px;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  color: #888; transition: background 0.2s;
}
.rs-modal-close:hover { background: #ebe8e0; }
.rs-modal-form { padding: 20px 24px; }
.rs-form-error {
  display: flex; align-items: center; gap: 10px;
  padding: 12px 16px; background: #fef2f2;
  border: 1px solid #fecaca; border-radius: 10px;
  color: #dc2626; font-size: 13px; margin-bottom: 16px;
}
.rs-form-group { margin-bottom: 16px; }
.rs-form-label { display: block; font-size: 13px; font-weight: 500; color: #555; margin-bottom: 6px; }
.rs-form-input {
  width: 100%; padding: 10px 14px;
  background: #fff; border: 1.5px solid #e8e4dc;
  border-radius: 10px; font-family: 'DM Sans', sans-serif;
  font-size: 14px; transition: border-color 0.2s;
}
.rs-form-input:focus { outline: none; border-color: #f59e0b; }
.rs-form-actions {
  display: flex; justify-content: flex-end; gap: 12px;
  margin-top: 20px; padding-top: 16px; border-top: 1px solid #f0ede6;
}
.rs-btn-cancel {
  padding: 10px 20px; background: #f5f2ec; border: none;
  border-radius: 10px; font-family: 'DM Sans', sans-serif;
  font-size: 14px; font-weight: 500; color: #666;
  cursor: pointer; transition: background 0.2s;
}
.rs-btn-cancel:hover { background: #ebe8e0; }
.rs-btn-save {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 24px; background: #f59e0b; border: none;
  border-radius: 10px; font-family: 'DM Sans', sans-serif;
  font-size: 14px; font-weight: 600; color: #fff;
  cursor: pointer; transition: background 0.2s;
}
.rs-btn-save:hover:not(:disabled) { background: #d97706; }
.rs-btn-save:disabled { opacity: 0.7; cursor: not-allowed; }
.rs-btn-spinner {
  width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff; border-radius: 50%;
  animation: rsspin 0.6s linear infinite;
}

/* confirm modal */
.rs-confirm-modal {
  background: #fff; border-radius: 20px;
  padding: 28px; width: 100%; max-width: 360px;
  text-align: center;
}
.rs-confirm-icon {
  width: 56px; height: 56px; background: #fef2f2;
  border-radius: 50%; display: flex; align-items: center;
  justify-content: center; margin: 0 auto 16px;
}
.rs-confirm-title {
  font-family: 'Fraunces', serif;
  font-size: 18px; font-weight: 600; color: #1a2e1a; margin: 0 0 8px;
}
.rs-confirm-text { font-size: 14px; color: #666; margin: 0 0 24px; line-height: 1.5; }
.rs-confirm-actions { display: flex; gap: 12px; justify-content: center; }
.rs-btn-delete {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 24px; background: #dc2626; border: none;
  border-radius: 10px; font-family: 'DM Sans', sans-serif;
  font-size: 14px; font-weight: 600; color: #fff;
  cursor: pointer; transition: background 0.2s;
}
.rs-btn-delete:hover:not(:disabled) { background: #b91c1c; }
.rs-btn-delete:disabled { opacity: 0.7; cursor: not-allowed; }
`;
