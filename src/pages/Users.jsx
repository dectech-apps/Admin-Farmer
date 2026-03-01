import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import {
  Users as UsersIcon, Plus, Search, Edit2, Trash2, Shield,
  X, Eye, EyeOff, Check, AlertCircle,
} from 'lucide-react';

const PERMISSION_LABELS = {
  dashboard: 'Dashboard',
  farmers: 'Farmers',
  restaurants: 'Restaurants',
  riders: 'Riders',
  customers: 'Customers',
  orders: 'Orders',
  payments: 'Payments',
  analytics: 'Analytics',
  users: 'Users',
};

const PERMISSION_COLORS = {
  dashboard: '#2d5a27',
  farmers: '#166534',
  restaurants: '#f59e0b',
  riders: '#0369a1',
  customers: '#7c3aed',
  orders: '#be185d',
  payments: '#059669',
  analytics: '#dc2626',
  users: '#4f46e5',
};

export default function Users() {
  const [users, setUsers] = useState([]);
  const [availablePermissions, setAvailablePermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [selectedUser, setSelectedUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    permissions: [],
  });
  const [showPassword, setShowPassword] = useState(false);

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchPermissions();
  }, [pagination.page, search]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getSystemUsers({
        page: pagination.page,
        limit: 20,
        search,
      });
      setUsers(response.data.data || []);
      setPagination(prev => ({
        ...prev,
        pages: response.data.pagination?.pages || 1,
        total: response.data.pagination?.total || 0,
      }));
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await adminAPI.getAvailablePermissions();
      setAvailablePermissions(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch permissions:', err);
    }
  };

  const openAddModal = () => {
    setModalMode('add');
    setFormData({ name: '', email: '', phone: '', password: '', permissions: [] });
    setSelectedUser(null);
    setError('');
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setModalMode('edit');
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      password: '',
      permissions: user.permissions || [],
    });
    setSelectedUser(user);
    setError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const togglePermission = (perm) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter(p => p !== perm)
        : [...prev.permissions, perm],
    }));
  };

  const selectAllPermissions = () => {
    const allPerms = Object.keys(PERMISSION_LABELS);
    setFormData(prev => ({ ...prev, permissions: allPerms }));
  };

  const clearAllPermissions = () => {
    setFormData(prev => ({ ...prev, permissions: [] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email) {
      setError('Name and email are required');
      return;
    }

    if (modalMode === 'add' && !formData.password) {
      setError('Password is required for new users');
      return;
    }

    try {
      setSaving(true);

      if (modalMode === 'add') {
        await adminAPI.createSystemUser(formData);
      } else {
        const updateData = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          permissions: formData.permissions,
        };
        if (formData.password) {
          updateData.password = formData.password;
        }
        await adminAPI.updateSystemUser(selectedUser.id, updateData);
      }

      closeModal();
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (userId) => {
    try {
      setDeleting(true);
      await adminAPI.deleteSystemUser(userId);
      setDeleteConfirm(null);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <style>{styles}</style>

      <div className="us-root">
        {/* Header */}
        <div className="us-header">
          <div className="us-header-left">
            <div className="us-header-icon">
              <UsersIcon size={24} color="#a3d977" />
            </div>
            <div>
              <h1 className="us-title">System Users</h1>
              <p className="us-sub">Manage admin users and their permissions</p>
            </div>
          </div>
          <button className="us-add-btn" onClick={openAddModal}>
            <Plus size={18} />
            Add User
          </button>
        </div>

        {/* Search */}
        <div className="us-toolbar">
          <div className="us-search-wrap">
            <Search size={16} className="us-search-icon" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="us-search-input"
            />
          </div>
          <span className="us-count">{pagination.total} user{pagination.total !== 1 ? 's' : ''}</span>
        </div>

        {/* Users Table */}
        <div className="us-table-wrap">
          {loading ? (
            <div className="us-loading">
              <div className="us-spinner" />
              <p>Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="us-empty">
              <UsersIcon size={40} color="#ddd" />
              <p>No users found</p>
            </div>
          ) : (
            <table className="us-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Permissions</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div className="us-user-cell">
                        <div className="us-avatar">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="us-user-name">{user.name}</span>
                      </div>
                    </td>
                    <td className="us-email">{user.email}</td>
                    <td>{user.phone || '—'}</td>
                    <td>
                      <div className="us-perms">
                        {(user.permissions || []).length === 0 ? (
                          <span className="us-no-perms">No permissions</span>
                        ) : (user.permissions || []).length === Object.keys(PERMISSION_LABELS).length ? (
                          <span className="us-perm-badge us-perm-all">
                            <Shield size={12} /> All Access
                          </span>
                        ) : (
                          (user.permissions || []).slice(0, 3).map(p => (
                            <span
                              key={p}
                              className="us-perm-badge"
                              style={{ background: `${PERMISSION_COLORS[p]}18`, color: PERMISSION_COLORS[p] }}
                            >
                              {PERMISSION_LABELS[p]}
                            </span>
                          ))
                        )}
                        {(user.permissions || []).length > 3 && (user.permissions || []).length < Object.keys(PERMISSION_LABELS).length && (
                          <span className="us-perm-more">+{user.permissions.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="us-date">
                      {new Date(user.created_at).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric'
                      })}
                    </td>
                    <td>
                      <div className="us-actions">
                        <button className="us-action-btn us-action-edit" onClick={() => openEditModal(user)}>
                          <Edit2 size={14} />
                        </button>
                        <button className="us-action-btn us-action-delete" onClick={() => setDeleteConfirm(user)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="us-pagination">
            <button
              className="us-page-btn"
              disabled={pagination.page === 1}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            >
              Previous
            </button>
            <span className="us-page-info">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              className="us-page-btn"
              disabled={pagination.page === pagination.pages}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            >
              Next
            </button>
          </div>
        )}

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="us-modal-overlay" onClick={closeModal}>
            <div className="us-modal" onClick={e => e.stopPropagation()}>
              <div className="us-modal-header">
                <h2 className="us-modal-title">
                  {modalMode === 'add' ? 'Add New User' : 'Edit User'}
                </h2>
                <button className="us-modal-close" onClick={closeModal}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="us-form">
                {error && (
                  <div className="us-form-error">
                    <AlertCircle size={16} />
                    {error}
                  </div>
                )}

                <div className="us-form-grid">
                  <div className="us-form-group">
                    <label className="us-form-label">Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="us-form-input"
                      placeholder="Enter name"
                    />
                  </div>
                  <div className="us-form-group">
                    <label className="us-form-label">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="us-form-input"
                      placeholder="Enter email"
                    />
                  </div>
                </div>

                <div className="us-form-grid">
                  <div className="us-form-group">
                    <label className="us-form-label">Phone</label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="us-form-input"
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div className="us-form-group">
                    <label className="us-form-label">
                      Password {modalMode === 'add' ? '*' : '(leave blank to keep current)'}
                    </label>
                    <div className="us-password-wrap">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="us-form-input"
                        placeholder={modalMode === 'add' ? 'Enter password' : 'New password (optional)'}
                      />
                      <button
                        type="button"
                        className="us-password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="us-form-group">
                  <div className="us-perms-header">
                    <label className="us-form-label">Permissions</label>
                    <div className="us-perms-actions">
                      <button type="button" className="us-perms-link" onClick={selectAllPermissions}>
                        Select All
                      </button>
                      <span className="us-perms-divider">|</span>
                      <button type="button" className="us-perms-link" onClick={clearAllPermissions}>
                        Clear All
                      </button>
                    </div>
                  </div>
                  <div className="us-perms-grid">
                    {Object.entries(PERMISSION_LABELS).map(([key, label]) => (
                      <label key={key} className="us-perm-check">
                        <input
                          type="checkbox"
                          checked={formData.permissions.includes(key)}
                          onChange={() => togglePermission(key)}
                        />
                        <span
                          className="us-perm-check-box"
                          style={{
                            borderColor: formData.permissions.includes(key) ? PERMISSION_COLORS[key] : '#ddd',
                            background: formData.permissions.includes(key) ? PERMISSION_COLORS[key] : 'transparent',
                          }}
                        >
                          {formData.permissions.includes(key) && <Check size={12} color="#fff" />}
                        </span>
                        <span className="us-perm-check-label">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="us-form-actions">
                  <button type="button" className="us-btn-cancel" onClick={closeModal}>
                    Cancel
                  </button>
                  <button type="submit" className="us-btn-submit" disabled={saving}>
                    {saving ? <span className="us-btn-spinner" /> : null}
                    {modalMode === 'add' ? 'Create User' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="us-modal-overlay" onClick={() => setDeleteConfirm(null)}>
            <div className="us-confirm-modal" onClick={e => e.stopPropagation()}>
              <div className="us-confirm-icon">
                <Trash2 size={24} color="#dc2626" />
              </div>
              <h3 className="us-confirm-title">Delete User</h3>
              <p className="us-confirm-text">
                Are you sure you want to delete <strong>{deleteConfirm.name}</strong>?
                This action cannot be undone.
              </p>
              <div className="us-confirm-actions">
                <button className="us-btn-cancel" onClick={() => setDeleteConfirm(null)}>
                  Cancel
                </button>
                <button
                  className="us-btn-delete"
                  onClick={() => handleDelete(deleteConfirm.id)}
                  disabled={deleting}
                >
                  {deleting ? <span className="us-btn-spinner" /> : null}
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

.us-root {
  font-family: 'DM Sans', sans-serif;
  padding: 32px 28px;
  width: 100%;
  min-height: 100vh;
  background: #f5f2ec;
}

/* Header */
.us-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 24px;
}
.us-header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}
.us-header-icon {
  width: 52px;
  height: 52px;
  background: #1a2e1a;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 20px rgba(26,46,26,0.28);
}
.us-title {
  font-family: 'Fraunces', serif;
  font-size: 26px;
  font-weight: 600;
  color: #1a2e1a;
  margin: 0 0 3px;
}
.us-sub {
  font-size: 13.5px;
  color: #999;
  margin: 0;
}
.us-add-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #2d5a27;
  color: #fff;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
}
.us-add-btn:hover {
  background: #1a2e1a;
  transform: translateY(-1px);
}

/* Toolbar */
.us-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}
.us-search-wrap {
  position: relative;
  flex: 1;
  max-width: 320px;
}
.us-search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #bbb;
}
.us-search-input {
  width: 100%;
  padding: 12px 14px 12px 40px;
  background: #fff;
  border: 1.5px solid #e8e4dc;
  border-radius: 12px;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  transition: border-color 0.2s;
}
.us-search-input:focus {
  outline: none;
  border-color: #2d5a27;
}
.us-count {
  font-size: 13px;
  color: #888;
}

/* Table */
.us-table-wrap {
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 4px 20px rgba(0,0,0,0.06);
  overflow: hidden;
}
.us-loading, .us-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  height: 300px;
  color: #bbb;
  font-size: 14px;
}
.us-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #e8e4dc;
  border-top-color: #2d5a27;
  border-radius: 50%;
  animation: usspin 0.7s linear infinite;
}
@keyframes usspin { to { transform: rotate(360deg); } }

.us-table {
  width: 100%;
  border-collapse: collapse;
}
.us-table th {
  padding: 16px 20px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  background: #faf9f6;
  border-bottom: 1px solid #f0ede6;
}
.us-table td {
  padding: 16px 20px;
  font-size: 14px;
  color: #333;
  border-bottom: 1px solid #f7f5f1;
}
.us-table tr:last-child td {
  border-bottom: none;
}
.us-table tr:hover td {
  background: #fdfcfa;
}

.us-user-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}
.us-avatar {
  width: 38px;
  height: 38px;
  background: linear-gradient(135deg, #2d5a27 0%, #4a7c42 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  flex-shrink: 0;
}
.us-user-name {
  font-weight: 500;
}
.us-email {
  color: #666;
}
.us-date {
  color: #888;
  font-size: 13px;
}

/* Permissions */
.us-perms {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}
.us-perm-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11.5px;
  font-weight: 500;
}
.us-perm-all {
  background: #f0faf0 !important;
  color: #2d5a27 !important;
}
.us-perm-more {
  font-size: 11px;
  color: #888;
  background: #f5f2ec;
  padding: 4px 8px;
  border-radius: 6px;
}
.us-no-perms {
  font-size: 12px;
  color: #bbb;
  font-style: italic;
}

/* Actions */
.us-actions {
  display: flex;
  gap: 8px;
}
.us-action-btn {
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
.us-action-edit {
  background: #f0f9ff;
  color: #0369a1;
}
.us-action-edit:hover {
  background: #e0f2fe;
  transform: scale(1.05);
}
.us-action-delete {
  background: #fef2f2;
  color: #dc2626;
}
.us-action-delete:hover {
  background: #fee2e2;
  transform: scale(1.05);
}

/* Pagination */
.us-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 24px;
}
.us-page-btn {
  padding: 10px 18px;
  background: #fff;
  border: 1.5px solid #e8e4dc;
  border-radius: 10px;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: #555;
  cursor: pointer;
  transition: all 0.2s;
}
.us-page-btn:hover:not(:disabled) {
  border-color: #2d5a27;
  color: #2d5a27;
}
.us-page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.us-page-info {
  font-size: 13px;
  color: #888;
}

/* Modal */
.us-modal-overlay {
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
.us-modal {
  background: #fff;
  border-radius: 24px;
  width: 100%;
  max-width: 560px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
}
.us-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 28px;
  border-bottom: 1px solid #f0ede6;
}
.us-modal-title {
  font-family: 'Fraunces', serif;
  font-size: 20px;
  font-weight: 600;
  color: #1a2e1a;
  margin: 0;
}
.us-modal-close {
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
.us-modal-close:hover {
  background: #ebe8e0;
}

/* Form */
.us-form {
  padding: 24px 28px;
}
.us-form-error {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  color: #dc2626;
  font-size: 13px;
  margin-bottom: 20px;
}
.us-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}
@media (max-width: 540px) {
  .us-form-grid { grid-template-columns: 1fr; }
}
.us-form-group {
  margin-bottom: 16px;
}
.us-form-label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #555;
  margin-bottom: 8px;
}
.us-form-input {
  width: 100%;
  padding: 12px 14px;
  background: #fff;
  border: 1.5px solid #e8e4dc;
  border-radius: 10px;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  transition: border-color 0.2s;
}
.us-form-input:focus {
  outline: none;
  border-color: #2d5a27;
}
.us-password-wrap {
  position: relative;
}
.us-password-wrap .us-form-input {
  padding-right: 44px;
}
.us-password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 4px;
}

/* Permissions form */
.us-perms-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.us-perms-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.us-perms-link {
  background: none;
  border: none;
  font-size: 12px;
  color: #2d5a27;
  cursor: pointer;
  text-decoration: underline;
}
.us-perms-divider {
  color: #ddd;
}
.us-perms-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
@media (max-width: 540px) {
  .us-perms-grid { grid-template-columns: repeat(2, 1fr); }
}
.us-perm-check {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}
.us-perm-check input {
  display: none;
}
.us-perm-check-box {
  width: 20px;
  height: 20px;
  border: 2px solid #ddd;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}
.us-perm-check-label {
  font-size: 13px;
  color: #555;
}

/* Form actions */
.us-form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #f0ede6;
}
.us-btn-cancel {
  padding: 12px 24px;
  background: #f5f2ec;
  border: none;
  border-radius: 12px;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: background 0.2s;
}
.us-btn-cancel:hover {
  background: #ebe8e0;
}
.us-btn-submit {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  background: #2d5a27;
  border: none;
  border-radius: 12px;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  transition: background 0.2s;
}
.us-btn-submit:hover:not(:disabled) {
  background: #1a2e1a;
}
.us-btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.us-btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: usspin 0.6s linear infinite;
}

/* Delete confirmation */
.us-confirm-modal {
  background: #fff;
  border-radius: 20px;
  padding: 32px;
  width: 100%;
  max-width: 380px;
  text-align: center;
}
.us-confirm-icon {
  width: 56px;
  height: 56px;
  background: #fef2f2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}
.us-confirm-title {
  font-family: 'Fraunces', serif;
  font-size: 18px;
  font-weight: 600;
  color: #1a2e1a;
  margin: 0 0 8px;
}
.us-confirm-text {
  font-size: 14px;
  color: #666;
  margin: 0 0 24px;
  line-height: 1.5;
}
.us-confirm-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}
.us-btn-delete {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #dc2626;
  border: none;
  border-radius: 12px;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  transition: background 0.2s;
}
.us-btn-delete:hover:not(:disabled) {
  background: #b91c1c;
}
.us-btn-delete:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
`;
