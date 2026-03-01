import { useState, useEffect, useMemo } from 'react';
import { adminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Package, Leaf, UtensilsCrossed, ShoppingBag, TrendingUp, Search,
  ChevronLeft, ChevronRight, Eye, Edit2, Trash2, X, AlertCircle,
  CheckCircle, XCircle, DollarSign,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

export default function Products() {
  const { user } = useAuth();
  const isAdmin = !user?.permissions || user.permissions.length === 0;

  // Stats state
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Trends state
  const [trends, setTrends] = useState(null);
  const [trendsPeriod, setTrendsPeriod] = useState('30days');

  // Products list state
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // View modal state
  const [viewModal, setViewModal] = useState(false);
  const [viewProduct, setViewProduct] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  // Edit modal state
  const [editModal, setEditModal] = useState(false);
  const [editData, setEditData] = useState({ name: '', description: '', price: '', is_available: true, category: '' });
  const [editingProduct, setEditingProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const assetBase = useMemo(() => {
    const apiUrl = import.meta.env.VITE_API_URL || '';
    return apiUrl.replace(/\/api\/v1\/?$/, '') || '';
  }, []);

  const toAssetUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    return assetBase ? `${assetBase}${cleanUrl}` : cleanUrl;
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchTrends();
  }, [trendsPeriod]);

  useEffect(() => {
    fetchProducts();
  }, [page, search, typeFilter]);

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const response = await adminAPI.getProductsStats();
      setStats(response.data?.data || null);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchTrends = async () => {
    try {
      const response = await adminAPI.getProductsTrends(trendsPeriod);
      setTrends(response.data?.data || null);
    } catch (err) {
      console.error('Failed to fetch trends:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getProducts({ page, limit: 10, search, type: typeFilter });
      const payload = response.data || {};
      setProducts(Array.isArray(payload.data) ? payload.data : []);
      setTotalPages(payload.pagination?.pages || 1);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!trends) return [];

    const allDates = new Set([
      ...(trends.farm || []).map(t => t.date),
      ...(trends.restaurant || []).map(t => t.date),
      ...(trends.boutique || []).map(t => t.date),
    ]);

    const farmMap = {};
    const restMap = {};
    const boutiqueMap = {};
    (trends.farm || []).forEach(t => { farmMap[t.date] = t.count; });
    (trends.restaurant || []).forEach(t => { restMap[t.date] = t.count; });
    (trends.boutique || []).forEach(t => { boutiqueMap[t.date] = t.count; });

    return Array.from(allDates).sort().map(date => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      farm: farmMap[date] || 0,
      restaurant: restMap[date] || 0,
      boutique: boutiqueMap[date] || 0,
    }));
  }, [trends]);

  // View product details
  const openViewModal = async (product) => {
    setViewLoading(true);
    setViewModal(true);
    try {
      const response = await adminAPI.getProductDetails(product.id, product.type);
      setViewProduct(response.data?.data || null);
    } catch (err) {
      console.error('Failed to fetch product details:', err);
    } finally {
      setViewLoading(false);
    }
  };

  // Edit handlers
  const openEditModal = (product) => {
    setEditingProduct(product);
    setEditData({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      is_available: product.is_available !== false,
      category: product.category || '',
    });
    setEditError('');
    setEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setEditError('');
    try {
      await adminAPI.updateProduct(editingProduct.id, editingProduct.type, {
        ...editData,
        price: parseFloat(editData.price) || 0,
      });
      setEditModal(false);
      fetchProducts();
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  // Delete handlers
  const openDeleteModal = (product) => {
    setDeletingProduct(product);
    setDeleteModal(true);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await adminAPI.deleteProduct(deletingProduct.id, deletingProduct.type);
      setDeleteModal(false);
      fetchProducts();
      fetchStats();
    } catch (err) {
      console.error('Failed to delete product:', err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <style>{styles}</style>

      <div className="pr-root">
        {/* Header */}
        <div className="pr-header">
          <div className="pr-header-icon">
            <Package size={22} color="#a78bfa" />
          </div>
          <div>
            <h1 className="pr-title">Products</h1>
            <p className="pr-sub">Manage products from farms, restaurants, and boutiques</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="pr-stats-grid">
          {/* Farm Stats */}
          <div className="pr-stat-card pr-stat-farm">
            <div className="pr-stat-header">
              <div className="pr-stat-icon" style={{ background: '#ecfccb' }}>
                <Leaf size={18} color="#65a30d" />
              </div>
              <span className="pr-stat-label">Farm Products</span>
            </div>
            {statsLoading ? (
              <div className="pr-stat-loading">Loading...</div>
            ) : (
              <div className="pr-stat-body">
                <div className="pr-stat-main">
                  <span className="pr-stat-num">{stats?.farm?.total || 0}</span>
                  <span className="pr-stat-text">Total Products</span>
                </div>
                <div className="pr-stat-row">
                  <span className="pr-stat-pill pr-pill-green">
                    <CheckCircle size={12} /> {stats?.farm?.available || 0} Available
                  </span>
                  <span className="pr-stat-pill pr-pill-grey">
                    <XCircle size={12} /> {stats?.farm?.unavailable || 0} Unavailable
                  </span>
                </div>
                <div className="pr-stat-avg">
                  <DollarSign size={14} />
                  Avg Price: ${(stats?.farm?.avgPrice || 0).toFixed(2)}
                </div>
              </div>
            )}
          </div>

          {/* Restaurant Stats */}
          <div className="pr-stat-card pr-stat-restaurant">
            <div className="pr-stat-header">
              <div className="pr-stat-icon" style={{ background: '#fef3c7' }}>
                <UtensilsCrossed size={18} color="#d97706" />
              </div>
              <span className="pr-stat-label">Restaurant Menu Items</span>
            </div>
            {statsLoading ? (
              <div className="pr-stat-loading">Loading...</div>
            ) : (
              <div className="pr-stat-body">
                <div className="pr-stat-main">
                  <span className="pr-stat-num">{stats?.restaurant?.total || 0}</span>
                  <span className="pr-stat-text">Total Items</span>
                </div>
                <div className="pr-stat-row">
                  <span className="pr-stat-pill pr-pill-green">
                    <CheckCircle size={12} /> {stats?.restaurant?.available || 0} Available
                  </span>
                  <span className="pr-stat-pill pr-pill-grey">
                    <XCircle size={12} /> {stats?.restaurant?.unavailable || 0} Unavailable
                  </span>
                </div>
                <div className="pr-stat-avg">
                  <DollarSign size={14} />
                  Avg Price: ${(stats?.restaurant?.avgPrice || 0).toFixed(2)}
                </div>
              </div>
            )}
          </div>

          {/* Boutique Stats */}
          <div className="pr-stat-card pr-stat-boutique">
            <div className="pr-stat-header">
              <div className="pr-stat-icon" style={{ background: '#f3e8ff' }}>
                <ShoppingBag size={18} color="#8b5cf6" />
              </div>
              <span className="pr-stat-label">Boutique Products</span>
            </div>
            {statsLoading ? (
              <div className="pr-stat-loading">Loading...</div>
            ) : (
              <div className="pr-stat-body">
                <div className="pr-stat-main">
                  <span className="pr-stat-num">{stats?.boutique?.total || 0}</span>
                  <span className="pr-stat-text">Total Products</span>
                </div>
                <div className="pr-stat-row">
                  <span className="pr-stat-pill pr-pill-green">
                    <CheckCircle size={12} /> {stats?.boutique?.available || 0} Available
                  </span>
                  <span className="pr-stat-pill pr-pill-grey">
                    <XCircle size={12} /> {stats?.boutique?.unavailable || 0} Unavailable
                  </span>
                </div>
                <div className="pr-stat-avg">
                  <DollarSign size={14} />
                  Avg Price: ${(stats?.boutique?.avgPrice || 0).toFixed(2)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Charts Section */}
        <div className="pr-chart-card">
          <div className="pr-chart-header">
            <div className="pr-chart-title-wrap">
              <TrendingUp size={18} color="#7c3aed" />
              <h2 className="pr-chart-title">Products Trend</h2>
            </div>
            <select
              className="pr-period-select"
              value={trendsPeriod}
              onChange={(e) => setTrendsPeriod(e.target.value)}
            >
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
              <option value="90days">Last 90 days</option>
            </select>
          </div>

          <div className="pr-chart-wrap">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="farmGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#65a30d" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#65a30d" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="restGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d97706" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="boutiqueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0ede6" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#999' }} tickLine={false} axisLine={{ stroke: '#e8e4dc' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#999' }} tickLine={false} axisLine={{ stroke: '#e8e4dc' }} />
                  <Tooltip
                    contentStyle={{ background: '#fff', border: '1px solid #e8e4dc', borderRadius: 10, fontSize: 13 }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="farm"
                    name="Farm Products"
                    stroke="#65a30d"
                    strokeWidth={2.5}
                    dot={{ fill: '#65a30d', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="restaurant"
                    name="Restaurant Items"
                    stroke="#d97706"
                    strokeWidth={2.5}
                    dot={{ fill: '#d97706', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="boutique"
                    name="Boutique Products"
                    stroke="#8b5cf6"
                    strokeWidth={2.5}
                    dot={{ fill: '#8b5cf6', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="pr-chart-empty">
                <Package size={32} color="#ddd" />
                <p>No trend data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Products List */}
        <div className="pr-card">
          <div className="pr-toolbar">
            <div className="pr-toolbar-left">
              <div className="pr-search-wrap">
                <Search size={15} className="pr-search-icon" />
                <input
                  className="pr-search"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
              </div>
              <select
                className="pr-filter-select"
                value={typeFilter}
                onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
              >
                <option value="">All Products</option>
                <option value="farm">Farm Products</option>
                <option value="restaurant">Restaurant Items</option>
                <option value="boutique">Boutique Products</option>
              </select>
            </div>
            <span className="pr-count">{products.length} result{products.length !== 1 ? 's' : ''}</span>
          </div>

          <div className="pr-table-wrap">
            {loading ? (
              <div className="pr-state">
                <div className="pr-spinner" />
                <p>Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="pr-state">
                <Package size={32} color="#c4bfb5" />
                <p>No products found</p>
              </div>
            ) : (
              <table className="pr-table">
                <thead>
                  <tr>
                    {['Product', 'Type', 'Source', 'Price', 'Status', 'Created', 'Actions'].map(h => (
                      <th key={h} className="pr-th">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map((row, i) => (
                    <tr key={`${row.type}-${row.id}` || i} className="pr-tr">
                      <td className="pr-td">
                        <div className="pr-product-cell">
                          {row.image_url ? (
                            <img
                              src={toAssetUrl(row.image_url)}
                              alt={row.name}
                              className="pr-product-img"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          ) : (
                            <div className="pr-product-placeholder">
                              {row.type === 'farm' ? <Leaf size={16} color="#65a30d" /> :
                               row.type === 'boutique' ? <ShoppingBag size={16} color="#8b5cf6" /> :
                               <UtensilsCrossed size={16} color="#d97706" />}
                            </div>
                          )}
                          <div>
                            <p className="pr-product-name">{row.name || '—'}</p>
                            <p className="pr-product-cat">{row.category || 'Uncategorized'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="pr-td">
                        <span className={`pr-type-badge ${row.type === 'farm' ? 'pr-type-farm' : row.type === 'boutique' ? 'pr-type-boutique' : 'pr-type-restaurant'}`}>
                          {row.type === 'farm' ? <Leaf size={12} /> : row.type === 'boutique' ? <ShoppingBag size={12} /> : <UtensilsCrossed size={12} />}
                          {row.type === 'farm' ? 'Farm' : row.type === 'boutique' ? 'Boutique' : 'Restaurant'}
                        </span>
                      </td>
                      <td className="pr-td">
                        <span className="pr-source">{row.source_name || '—'}</span>
                      </td>
                      <td className="pr-td">
                        <span className="pr-price">${parseFloat(row.price || 0).toFixed(2)}</span>
                        {row.unit && row.unit !== 'item' && <span className="pr-unit">/{row.unit}</span>}
                      </td>
                      <td className="pr-td">
                        <span className={`pr-status ${row.is_available ? 'pr-status-on' : 'pr-status-off'}`}>
                          {row.is_available ? <><CheckCircle size={12} /> Available</> : <><XCircle size={12} /> Unavailable</>}
                        </span>
                      </td>
                      <td className="pr-td">
                        <span className="pr-date">
                          {row.created_at ? new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                        </span>
                      </td>
                      <td className="pr-td">
                        <div className="pr-actions">
                          <button className="pr-action-btn pr-action-view" onClick={() => openViewModal(row)} title="View details">
                            <Eye size={14} />
                          </button>
                          {isAdmin && (
                            <>
                              <button className="pr-action-btn pr-action-edit" onClick={() => openEditModal(row)} title="Edit">
                                <Edit2 size={14} />
                              </button>
                              <button className="pr-action-btn pr-action-delete" onClick={() => openDeleteModal(row)} title="Delete">
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
            <div className="pr-pagination">
              <button className="pr-page-btn" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
                <ChevronLeft size={15} /> Prev
              </button>
              <div className="pr-page-pills">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                  .reduce((acc, n, idx, arr) => {
                    if (idx > 0 && n - arr[idx - 1] > 1) acc.push('…');
                    acc.push(n);
                    return acc;
                  }, [])
                  .map((item, idx) =>
                    item === '…'
                      ? <span key={`e-${idx}`} className="pr-page-ellipsis">…</span>
                      : <button key={item} className={`pr-page-num ${item === page ? 'pr-page-active' : ''}`} onClick={() => setPage(item)}>{item}</button>
                  )}
              </div>
              <button className="pr-page-btn" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
                Next <ChevronRight size={15} />
              </button>
            </div>
          )}
        </div>

        {/* View Modal */}
        {viewModal && (
          <div className="pr-modal-overlay" onClick={() => setViewModal(false)}>
            <div className="pr-modal pr-modal-view" onClick={e => e.stopPropagation()}>
              <div className="pr-modal-header">
                <h2 className="pr-modal-title">Product Details</h2>
                <button className="pr-modal-close" onClick={() => setViewModal(false)}>
                  <X size={18} />
                </button>
              </div>
              <div className="pr-modal-body">
                {viewLoading ? (
                  <div className="pr-modal-loading">Loading...</div>
                ) : viewProduct ? (
                  <div className="pr-view-content">
                    {viewProduct.image_url && (
                      <img src={toAssetUrl(viewProduct.image_url)} alt={viewProduct.name} className="pr-view-img" />
                    )}
                    <h3 className="pr-view-name">{viewProduct.name}</h3>
                    <p className="pr-view-desc">{viewProduct.description || 'No description'}</p>

                    <div className="pr-view-grid">
                      <div className="pr-view-item">
                        <span className="pr-view-label">Type</span>
                        <span className={`pr-type-badge ${viewProduct.type === 'farm' ? 'pr-type-farm' : viewProduct.type === 'boutique' ? 'pr-type-boutique' : 'pr-type-restaurant'}`}>
                          {viewProduct.type === 'farm' ? 'Farm Product' : viewProduct.type === 'boutique' ? 'Boutique Product' : 'Restaurant Item'}
                        </span>
                      </div>
                      <div className="pr-view-item">
                        <span className="pr-view-label">Price</span>
                        <span className="pr-view-value">${parseFloat(viewProduct.price || 0).toFixed(2)}</span>
                      </div>
                      <div className="pr-view-item">
                        <span className="pr-view-label">Category</span>
                        <span className="pr-view-value">{viewProduct.category || 'Uncategorized'}</span>
                      </div>
                      <div className="pr-view-item">
                        <span className="pr-view-label">Status</span>
                        <span className={`pr-status ${viewProduct.is_available ? 'pr-status-on' : 'pr-status-off'}`}>
                          {viewProduct.is_available ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                      <div className="pr-view-item">
                        <span className="pr-view-label">Source</span>
                        <span className="pr-view-value">{viewProduct.farm_name || viewProduct.restaurant_name || viewProduct.boutique_name || '—'}</span>
                      </div>
                      <div className="pr-view-item">
                        <span className="pr-view-label">Owner</span>
                        <span className="pr-view-value">{viewProduct.owner_name || '—'}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p>Product not found</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editModal && (
          <div className="pr-modal-overlay" onClick={() => setEditModal(false)}>
            <div className="pr-modal" onClick={e => e.stopPropagation()}>
              <div className="pr-modal-header">
                <h2 className="pr-modal-title">Edit Product</h2>
                <button className="pr-modal-close" onClick={() => setEditModal(false)}>
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleEditSubmit} className="pr-modal-body">
                {editError && (
                  <div className="pr-error">
                    <AlertCircle size={16} />
                    {editError}
                  </div>
                )}

                <div className="pr-form-group">
                  <label className="pr-label">Name</label>
                  <input
                    type="text"
                    className="pr-input"
                    value={editData.name}
                    onChange={e => setEditData({ ...editData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="pr-form-group">
                  <label className="pr-label">Description</label>
                  <textarea
                    className="pr-textarea"
                    value={editData.description}
                    onChange={e => setEditData({ ...editData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="pr-form-row">
                  <div className="pr-form-group">
                    <label className="pr-label">Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="pr-input"
                      value={editData.price}
                      onChange={e => setEditData({ ...editData, price: e.target.value })}
                      required
                    />
                  </div>
                  <div className="pr-form-group">
                    <label className="pr-label">Category</label>
                    <input
                      type="text"
                      className="pr-input"
                      value={editData.category}
                      onChange={e => setEditData({ ...editData, category: e.target.value })}
                    />
                  </div>
                </div>

                <div className="pr-form-group">
                  <label className="pr-checkbox-label">
                    <input
                      type="checkbox"
                      checked={editData.is_available}
                      onChange={e => setEditData({ ...editData, is_available: e.target.checked })}
                    />
                    <span>Available for purchase</span>
                  </label>
                </div>

                <div className="pr-modal-actions">
                  <button type="button" className="pr-btn pr-btn-cancel" onClick={() => setEditModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="pr-btn pr-btn-save" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {deleteModal && (
          <div className="pr-modal-overlay" onClick={() => setDeleteModal(false)}>
            <div className="pr-modal pr-modal-delete" onClick={e => e.stopPropagation()}>
              <div className="pr-delete-icon">
                <AlertCircle size={32} color="#dc2626" />
              </div>
              <h2 className="pr-delete-title">Delete Product</h2>
              <p className="pr-delete-text">
                Are you sure you want to delete <strong>{deletingProduct?.name}</strong>? This action cannot be undone.
              </p>
              <div className="pr-modal-actions">
                <button className="pr-btn pr-btn-cancel" onClick={() => setDeleteModal(false)}>
                  Cancel
                </button>
                <button className="pr-btn pr-btn-delete" onClick={handleDelete} disabled={deleting}>
                  {deleting ? 'Deleting...' : 'Delete Product'}
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

.pr-root {
  font-family: 'DM Sans', sans-serif;
  padding: 32px 28px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-height: 100vh;
  background: #f5f2ec;
}

/* Header */
.pr-header { display: flex; align-items: center; gap: 16px; }
.pr-header-icon {
  width: 48px; height: 48px;
  background: #0c2340;
  border-radius: 15px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 6px 18px rgba(12,35,64,0.28);
}
.pr-title {
  font-family: 'Fraunces', serif;
  font-size: 26px; font-weight: 600;
  color: #1a2e1a; margin: 0 0 3px;
}
.pr-sub { font-size: 13.5px; color: #999; margin: 0; }

/* Stats Grid */
.pr-stats-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}
@media (min-width: 768px) { .pr-stats-grid { grid-template-columns: 1fr 1fr; } }
@media (min-width: 1024px) { .pr-stats-grid { grid-template-columns: 1fr 1fr 1fr; } }

.pr-stat-card {
  background: #fff;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 4px 20px rgba(0,0,0,0.06);
}
.pr-stat-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}
.pr-stat-icon {
  width: 40px; height: 40px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
}
.pr-stat-label {
  font-size: 14px;
  font-weight: 500;
  color: #555;
}
.pr-stat-body { display: flex; flex-direction: column; gap: 12px; }
.pr-stat-main { display: flex; align-items: baseline; gap: 8px; }
.pr-stat-num {
  font-family: 'Fraunces', serif;
  font-size: 36px;
  font-weight: 600;
  color: #1a1a1a;
}
.pr-stat-text { font-size: 14px; color: #888; }
.pr-stat-row { display: flex; gap: 10px; flex-wrap: wrap; }
.pr-stat-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 99px;
  font-size: 12px;
  font-weight: 500;
}
.pr-pill-green { background: #f0fdf4; color: #22c55e; }
.pr-pill-grey { background: #f5f2ec; color: #888; }
.pr-stat-avg {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #666;
  padding-top: 8px;
  border-top: 1px solid #f0ede6;
}
.pr-stat-loading { color: #999; font-size: 14px; }

/* Chart Card */
.pr-chart-card {
  background: #fff;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 4px 20px rgba(0,0,0,0.06);
}
.pr-chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}
.pr-chart-title-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}
.pr-chart-title {
  font-family: 'Fraunces', serif;
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}
.pr-period-select {
  padding: 8px 14px;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  border: 1.5px solid #e8e4dc;
  border-radius: 10px;
  background: #faf9f6;
  color: #555;
  cursor: pointer;
}
.pr-chart-wrap { min-height: 300px; }
.pr-chart-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: #bbb;
  gap: 12px;
}

/* Card */
.pr-card {
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 4px 20px rgba(0,0,0,0.06);
  overflow: hidden;
}

/* Toolbar */
.pr-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 24px;
  border-bottom: 1px solid #f0ede6;
  flex-wrap: wrap;
}
.pr-toolbar-left { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.pr-search-wrap { position: relative; flex: 1; min-width: 200px; max-width: 300px; }
.pr-search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #bbb; pointer-events: none; }
.pr-search {
  width: 100%;
  padding: 9px 14px 9px 36px;
  font-family: 'DM Sans', sans-serif;
  font-size: 13.5px;
  background: #f9f8f6;
  border: 1.5px solid #e8e4dc;
  border-radius: 10px;
  outline: none;
  color: #222;
}
.pr-search:focus { border-color: #7c3aed; background: #fff; box-shadow: 0 0 0 3px rgba(124,58,237,0.08); }
.pr-filter-select {
  padding: 9px 14px;
  font-family: 'DM Sans', sans-serif;
  font-size: 13.5px;
  border: 1.5px solid #e8e4dc;
  border-radius: 10px;
  background: #f9f8f6;
  color: #555;
  cursor: pointer;
}
.pr-count { font-size: 12.5px; color: #bbb; white-space: nowrap; }

/* Table */
.pr-table-wrap { overflow-x: auto; }
.pr-table { width: 100%; border-collapse: collapse; }
.pr-th {
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
.pr-tr { border-bottom: 1px solid #f7f5f1; transition: background 0.15s; }
.pr-tr:last-child { border-bottom: none; }
.pr-tr:hover { background: #faf9f6; }
.pr-td { padding: 14px 20px; vertical-align: middle; }

/* Product Cell */
.pr-product-cell { display: flex; align-items: center; gap: 12px; }
.pr-product-img {
  width: 44px; height: 44px;
  border-radius: 10px;
  object-fit: cover;
  flex-shrink: 0;
}
.pr-product-placeholder {
  width: 44px; height: 44px;
  border-radius: 10px;
  background: #f5f2ec;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.pr-product-name { font-size: 14px; font-weight: 500; color: #1a1a1a; margin: 0 0 2px; }
.pr-product-cat { font-size: 12px; color: #aaa; margin: 0; }

/* Type Badge */
.pr-type-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
}
.pr-type-farm { background: #ecfccb; color: #65a30d; }
.pr-type-restaurant { background: #fef3c7; color: #d97706; }
.pr-type-boutique { background: #f3e8ff; color: #8b5cf6; }

.pr-source { font-size: 13.5px; color: #555; }
.pr-price { font-size: 15px; font-weight: 600; color: #1a1a1a; }
.pr-unit { font-size: 12px; color: #999; }
.pr-date { font-size: 13px; color: #888; }

/* Status */
.pr-status {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 11px;
  border-radius: 99px;
  font-size: 12.5px;
  font-weight: 500;
}
.pr-status-on { background: #e8f5e0; color: #2d5a27; }
.pr-status-off { background: #f5f2ec; color: #999; }

/* State */
.pr-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 64px 24px;
  color: #bbb;
  font-size: 14px;
}
.pr-spinner {
  width: 36px; height: 36px;
  border: 2.5px solid #e8e4dc;
  border-top-color: #7c3aed;
  border-radius: 50%;
  animation: prspin 0.7s linear infinite;
}
@keyframes prspin { to { transform: rotate(360deg); } }

/* Actions */
.pr-actions { display: flex; align-items: center; gap: 6px; }
.pr-action-btn {
  width: 32px; height: 32px;
  display: flex; align-items: center; justify-content: center;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
}
.pr-action-view { background: #f5f2ec; color: #666; }
.pr-action-view:hover { background: #e8e4dc; }
.pr-action-edit { background: #ede9fe; color: #7c3aed; }
.pr-action-edit:hover { background: #ddd6fe; }
.pr-action-delete { background: #fee2e2; color: #dc2626; }
.pr-action-delete:hover { background: #fecaca; }

/* Pagination */
.pr-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 18px 24px;
  border-top: 1px solid #f0ede6;
  flex-wrap: wrap;
}
.pr-page-btn {
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
.pr-page-btn:hover:not(:disabled) { background: #f0ede6; border-color: #d4cfc5; }
.pr-page-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.pr-page-pills { display: flex; align-items: center; gap: 4px; }
.pr-page-num {
  width: 34px; height: 34px;
  display: flex; align-items: center; justify-content: center;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: #666;
  background: transparent;
  border: 1.5px solid transparent;
  border-radius: 9px;
  cursor: pointer;
}
.pr-page-num:hover { background: #f5f2ec; }
.pr-page-active { background: #0c2340 !important; color: #fff !important; border-color: #0c2340 !important; }
.pr-page-ellipsis { font-size: 13px; color: #bbb; padding: 0 4px; }

/* Modal */
.pr-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}
.pr-modal {
  background: #fff;
  border-radius: 20px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px rgba(0,0,0,0.25);
}
.pr-modal-view { max-width: 540px; }
.pr-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #f0ede6;
}
.pr-modal-title {
  font-family: 'Fraunces', serif;
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}
.pr-modal-close {
  width: 36px; height: 36px;
  display: flex; align-items: center; justify-content: center;
  background: #f5f2ec;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  color: #666;
}
.pr-modal-close:hover { background: #e8e4dc; color: #333; }
.pr-modal-body { padding: 24px; }
.pr-modal-loading { text-align: center; padding: 40px; color: #999; }
.pr-modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

/* View Content */
.pr-view-content { display: flex; flex-direction: column; gap: 16px; }
.pr-view-img {
  width: 100%;
  max-height: 200px;
  object-fit: cover;
  border-radius: 12px;
}
.pr-view-name {
  font-family: 'Fraunces', serif;
  font-size: 22px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}
.pr-view-desc { font-size: 14px; color: #666; line-height: 1.5; margin: 0; }
.pr-view-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 8px;
}
.pr-view-item { display: flex; flex-direction: column; gap: 4px; }
.pr-view-label { font-size: 12px; color: #999; }
.pr-view-value { font-size: 14px; font-weight: 500; color: #333; }

/* Form */
.pr-form-group { margin-bottom: 16px; }
.pr-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.pr-label { display: block; font-size: 13px; font-weight: 500; color: #555; margin-bottom: 6px; }
.pr-input, .pr-textarea {
  width: 100%;
  padding: 10px 14px;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  border: 1.5px solid #e8e4dc;
  border-radius: 10px;
  background: #faf9f6;
  color: #222;
  outline: none;
}
.pr-input:focus, .pr-textarea:focus {
  border-color: #7c3aed;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(124,58,237,0.08);
}
.pr-textarea { resize: vertical; min-height: 80px; }
.pr-checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #555;
  cursor: pointer;
}
.pr-checkbox-label input { width: 18px; height: 18px; cursor: pointer; }
.pr-error {
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
.pr-btn {
  padding: 10px 20px;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 500;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s;
}
.pr-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.pr-btn-cancel { background: #f5f2ec; color: #666; }
.pr-btn-cancel:hover:not(:disabled) { background: #e8e4dc; }
.pr-btn-save { background: #7c3aed; color: #fff; }
.pr-btn-save:hover:not(:disabled) { background: #6d28d9; }
.pr-btn-delete { background: #dc2626; color: #fff; }
.pr-btn-delete:hover:not(:disabled) { background: #b91c1c; }

/* Delete Modal */
.pr-modal-delete {
  text-align: center;
  padding: 32px;
  max-width: 400px;
}
.pr-delete-icon {
  width: 64px; height: 64px;
  background: #fef2f2;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 16px;
}
.pr-delete-title {
  font-family: 'Fraunces', serif;
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 12px;
}
.pr-delete-text { font-size: 14px; color: #666; line-height: 1.5; margin: 0 0 24px; }
.pr-modal-delete .pr-modal-actions { justify-content: center; margin-top: 0; }
`;
