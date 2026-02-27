import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { Package, User, Truck, DollarSign, Clock, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

const STATUS_META = {
  pending:          { label: 'Pending',          bg: '#fef9ec', color: '#b45309',  dot: '#f59e0b' },
  confirmed:        { label: 'Confirmed',         bg: '#ecfeff', color: '#0e7490',  dot: '#06b6d4' },
  processing:       { label: 'Processing',        bg: '#eff6ff', color: '#1d4ed8',  dot: '#3b82f6' },
  ready_for_pickup: { label: 'Ready for Pickup',  bg: '#f0fdfa', color: '#0f766e',  dot: '#14b8a6' },
  picked_up:        { label: 'Picked Up',         bg: '#eff6ff', color: '#1e40af',  dot: '#6366f1' },
  in_transit:       { label: 'In Transit',        bg: '#fff7ed', color: '#c2410c',  dot: '#f97316' },
  delivered:        { label: 'Delivered',         bg: '#f0faf0', color: '#2d5a27',  dot: '#22c55e' },
  cancelled:        { label: 'Cancelled',         bg: '#fff1f2', color: '#be123c',  dot: '#f43f5e' },
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => { fetchOrders(); }, [page, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      const response = await adminAPI.getOrders(params);
      const result = response.data || {};
      setOrders(result.data || []);
      setTotalPages(result.pagination?.pages || 1);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const activeMeta = STATUS_META[statusFilter];

  return (
    <>
      <style>{styles}</style>

      <div className="or-root">

        {/* Header */}
        <div className="or-header">
          <div className="or-header-left">
            <div className="or-header-icon">
              <Package size={22} color="#a78bfa" />
            </div>
            <div>
              <h1 className="or-title">Orders</h1>
              <p className="or-sub">View and manage all customer orders</p>
            </div>
          </div>

          {/* Status filter */}
          <div className="or-filter-wrap">
            {activeMeta && (
              <span className="or-filter-dot" style={{ background: activeMeta.dot }} />
            )}
            <select
              className="or-filter"
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            >
              <option value="">All Statuses</option>
              {Object.entries(STATUS_META).map(([val, m]) => (
                <option key={val} value={val}>{m.label}</option>
              ))}
            </select>
            <ChevronDown size={14} className="or-filter-chevron" />
          </div>
        </div>

        {/* Table card */}
        <div className="or-card">
          <div className="or-table-wrap">
            {loading ? (
              <div className="or-state">
                <div className="or-spinner" />
                <p>Loading orders…</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="or-state">
                <Package size={32} color="#c4bfb5" />
                <p>No orders found</p>
              </div>
            ) : (
              <table className="or-table">
                <thead>
                  <tr>
                    {['Order ID', 'Customer', 'Farm', 'Total', 'Commission', 'Rider', 'Status', 'Date'].map(h => (
                      <th key={h} className="or-th">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map((row, i) => {
                    const meta = STATUS_META[row.customer_status] || { label: row.customer_status, bg: '#f5f2ec', color: '#888', dot: '#ccc' };
                    return (
                      <tr key={row.id || i} className="or-tr">

                        {/* Order ID */}
                        <td className="or-td">
                          <span className="or-id">#{String(row.id).slice(0, 8)}</span>
                        </td>

                        {/* Customer */}
                        <td className="or-td">
                          <div className="or-person">
                            <div className="or-person-icon or-customer-icon">
                              <User size={13} color="#7c3aed" />
                            </div>
                            <div>
                              <p className="or-person-name">{row.customer_name || 'Unknown'}</p>
                              {row.customer_email && (
                                <p className="or-person-sub">{row.customer_email}</p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Farm */}
                        <td className="or-td">
                          <span className="or-farm">{row.farm_name || '—'}</span>
                        </td>

                        {/* Total */}
                        <td className="or-td">
                          <span className="or-total">
                            <DollarSign size={13} />
                            {parseFloat(row.total_amount || 0).toLocaleString()}
                          </span>
                        </td>

                        {/* Commission */}
                        <td className="or-td">
                          <span className="or-commission">
                            ${parseFloat(row.platform_commission || 0).toFixed(2)}
                          </span>
                        </td>

                        {/* Rider */}
                        <td className="or-td">
                          <div className="or-person">
                            <div className={`or-person-icon ${row.rider_name ? 'or-rider-icon' : 'or-rider-empty'}`}>
                              <Truck size={13} color={row.rider_name ? '#0369a1' : '#c4bfb5'} />
                            </div>
                            <span className={row.rider_name ? 'or-person-name' : 'or-unassigned'}>
                              {row.rider_name || 'Unassigned'}
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="or-td">
                          <span
                            className="or-status"
                            style={{ background: meta.bg, color: meta.color }}
                          >
                            <span className="or-status-dot" style={{ background: meta.dot }} />
                            {meta.label}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="or-td">
                          <div className="or-date">
                            <Clock size={12} color="#c4bfb5" />
                            <span>
                              {row.created_at
                                ? new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                : '—'}
                            </span>
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
            <div className="or-pagination">
              <button
                className="or-page-btn"
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                <ChevronLeft size={15} /> Prev
              </button>

              <div className="or-page-pills">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                  .reduce((acc, n, idx, arr) => {
                    if (idx > 0 && n - arr[idx - 1] > 1) acc.push('…');
                    acc.push(n);
                    return acc;
                  }, [])
                  .map((item, idx) =>
                    item === '…'
                      ? <span key={`e-${idx}`} className="or-page-ellipsis">…</span>
                      : <button
                          key={item}
                          className={`or-page-num ${item === page ? 'or-page-active' : ''}`}
                          onClick={() => setPage(item)}
                        >{item}</button>
                  )}
              </div>

              <button
                className="or-page-btn"
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

.or-root {
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
.or-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}
.or-header-left { display: flex; align-items: center; gap: 16px; }
.or-header-icon {
  width: 48px; height: 48px;
  background: #2e1065;
  border-radius: 15px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 6px 18px rgba(46,16,101,0.28);
}
.or-title {
  font-family: 'Fraunces', serif;
  font-size: 26px; font-weight: 600;
  color: #1a2e1a; margin: 0 0 3px;
}
.or-sub { font-size: 13.5px; color: #999; margin: 0; }

/* filter */
.or-filter-wrap {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
}
.or-filter-dot {
  width: 8px; height: 8px;
  border-radius: 50%; flex-shrink: 0;
}
.or-filter {
  appearance: none;
  -webkit-appearance: none;
  padding: 9px 36px 9px 14px;
  font-family: 'DM Sans', sans-serif;
  font-size: 13.5px; font-weight: 500;
  color: #444;
  background: #fff;
  border: 1.5px solid #e8e4dc;
  border-radius: 10px;
  outline: none;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
  min-width: 160px;
}
.or-filter:focus {
  border-color: #7c3aed;
  box-shadow: 0 0 0 3px rgba(124,58,237,0.08);
}
.or-filter-chevron {
  position: absolute;
  right: 12px;
  color: #aaa;
  pointer-events: none;
}

/* card */
.or-card {
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 4px 20px rgba(0,0,0,0.06);
  overflow: hidden;
}

/* table */
.or-table-wrap { overflow-x: auto; }
.or-table { width: 100%; border-collapse: collapse; }
.or-th {
  padding: 11px 18px;
  text-align: left;
  font-size: 11.5px; font-weight: 500;
  color: #aaa;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  background: #faf9f6;
  border-bottom: 1px solid #f0ede6;
  white-space: nowrap;
}
.or-tr {
  border-bottom: 1px solid #f7f5f1;
  transition: background 0.15s;
}
.or-tr:last-child { border-bottom: none; }
.or-tr:hover { background: #fdfcf9; }
.or-td { padding: 13px 18px; vertical-align: middle; }

/* order id */
.or-id {
  font-family: 'Courier New', monospace;
  font-size: 12.5px;
  color: #888;
  background: #f5f2ec;
  padding: 3px 8px;
  border-radius: 6px;
  letter-spacing: 0.04em;
}

/* person cell */
.or-person { display: flex; align-items: center; gap: 9px; }
.or-person-icon {
  width: 28px; height: 28px;
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.or-customer-icon { background: #ede9fe; }
.or-rider-icon    { background: #e0f2fe; }
.or-rider-empty   { background: #f5f2ec; }
.or-person-name { font-size: 13.5px; font-weight: 500; color: #1a1a1a; margin: 0 0 1px; }
.or-person-sub  { font-size: 11.5px; color: #aaa; margin: 0; }
.or-unassigned  { font-size: 13px; color: #c4bfb5; font-style: italic; }

/* farm */
.or-farm { font-size: 13.5px; color: #555; }

/* total */
.or-total {
  display: inline-flex; align-items: center; gap: 3px;
  font-size: 13.5px; font-weight: 600;
  color: #2d5a27;
  background: #f0faf0;
  border-radius: 8px;
  padding: 4px 9px;
}

/* commission */
.or-commission {
  font-size: 13.5px; font-weight: 500;
  color: #0369a1;
  background: #f0f9ff;
  border-radius: 8px;
  padding: 4px 9px;
  display: inline-block;
}

/* status badge */
.or-status {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 5px 11px;
  border-radius: 99px;
  font-size: 12px; font-weight: 500;
  white-space: nowrap;
}
.or-status-dot {
  width: 6px; height: 6px;
  border-radius: 50%; flex-shrink: 0;
}

/* date */
.or-date {
  display: flex; align-items: center; gap: 5px;
  font-size: 12.5px; color: #999;
}

/* state */
.or-state {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 12px; padding: 64px 24px;
  color: #bbb; font-size: 14px;
}
.or-spinner {
  width: 36px; height: 36px;
  border: 2.5px solid #e8e4dc;
  border-top-color: #7c3aed;
  border-radius: 50%;
  animation: orspin 0.7s linear infinite;
}
@keyframes orspin { to { transform: rotate(360deg); } }

/* pagination */
.or-pagination {
  display: flex; align-items: center;
  justify-content: center; gap: 8px;
  padding: 18px 24px;
  border-top: 1px solid #f0ede6;
  flex-wrap: wrap;
}
.or-page-btn {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 7px 14px;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px; font-weight: 500;
  color: #555; background: #f9f8f6;
  border: 1.5px solid #e8e4dc;
  border-radius: 9px; cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}
.or-page-btn:hover:not(:disabled) { background: #f0ede6; border-color: #d4cfc5; }
.or-page-btn:disabled { opacity: 0.35; cursor: not-allowed; }

.or-page-pills { display: flex; align-items: center; gap: 4px; }
.or-page-num {
  width: 34px; height: 34px;
  display: flex; align-items: center; justify-content: center;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px; font-weight: 500;
  color: #666; background: transparent;
  border: 1.5px solid transparent;
  border-radius: 9px; cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.or-page-num:hover { background: #f5f2ec; }
.or-page-active {
  background: #2e1065 !important;
  color: #fff !important;
  border-color: #2e1065 !important;
}
.or-page-ellipsis { font-size: 13px; color: #bbb; padding: 0 4px; }
`;