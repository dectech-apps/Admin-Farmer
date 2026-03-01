import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Truck, Star, CheckCircle, XCircle, Search, ChevronLeft, ChevronRight, Edit2, Trash2, X, AlertCircle, Eye, ShieldCheck, Clock, ShieldX } from 'lucide-react';

export default function Riders() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Check if user is admin (empty permissions array means super admin with all access)
  const isAdmin = !user?.permissions || user.permissions.length === 0;

  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');

  // Edit modal state
  const [editModal, setEditModal] = useState(false);
  const [editData, setEditData] = useState({ name: '', email: '', phone: '', vehicle_type: '', license_plate: '' });
  const [editingRider, setEditingRider] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState(false);
  const [deletingRider, setDeletingRider] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { fetchRiders(); }, [page, search]);

  const fetchRiders = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getRiders({ page, limit: 10, search });
      const payload = response.data || {};
      const rows = Array.isArray(payload.data)
        ? payload.data
        : Array.isArray(payload.data?.data)
          ? payload.data.data
          : Array.isArray(payload.riders)
            ? payload.riders
            : [];
      const pagination = payload.pagination || payload.data?.pagination || payload.meta?.pagination || {};
      setRiders(rows);
      setTotalPages(pagination.pages || 1);
    } catch (err) {
      console.error('Failed to fetch riders:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    const val = parseFloat(rating) || 0;
    return (
      <div className="rd-rating">
        <div className="rd-stars">
          {[1,2,3,4,5].map(n => (
            <Star
              key={n}
              size={12}
              fill={n <= Math.round(val) ? '#f59e0b' : 'none'}
              color={n <= Math.round(val) ? '#f59e0b' : '#ddd'}
            />
          ))}
        </div>
        <span className="rd-rating-num">{val ? val.toFixed(1) : '—'}</span>
      </div>
    );
  };

  // Edit handlers
  const openEditModal = (rider) => {
    setEditingRider(rider);
    setEditData({
      name: rider.name || '',
      email: rider.email || '',
      phone: rider.phone || '',
      vehicle_type: rider.vehicle_type || '',
      license_plate: rider.license_plate || '',
    });
    setEditError('');
    setEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setEditError('');
    try {
      await adminAPI.updateRider(editingRider.id, editData);
      setEditModal(false);
      fetchRiders();
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update rider');
    } finally {
      setSaving(false);
    }
  };

  // Delete handlers
  const openDeleteModal = (rider) => {
    setDeletingRider(rider);
    setDeleteModal(true);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await adminAPI.deleteRider(deletingRider.id);
      setDeleteModal(false);
      fetchRiders();
    } catch (err) {
      console.error('Failed to delete rider:', err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <style>{styles}</style>

      <div className="rd-root">

        {/* Header */}
        <div className="rd-header">
          <div className="rd-header-icon">
            <Truck size={22} color="#7dd3fc" />
          </div>
          <div>
            <h1 className="rd-title">Riders</h1>
            <p className="rd-sub">Manage delivery rider accounts and availability</p>
          </div>
        </div>

        {/* Table card */}
        <div className="rd-card">

          {/* Toolbar */}
          <div className="rd-toolbar">
            <div className="rd-search-wrap">
              <Search size={15} className="rd-search-icon" />
              <input
                className="rd-search"
                placeholder="Search riders by name or email…"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <span className="rd-count">{riders.length} result{riders.length !== 1 ? 's' : ''}</span>
          </div>

          {/* Table */}
          <div className="rd-table-wrap">
            {loading ? (
              <div className="rd-state">
                <div className="rd-spinner" />
                <p>Loading riders…</p>
              </div>
            ) : riders.length === 0 ? (
              <div className="rd-state">
                <Truck size={32} color="#c4bfb5" />
                <p>No riders found</p>
              </div>
            ) : (
              <table className="rd-table">
                <thead>
                  <tr>
                    {['Rider', 'Phone', 'Vehicle', 'Deliveries', 'Rating', 'Verification', 'Status', 'Joined', 'Actions'].map(h => (
                      <th key={h} className="rd-th">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {riders.map((row, i) => (
                    <tr key={row.id || i} className="rd-tr">

                      {/* Rider */}
                      <td className="rd-td">
                        <div className="rd-rider-cell">
                          <div className="rd-avatar">
                            <Truck size={16} color="#0369a1" />
                          </div>
                          <div>
                            <p className="rd-rider-name">{row.name || '—'}</p>
                            <p className="rd-rider-email">{row.email || '—'}</p>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="rd-td">
                        <span className="rd-cell-text">{row.phone || '—'}</span>
                      </td>

                      {/* Vehicle */}
                      <td className="rd-td">
                        <span className="rd-vehicle-pill">
                          {row.vehicle_type || 'Not specified'}
                        </span>
                        {row.license_plate && (
                          <p className="rd-plate">{row.license_plate}</p>
                        )}
                      </td>

                      {/* Deliveries */}
                      <td className="rd-td">
                        <div className="rd-deliveries">
                          <span>{row.total_deliveries || 0}</span>
                          <span className="rd-deliveries-lbl">trips</span>
                        </div>
                      </td>

                      {/* Rating */}
                      <td className="rd-td">{renderStars(row.rating)}</td>

                      {/* Verification Status */}
                      <td className="rd-td">
                        {row.is_verified || row.verification_status === 'verified' ? (
                          <span className="rd-verify-badge rd-verify-verified">
                            <ShieldCheck size={12} /> Verified
                          </span>
                        ) : row.verification_status === 'pending' || row.verification_status === 'under_review' ? (
                          <span className="rd-verify-badge rd-verify-pending">
                            <Clock size={12} /> Pending
                          </span>
                        ) : row.verification_status === 'rejected' ? (
                          <span className="rd-verify-badge rd-verify-rejected">
                            <ShieldX size={12} /> Rejected
                          </span>
                        ) : (
                          <span className="rd-verify-badge rd-verify-none">
                            <ShieldX size={12} /> Not Submitted
                          </span>
                        )}
                      </td>

                      {/* Availability */}
                      <td className="rd-td">
                        <span className={`rd-status ${row.is_available ? 'rd-status-on' : 'rd-status-off'}`}>
                          {row.is_available
                            ? <><CheckCircle size={12} /> Available</>
                            : <><XCircle size={12} /> Offline</>
                          }
                        </span>
                      </td>

                      {/* Joined */}
                      <td className="rd-td">
                        <span className="rd-cell-text">
                          {row.created_at
                            ? new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                            : '—'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="rd-td">
                        <div className="rd-actions">
                          <button
                            className="rd-action-btn rd-action-view"
                            onClick={() => {
                              // Use rider_id if available, otherwise fall back to id
                              const riderId = row.rider_id || row.id;
                              console.log('Navigating to rider details with row:', row);
                              console.log('Using rider ID:', riderId);
                              navigate(`/riders/${riderId}`);
                            }}
                            title="View details"
                          >
                            <Eye size={14} />
                          </button>
                          {isAdmin && (
                            <>
                              <button
                                className="rd-action-btn rd-action-edit"
                                onClick={() => openEditModal(row)}
                                title="Edit rider"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                className="rd-action-btn rd-action-delete"
                                onClick={() => openDeleteModal(row)}
                                title="Delete rider"
                              >
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="rd-pagination">
              <button
                className="rd-page-btn"
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                <ChevronLeft size={15} /> Prev
              </button>

              <div className="rd-page-pills">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                  .reduce((acc, n, idx, arr) => {
                    if (idx > 0 && n - arr[idx - 1] > 1) acc.push('…');
                    acc.push(n);
                    return acc;
                  }, [])
                  .map((item, idx) =>
                    item === '…'
                      ? <span key={`e-${idx}`} className="rd-page-ellipsis">…</span>
                      : <button
                          key={item}
                          className={`rd-page-num ${item === page ? 'rd-page-active' : ''}`}
                          onClick={() => setPage(item)}
                        >{item}</button>
                  )}
              </div>

              <button
                className="rd-page-btn"
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              >
                Next <ChevronRight size={15} />
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Edit Modal */}
      {editModal && (
        <div className="rd-modal-overlay" onClick={() => setEditModal(false)}>
          <div className="rd-modal" onClick={e => e.stopPropagation()}>
            <div className="rd-modal-header">
              <h2 className="rd-modal-title">Edit Rider</h2>
              <button className="rd-modal-close" onClick={() => setEditModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="rd-modal-body">
              {editError && (
                <div className="rd-error">
                  <AlertCircle size={16} />
                  {editError}
                </div>
              )}

              <div className="rd-form-group">
                <label className="rd-label">Name</label>
                <input
                  type="text"
                  className="rd-input"
                  value={editData.name}
                  onChange={e => setEditData({ ...editData, name: e.target.value })}
                  required
                />
              </div>

              <div className="rd-form-group">
                <label className="rd-label">Email</label>
                <input
                  type="email"
                  className="rd-input"
                  value={editData.email}
                  onChange={e => setEditData({ ...editData, email: e.target.value })}
                  required
                />
              </div>

              <div className="rd-form-group">
                <label className="rd-label">Phone</label>
                <input
                  type="text"
                  className="rd-input"
                  value={editData.phone}
                  onChange={e => setEditData({ ...editData, phone: e.target.value })}
                />
              </div>

              <div className="rd-form-row">
                <div className="rd-form-group">
                  <label className="rd-label">Vehicle Type</label>
                  <input
                    type="text"
                    className="rd-input"
                    value={editData.vehicle_type}
                    onChange={e => setEditData({ ...editData, vehicle_type: e.target.value })}
                    placeholder="e.g., Motorcycle, Bicycle"
                  />
                </div>
                <div className="rd-form-group">
                  <label className="rd-label">License Plate</label>
                  <input
                    type="text"
                    className="rd-input"
                    value={editData.license_plate}
                    onChange={e => setEditData({ ...editData, license_plate: e.target.value })}
                  />
                </div>
              </div>

              <div className="rd-modal-actions">
                <button type="button" className="rd-btn rd-btn-cancel" onClick={() => setEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="rd-btn rd-btn-save" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="rd-modal-overlay" onClick={() => setDeleteModal(false)}>
          <div className="rd-modal rd-modal-delete" onClick={e => e.stopPropagation()}>
            <div className="rd-delete-icon">
              <AlertCircle size={32} color="#dc2626" />
            </div>
            <h2 className="rd-delete-title">Delete Rider</h2>
            <p className="rd-delete-text">
              Are you sure you want to delete <strong>{deletingRider?.name}</strong>? This action cannot be undone.
            </p>
            <div className="rd-modal-actions">
              <button className="rd-btn rd-btn-cancel" onClick={() => setDeleteModal(false)}>
                Cancel
              </button>
              <button className="rd-btn rd-btn-delete" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Delete Rider'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,600&family=DM+Sans:wght@300;400;500&display=swap');

.rd-root {
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
.rd-header {
  display: flex;
  align-items: center;
  gap: 16px;
}
.rd-header-icon {
  width: 48px; height: 48px;
  background: #0c2340;
  border-radius: 15px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 6px 18px rgba(12,35,64,0.28);
}
.rd-title {
  font-family: 'Fraunces', serif;
  font-size: 26px; font-weight: 600;
  color: #1a2e1a; margin: 0 0 3px;
}
.rd-sub { font-size: 13.5px; color: #999; margin: 0; }

/* card */
.rd-card {
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 4px 20px rgba(0,0,0,0.06);
  overflow: hidden;
}

/* toolbar */
.rd-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 24px;
  border-bottom: 1px solid #f0ede6;
  flex-wrap: wrap;
}
.rd-search-wrap { position: relative; flex: 1; max-width: 340px; }
.rd-search-icon {
  position: absolute; left: 12px; top: 50%;
  transform: translateY(-50%); color: #bbb; pointer-events: none;
}
.rd-search {
  width: 100%;
  padding: 9px 14px 9px 36px;
  font-family: 'DM Sans', sans-serif;
  font-size: 13.5px;
  background: #f9f8f6;
  border: 1.5px solid #e8e4dc;
  border-radius: 10px;
  outline: none; color: #222;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.rd-search::placeholder { color: #c4bfb5; }
.rd-search:focus {
  border-color: #0369a1;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(3,105,161,0.08);
}
.rd-count { font-size: 12.5px; color: #bbb; white-space: nowrap; }

/* table */
.rd-table-wrap { overflow-x: auto; }
.rd-table { width: 100%; border-collapse: collapse; }
.rd-th {
  padding: 11px 20px;
  text-align: left;
  font-size: 11.5px; font-weight: 500;
  color: #aaa;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  background: #faf9f6;
  border-bottom: 1px solid #f0ede6;
  white-space: nowrap;
}
.rd-tr {
  border-bottom: 1px solid #f7f5f1;
  transition: background 0.15s;
}
.rd-tr:last-child { border-bottom: none; }
.rd-tr:hover { background: #faf9f6; }
.rd-td { padding: 14px 20px; vertical-align: middle; }

/* rider cell */
.rd-rider-cell { display: flex; align-items: center; gap: 12px; }
.rd-avatar {
  width: 38px; height: 38px;
  border-radius: 12px;
  background: #e0f2fe;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.rd-rider-name { font-size: 14px; font-weight: 500; color: #1a1a1a; margin: 0 0 2px; }
.rd-rider-email { font-size: 12px; color: #aaa; margin: 0; }
.rd-cell-text { font-size: 13.5px; color: #555; }

/* vehicle */
.rd-vehicle-pill {
  display: inline-block;
  font-size: 12.5px; font-weight: 500;
  text-transform: capitalize;
  background: #f5f2ec;
  color: #666;
  padding: 4px 10px;
  border-radius: 7px;
}
.rd-plate { font-size: 11.5px; color: #aaa; margin: 4px 0 0; }

/* deliveries */
.rd-deliveries {
  display: flex; align-items: baseline; gap: 4px;
  font-size: 16px; font-weight: 600;
  font-family: 'Fraunces', serif;
  color: #1a1a1a;
}
.rd-deliveries-lbl { font-family: 'DM Sans', sans-serif; font-size: 11px; color: #bbb; font-weight: 400; }

/* rating */
.rd-rating { display: flex; align-items: center; gap: 6px; }
.rd-stars { display: flex; gap: 2px; }
.rd-rating-num { font-size: 13px; font-weight: 600; color: #444; }

/* status */
.rd-status {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 11px;
  border-radius: 99px;
  font-size: 12.5px; font-weight: 500;
  white-space: nowrap;
}
.rd-status-on  { background: #e8f5e0; color: #2d5a27; }
.rd-status-off { background: #f5f2ec; color: #999; }

/* verification badges */
.rd-verify-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 99px;
  font-size: 12px; font-weight: 500;
  white-space: nowrap;
}
.rd-verify-verified { background: #dcfce7; color: #166534; }
.rd-verify-pending { background: #fef3c7; color: #92400e; }
.rd-verify-rejected { background: #fee2e2; color: #dc2626; }
.rd-verify-none { background: #f5f5f5; color: #888; }

/* state (loading/empty) */
.rd-state {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 12px; padding: 64px 24px;
  color: #bbb; font-size: 14px;
}
.rd-spinner {
  width: 36px; height: 36px;
  border: 2.5px solid #e8e4dc;
  border-top-color: #0369a1;
  border-radius: 50%;
  animation: rdspin 0.7s linear infinite;
}
@keyframes rdspin { to { transform: rotate(360deg); } }

/* pagination */
.rd-pagination {
  display: flex; align-items: center;
  justify-content: center; gap: 8px;
  padding: 18px 24px;
  border-top: 1px solid #f0ede6;
  flex-wrap: wrap;
}
.rd-page-btn {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 7px 14px;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px; font-weight: 500;
  color: #555; background: #f9f8f6;
  border: 1.5px solid #e8e4dc;
  border-radius: 9px; cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}
.rd-page-btn:hover:not(:disabled) { background: #f0ede6; border-color: #d4cfc5; }
.rd-page-btn:disabled { opacity: 0.35; cursor: not-allowed; }

.rd-page-pills { display: flex; align-items: center; gap: 4px; }
.rd-page-num {
  width: 34px; height: 34px;
  display: flex; align-items: center; justify-content: center;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px; font-weight: 500;
  color: #666; background: transparent;
  border: 1.5px solid transparent;
  border-radius: 9px; cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.rd-page-num:hover { background: #f5f2ec; }
.rd-page-active {
  background: #0c2340 !important;
  color: #fff !important;
  border-color: #0c2340 !important;
}
.rd-page-ellipsis { font-size: 13px; color: #bbb; padding: 0 4px; }

/* Actions */
.rd-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}
.rd-action-btn {
  width: 32px; height: 32px;
  display: flex; align-items: center; justify-content: center;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
}
.rd-action-view {
  background: #f5f2ec;
  color: #666;
}
.rd-action-view:hover {
  background: #e8e4dc;
}
.rd-action-edit {
  background: #e0f2fe;
  color: #0369a1;
}
.rd-action-edit:hover {
  background: #bae6fd;
}
.rd-action-delete {
  background: #fee2e2;
  color: #dc2626;
}
.rd-action-delete:hover {
  background: #fecaca;
}

/* Modal */
.rd-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}
.rd-modal {
  background: #fff;
  border-radius: 20px;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px rgba(0,0,0,0.25);
}
.rd-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #f0ede6;
}
.rd-modal-title {
  font-family: 'Fraunces', serif;
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}
.rd-modal-close {
  width: 36px; height: 36px;
  display: flex; align-items: center; justify-content: center;
  background: #f5f2ec;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  color: #666;
  transition: all 0.15s;
}
.rd-modal-close:hover {
  background: #e8e4dc;
  color: #333;
}
.rd-modal-body {
  padding: 24px;
}
.rd-modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

/* Form */
.rd-form-group {
  margin-bottom: 16px;
}
.rd-form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.rd-label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #555;
  margin-bottom: 6px;
}
.rd-input {
  width: 100%;
  padding: 10px 14px;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  border: 1.5px solid #e8e4dc;
  border-radius: 10px;
  background: #faf9f6;
  color: #222;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.rd-input:focus {
  border-color: #0369a1;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(3,105,161,0.08);
}
.rd-input::placeholder {
  color: #bbb;
}
.rd-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 10px;
  color: #dc2626;
  font-size: 13px;
  margin-bottom: 16px;
}

/* Buttons */
.rd-btn {
  padding: 10px 20px;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 500;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s;
}
.rd-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.rd-btn-cancel {
  background: #f5f2ec;
  color: #666;
}
.rd-btn-cancel:hover:not(:disabled) {
  background: #e8e4dc;
}
.rd-btn-save {
  background: #0369a1;
  color: #fff;
}
.rd-btn-save:hover:not(:disabled) {
  background: #0284c7;
}
.rd-btn-delete {
  background: #dc2626;
  color: #fff;
}
.rd-btn-delete:hover:not(:disabled) {
  background: #b91c1c;
}

/* Delete Modal */
.rd-modal-delete {
  text-align: center;
  padding: 32px;
  max-width: 400px;
}
.rd-delete-icon {
  width: 64px; height: 64px;
  background: #fef2f2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}
.rd-delete-title {
  font-family: 'Fraunces', serif;
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 12px;
}
.rd-delete-text {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin: 0 0 24px;
}
.rd-modal-delete .rd-modal-actions {
  justify-content: center;
  margin-top: 0;
}
`;