import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { User, ShoppingBag, MapPin, DollarSign, Search, ChevronLeft, ChevronRight, Edit2, Trash2, X, AlertCircle } from 'lucide-react';

export default function Customers() {
  const { user } = useAuth();

  // Check if user is admin (empty permissions array means super admin with all access)
  const isAdmin = !user?.permissions || user.permissions.length === 0;

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');

  // Edit modal state
  const [editModal, setEditModal] = useState(false);
  const [editData, setEditData] = useState({ name: '', email: '', phone: '', address: '' });
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState(false);
  const [deletingCustomer, setDeletingCustomer] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { fetchCustomers(); }, [page, search]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getCustomers({ page, limit: 10, search });
      const payload = response.data || {};
      const rows = Array.isArray(payload.data)
        ? payload.data
        : Array.isArray(payload.data?.data)
          ? payload.data.data
          : Array.isArray(payload.customers)
            ? payload.customers
            : [];
      const pagination = payload.pagination || payload.data?.pagination || payload.meta?.pagination || {};
      setCustomers(rows);
      setTotalPages(pagination.pages || 1);
    } catch (err) {
      console.error('Failed to fetch customers:', err);
    } finally {
      setLoading(false);
    }
  };

  const initials = (name) => {
    if (!name) return 'C';
    const parts = name.trim().split(' ');
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : parts[0][0].toUpperCase();
  };

  const AVATAR_COLORS = [
    { bg: '#fef3c7', color: '#b45309' },
    { bg: '#fce7f3', color: '#be185d' },
    { bg: '#ede9fe', color: '#6d28d9' },
    { bg: '#dbeafe', color: '#1d4ed8' },
    { bg: '#d1fae5', color: '#065f46' },
  ];

  const avatarColor = (name = '') => {
    const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
    return AVATAR_COLORS[idx];
  };

  // Edit handlers
  const openEditModal = (customer) => {
    setEditingCustomer(customer);
    setEditData({
      name: customer.name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
    });
    setEditError('');
    setEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setEditError('');
    try {
      await adminAPI.updateCustomer(editingCustomer.id, editData);
      setEditModal(false);
      fetchCustomers();
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update customer');
    } finally {
      setSaving(false);
    }
  };

  // Delete handlers
  const openDeleteModal = (customer) => {
    setDeletingCustomer(customer);
    setDeleteModal(true);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await adminAPI.deleteCustomer(deletingCustomer.id);
      setDeleteModal(false);
      fetchCustomers();
    } catch (err) {
      console.error('Failed to delete customer:', err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <style>{styles}</style>

      <div className="cu-root">

        {/* Header */}
        <div className="cu-header">
          <div className="cu-header-icon">
            <User size={22} color="#fbbf24" />
          </div>
          <div>
            <h1 className="cu-title">Customers</h1>
            <p className="cu-sub">View customer accounts and order history</p>
          </div>
        </div>

        {/* Table card */}
        <div className="cu-card">

          {/* Toolbar */}
          <div className="cu-toolbar">
            <div className="cu-search-wrap">
              <Search size={15} className="cu-search-icon" />
              <input
                className="cu-search"
                placeholder="Search customers by name or email…"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <span className="cu-count">{customers.length} result{customers.length !== 1 ? 's' : ''}</span>
          </div>

          {/* Table */}
          <div className="cu-table-wrap">
            {loading ? (
              <div className="cu-state">
                <div className="cu-spinner" />
                <p>Loading customers…</p>
              </div>
            ) : customers.length === 0 ? (
              <div className="cu-state">
                <User size={32} color="#c4bfb5" />
                <p>No customers found</p>
              </div>
            ) : (
              <table className="cu-table">
                <thead>
                  <tr>
                    {['Customer', 'Phone', 'Address', 'Orders', 'Total Spent', 'Joined', 'Actions'].map(h => (
                      <th key={h} className="cu-th">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {customers.map((row, i) => {
                    const av = avatarColor(row.name);
                    const spent = parseFloat(row.orders?.total_spent || 0);
                    const orderCount = row.orders?.order_count || 0;

                    return (
                      <tr key={row.id || i} className="cu-tr">

                        {/* Customer */}
                        <td className="cu-td">
                          <div className="cu-customer-cell">
                            <div className="cu-avatar" style={{ background: av.bg, color: av.color }}>
                              {initials(row.name)}
                            </div>
                            <div>
                              <p className="cu-name">{row.name || '—'}</p>
                              <p className="cu-email">{row.email || '—'}</p>
                            </div>
                          </div>
                        </td>

                        {/* Phone */}
                        <td className="cu-td">
                          <span className="cu-cell-text">{row.phone || '—'}</span>
                        </td>

                        {/* Address */}
                        <td className="cu-td">
                          <div className="cu-address">
                            <MapPin size={13} color="#c4bfb5" style={{ flexShrink: 0 }} />
                            <span>{row.address || 'Not provided'}</span>
                          </div>
                        </td>

                        {/* Orders */}
                        <td className="cu-td">
                          <div className="cu-orders">
                            <ShoppingBag size={13} color="#b45309" />
                            <span>{orderCount}</span>
                            <span className="cu-orders-lbl">orders</span>
                          </div>
                        </td>

                        {/* Total spent */}
                        <td className="cu-td">
                          <span className="cu-spent">
                            <DollarSign size={13} />
                            {spent.toLocaleString()}
                          </span>
                        </td>

                        {/* Joined */}
                        <td className="cu-td">
                          <span className="cu-cell-text">
                            {row.created_at
                              ? new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                              : '—'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="cu-td">
                          <div className="cu-actions">
                            {isAdmin && (
                              <>
                                <button
                                  className="cu-action-btn cu-action-edit"
                                  onClick={() => openEditModal(row)}
                                  title="Edit customer"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  className="cu-action-btn cu-action-delete"
                                  onClick={() => openDeleteModal(row)}
                                  title="Delete customer"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </>
                            )}
                            {!isAdmin && (
                              <span className="cu-no-actions">View only</span>
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
            <div className="cu-pagination">
              <button
                className="cu-page-btn"
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                <ChevronLeft size={15} /> Prev
              </button>

              <div className="cu-page-pills">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                  .reduce((acc, n, idx, arr) => {
                    if (idx > 0 && n - arr[idx - 1] > 1) acc.push('…');
                    acc.push(n);
                    return acc;
                  }, [])
                  .map((item, idx) =>
                    item === '…'
                      ? <span key={`e-${idx}`} className="cu-page-ellipsis">…</span>
                      : <button
                          key={item}
                          className={`cu-page-num ${item === page ? 'cu-page-active' : ''}`}
                          onClick={() => setPage(item)}
                        >{item}</button>
                  )}
              </div>

              <button
                className="cu-page-btn"
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
        <div className="cu-modal-overlay" onClick={() => setEditModal(false)}>
          <div className="cu-modal" onClick={e => e.stopPropagation()}>
            <div className="cu-modal-header">
              <h2 className="cu-modal-title">Edit Customer</h2>
              <button className="cu-modal-close" onClick={() => setEditModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="cu-modal-body">
              {editError && (
                <div className="cu-error">
                  <AlertCircle size={16} />
                  {editError}
                </div>
              )}

              <div className="cu-form-group">
                <label className="cu-label">Name</label>
                <input
                  type="text"
                  className="cu-input"
                  value={editData.name}
                  onChange={e => setEditData({ ...editData, name: e.target.value })}
                  required
                />
              </div>

              <div className="cu-form-group">
                <label className="cu-label">Email</label>
                <input
                  type="email"
                  className="cu-input"
                  value={editData.email}
                  onChange={e => setEditData({ ...editData, email: e.target.value })}
                  required
                />
              </div>

              <div className="cu-form-group">
                <label className="cu-label">Phone</label>
                <input
                  type="text"
                  className="cu-input"
                  value={editData.phone}
                  onChange={e => setEditData({ ...editData, phone: e.target.value })}
                />
              </div>

              <div className="cu-form-group">
                <label className="cu-label">Address</label>
                <input
                  type="text"
                  className="cu-input"
                  value={editData.address}
                  onChange={e => setEditData({ ...editData, address: e.target.value })}
                  placeholder="Customer address"
                />
              </div>

              <div className="cu-modal-actions">
                <button type="button" className="cu-btn cu-btn-cancel" onClick={() => setEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="cu-btn cu-btn-save" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="cu-modal-overlay" onClick={() => setDeleteModal(false)}>
          <div className="cu-modal cu-modal-delete" onClick={e => e.stopPropagation()}>
            <div className="cu-delete-icon">
              <AlertCircle size={32} color="#dc2626" />
            </div>
            <h2 className="cu-delete-title">Delete Customer</h2>
            <p className="cu-delete-text">
              Are you sure you want to delete <strong>{deletingCustomer?.name}</strong>? This action cannot be undone.
            </p>
            <div className="cu-modal-actions">
              <button className="cu-btn cu-btn-cancel" onClick={() => setDeleteModal(false)}>
                Cancel
              </button>
              <button className="cu-btn cu-btn-delete" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Delete Customer'}
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

.cu-root {
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
.cu-header { display: flex; align-items: center; gap: 16px; }
.cu-header-icon {
  width: 48px; height: 48px;
  background: #451a03;
  border-radius: 15px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 6px 18px rgba(69,26,3,0.28);
}
.cu-title {
  font-family: 'Fraunces', serif;
  font-size: 26px; font-weight: 600;
  color: #1a2e1a; margin: 0 0 3px;
}
.cu-sub { font-size: 13.5px; color: #999; margin: 0; }

/* card */
.cu-card {
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 4px 20px rgba(0,0,0,0.06);
  overflow: hidden;
}

/* toolbar */
.cu-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 24px;
  border-bottom: 1px solid #f0ede6;
  flex-wrap: wrap;
}
.cu-search-wrap { position: relative; flex: 1; max-width: 340px; }
.cu-search-icon {
  position: absolute; left: 12px; top: 50%;
  transform: translateY(-50%); color: #bbb; pointer-events: none;
}
.cu-search {
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
.cu-search::placeholder { color: #c4bfb5; }
.cu-search:focus {
  border-color: #b45309;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(180,83,9,0.08);
}
.cu-count { font-size: 12.5px; color: #bbb; white-space: nowrap; }

/* table */
.cu-table-wrap { overflow-x: auto; }
.cu-table { width: 100%; border-collapse: collapse; }
.cu-th {
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
.cu-tr {
  border-bottom: 1px solid #f7f5f1;
  transition: background 0.15s;
}
.cu-tr:last-child { border-bottom: none; }
.cu-tr:hover { background: #fdfcf9; }
.cu-td { padding: 14px 20px; vertical-align: middle; }

/* customer cell */
.cu-customer-cell { display: flex; align-items: center; gap: 12px; }
.cu-avatar {
  width: 38px; height: 38px;
  border-radius: 12px;
  font-size: 13px; font-weight: 600;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  letter-spacing: 0.03em;
}
.cu-name  { font-size: 14px; font-weight: 500; color: #1a1a1a; margin: 0 0 2px; }
.cu-email { font-size: 12px; color: #aaa; margin: 0; }
.cu-cell-text { font-size: 13.5px; color: #555; }

/* address */
.cu-address {
  display: flex; align-items: center; gap: 5px;
  font-size: 13px; color: #777;
  max-width: 200px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

/* orders */
.cu-orders {
  display: inline-flex; align-items: center; gap: 5px;
  background: #fff8ed;
  border-radius: 8px;
  padding: 5px 10px;
  font-size: 14px; font-weight: 600;
  color: #b45309;
}
.cu-orders-lbl {
  font-family: 'DM Sans', sans-serif;
  font-size: 11px; font-weight: 400;
  color: #d97706;
}

/* spent */
.cu-spent {
  display: inline-flex; align-items: center; gap: 3px;
  font-size: 14px; font-weight: 600;
  color: #2d5a27;
  background: #f0faf0;
  border-radius: 8px;
  padding: 5px 10px;
}

/* state */
.cu-state {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 12px; padding: 64px 24px;
  color: #bbb; font-size: 14px;
}
.cu-spinner {
  width: 36px; height: 36px;
  border: 2.5px solid #e8e4dc;
  border-top-color: #b45309;
  border-radius: 50%;
  animation: cuspin 0.7s linear infinite;
}
@keyframes cuspin { to { transform: rotate(360deg); } }

/* pagination */
.cu-pagination {
  display: flex; align-items: center;
  justify-content: center; gap: 8px;
  padding: 18px 24px;
  border-top: 1px solid #f0ede6;
  flex-wrap: wrap;
}
.cu-page-btn {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 7px 14px;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px; font-weight: 500;
  color: #555; background: #f9f8f6;
  border: 1.5px solid #e8e4dc;
  border-radius: 9px; cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}
.cu-page-btn:hover:not(:disabled) { background: #f0ede6; border-color: #d4cfc5; }
.cu-page-btn:disabled { opacity: 0.35; cursor: not-allowed; }

.cu-page-pills { display: flex; align-items: center; gap: 4px; }
.cu-page-num {
  width: 34px; height: 34px;
  display: flex; align-items: center; justify-content: center;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px; font-weight: 500;
  color: #666; background: transparent;
  border: 1.5px solid transparent;
  border-radius: 9px; cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.cu-page-num:hover { background: #f5f2ec; }
.cu-page-active {
  background: #451a03 !important;
  color: #fff !important;
  border-color: #451a03 !important;
}
.cu-page-ellipsis { font-size: 13px; color: #bbb; padding: 0 4px; }

/* Actions */
.cu-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}
.cu-action-btn {
  width: 32px; height: 32px;
  display: flex; align-items: center; justify-content: center;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
}
.cu-action-edit {
  background: #fef3c7;
  color: #b45309;
}
.cu-action-edit:hover {
  background: #fde68a;
}
.cu-action-delete {
  background: #fee2e2;
  color: #dc2626;
}
.cu-action-delete:hover {
  background: #fecaca;
}
.cu-no-actions {
  font-size: 12px;
  color: #999;
  font-style: italic;
}

/* Modal */
.cu-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}
.cu-modal {
  background: #fff;
  border-radius: 20px;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px rgba(0,0,0,0.25);
}
.cu-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #f0ede6;
}
.cu-modal-title {
  font-family: 'Fraunces', serif;
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}
.cu-modal-close {
  width: 36px; height: 36px;
  display: flex; align-items: center; justify-content: center;
  background: #f5f2ec;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  color: #666;
  transition: all 0.15s;
}
.cu-modal-close:hover {
  background: #e8e4dc;
  color: #333;
}
.cu-modal-body {
  padding: 24px;
}
.cu-modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

/* Form */
.cu-form-group {
  margin-bottom: 16px;
}
.cu-label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #555;
  margin-bottom: 6px;
}
.cu-input {
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
.cu-input:focus {
  border-color: #b45309;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(180,83,9,0.08);
}
.cu-input::placeholder {
  color: #bbb;
}
.cu-error {
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
.cu-btn {
  padding: 10px 20px;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 500;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s;
}
.cu-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.cu-btn-cancel {
  background: #f5f2ec;
  color: #666;
}
.cu-btn-cancel:hover:not(:disabled) {
  background: #e8e4dc;
}
.cu-btn-save {
  background: #b45309;
  color: #fff;
}
.cu-btn-save:hover:not(:disabled) {
  background: #92400e;
}
.cu-btn-delete {
  background: #dc2626;
  color: #fff;
}
.cu-btn-delete:hover:not(:disabled) {
  background: #b91c1c;
}

/* Delete Modal */
.cu-modal-delete {
  text-align: center;
  padding: 32px;
  max-width: 400px;
}
.cu-delete-icon {
  width: 64px; height: 64px;
  background: #fef2f2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}
.cu-delete-title {
  font-family: 'Fraunces', serif;
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 12px;
}
.cu-delete-text {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin: 0 0 24px;
}
.cu-modal-delete .cu-modal-actions {
  justify-content: center;
  margin-top: 0;
}
`;