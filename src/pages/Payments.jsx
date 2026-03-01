import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { CreditCard, Search, ChevronLeft, ChevronRight, CheckCircle, Clock, XCircle, Phone, TrendingUp, DollarSign } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

const COLORS = ['#22c55e', '#f59e0b', '#ef4444'];

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#1a2e1a', borderRadius: 10, padding: '10px 14px',
      color: '#fff', fontSize: 13, boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
    }}>
      <p style={{ color: '#a3d977', marginBottom: 4, fontWeight: 500 }}>{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: '#e5e7eb' }}>
          {p.name}: <strong>{p.dataKey === 'amount' ? `$${p.value?.toLocaleString()}` : p.value}</strong>
        </p>
      ))}
    </div>
  );
};

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [period, setPeriod] = useState('30days');

  useEffect(() => { fetchPayments(); }, [page, statusFilter]);
  useEffect(() => { fetchAnalytics(); }, [period]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getPayments({ page, limit: 10, status: statusFilter });
      const payload = response.data || {};
      setPayments(Array.isArray(payload.data) ? payload.data : []);
      setTotalPages(payload.pagination?.pages || 1);
    } catch (err) {
      console.error('Failed to fetch payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await adminAPI.getPaymentAnalytics(period);
      setAnalytics(response.data?.data || null);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle size={14} color="#22c55e" />;
      case 'pending': return <Clock size={14} color="#f59e0b" />;
      case 'failed': return <XCircle size={14} color="#ef4444" />;
      default: return <Clock size={14} color="#888" />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'success': return 'py-status-success';
      case 'pending': return 'py-status-pending';
      case 'failed': return 'py-status-failed';
      default: return 'py-status-pending';
    }
  };

  const statusData = analytics ? [
    { name: 'Successful', value: analytics.summary?.successful || 0 },
    { name: 'Pending', value: analytics.summary?.pending || 0 },
    { name: 'Failed', value: analytics.summary?.failed || 0 },
  ] : [];

  const totalPayments = statusData.reduce((s, d) => s + d.value, 0);

  return (
    <>
      <style>{styles}</style>

      <div className="py-root">

        {/* Page header */}
        <div className="py-header">
          <div className="py-header-icon">
            <CreditCard size={22} color="#22c55e" />
          </div>
          <div>
            <h1 className="py-title">Payments</h1>
            <p className="py-sub">Monitor payment transactions and analytics</p>
          </div>
        </div>

        {/* Stats cards */}
        {analytics && (
          <div className="py-stats-grid">
            <div className="py-stat-card">
              <div className="py-stat-icon" style={{ background: '#f0fdf4' }}>
                <DollarSign size={18} color="#22c55e" />
              </div>
              <div>
                <p className="py-stat-label">Total Collected</p>
                <p className="py-stat-value" style={{ color: '#22c55e' }}>
                  ${parseFloat(analytics.summary?.totalCollected || 0).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="py-stat-card">
              <div className="py-stat-icon" style={{ background: '#fef3c7' }}>
                <TrendingUp size={18} color="#f59e0b" />
              </div>
              <div>
                <p className="py-stat-label">Success Rate</p>
                <p className="py-stat-value" style={{ color: '#f59e0b' }}>
                  {analytics.summary?.successRate || 0}%
                </p>
              </div>
            </div>
            <div className="py-stat-card">
              <div className="py-stat-icon" style={{ background: '#eff6ff' }}>
                <CreditCard size={18} color="#3b82f6" />
              </div>
              <div>
                <p className="py-stat-label">Total Payments</p>
                <p className="py-stat-value" style={{ color: '#3b82f6' }}>
                  {analytics.summary?.totalPayments || 0}
                </p>
              </div>
            </div>
            <div className="py-stat-card">
              <div className="py-stat-icon" style={{ background: '#faf5ff' }}>
                <DollarSign size={18} color="#a855f7" />
              </div>
              <div>
                <p className="py-stat-label">Avg. Payment</p>
                <p className="py-stat-value" style={{ color: '#a855f7' }}>
                  ${parseFloat(analytics.summary?.averagePayment || 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Charts row */}
        {analytics && (
          <div className="py-charts">
            {/* Area chart */}
            <div className="py-chart-card py-chart-main">
              <div className="py-chart-head">
                <h3 className="py-chart-title">Payment Volume</h3>
                <select
                  className="py-period-select"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                >
                  <option value="7days">Last 7 days</option>
                  <option value="30days">Last 30 days</option>
                  <option value="90days">Last 90 days</option>
                </select>
              </div>
              <div className="py-chart-wrap">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.chart || []} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                    <defs>
                      <linearGradient id="payGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.18} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0ede6" vertical={false} />
                    <XAxis
                      dataKey="date"
                      stroke="#c4bfb5"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis stroke="#c4bfb5" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area type="monotone" dataKey="amount" name="Amount" stroke="#22c55e" fill="url(#payGrad)" strokeWidth={2.5} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie chart */}
            <div className="py-chart-card py-chart-side">
              <div className="py-chart-head">
                <h3 className="py-chart-title">Status Breakdown</h3>
              </div>
              <div className="py-pie-wrap">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%" cy="50%"
                      innerRadius={50} outerRadius={70}
                      paddingAngle={4} dataKey="value"
                      strokeWidth={0}
                    >
                      {statusData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: '#1a2e1a', border: 'none', borderRadius: 10,
                        color: '#fff', fontSize: 13,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="py-pie-center">
                  <span className="py-pie-num">{totalPayments}</span>
                  <span className="py-pie-lbl">total</span>
                </div>
              </div>
              <div className="py-legend">
                {statusData.map((item, i) => (
                  <div className="py-legend-row" key={item.name}>
                    <span className="py-legend-dot" style={{ background: COLORS[i] }} />
                    <span className="py-legend-name">{item.name}</span>
                    <span className="py-legend-val">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Table card */}
        <div className="py-card">

          {/* Toolbar */}
          <div className="py-toolbar">
            <div className="py-filters">
              <select
                className="py-filter-select"
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              >
                <option value="">All Status</option>
                <option value="success">Successful</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <span className="py-count">
              {payments.length} payment{payments.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Table */}
          <div className="py-table-wrap">
            {loading ? (
              <div className="py-loading">
                <div className="py-spinner" />
                <p>Loading payments...</p>
              </div>
            ) : payments.length === 0 ? (
              <div className="py-empty">
                <CreditCard size={32} color="#c4bfb5" />
                <p>No payments found</p>
              </div>
            ) : (
              <table className="py-table">
                <thead>
                  <tr>
                    {['Reference', 'Amount', 'Provider', 'Phone', 'Order Type', 'Status', 'Date'].map(h => (
                      <th key={h} className="py-th">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {payments.map((row, i) => (
                    <tr key={row.id || i} className="py-tr">

                      {/* Reference */}
                      <td className="py-td">
                        <p className="py-cell-bold">{row.reference || '—'}</p>
                        {row.paystack_reference && (
                          <p className="py-cell-muted">{row.paystack_reference}</p>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="py-td">
                        <div className="py-amount">
                          <DollarSign size={13} color="#22c55e" />
                          <span>{parseFloat(row.amount || 0).toLocaleString()}</span>
                          <span className="py-currency">{row.currency || 'GHS'}</span>
                        </div>
                      </td>

                      {/* Provider */}
                      <td className="py-td">
                        <span className="py-provider">{row.provider?.toUpperCase() || '—'}</span>
                      </td>

                      {/* Phone */}
                      <td className="py-td">
                        <div className="py-phone">
                          <Phone size={13} color="#888" />
                          <span>{row.phone || '—'}</span>
                        </div>
                      </td>

                      {/* Order Type */}
                      <td className="py-td">
                        <span className="py-order-type">{row.order_type || 'farm'}</span>
                      </td>

                      {/* Status */}
                      <td className="py-td">
                        <span className={`py-status ${getStatusClass(row.status)}`}>
                          {getStatusIcon(row.status)}
                          {row.status || 'pending'}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-td">
                        <span className="py-cell-text">
                          {row.created_at
                            ? new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                            : '—'}
                        </span>
                        {row.verified_at && (
                          <p className="py-cell-muted">
                            Verified: {new Date(row.verified_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="py-pagination">
              <button
                className="py-page-btn"
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                <ChevronLeft size={15} /> Prev
              </button>

              <div className="py-page-pills">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                  .reduce((acc, n, idx, arr) => {
                    if (idx > 0 && n - arr[idx - 1] > 1) acc.push('...');
                    acc.push(n);
                    return acc;
                  }, [])
                  .map((item, idx) =>
                    item === '...'
                      ? <span key={`ellipsis-${idx}`} className="py-page-ellipsis">...</span>
                      : <button
                          key={item}
                          className={`py-page-num ${item === page ? 'py-page-active' : ''}`}
                          onClick={() => setPage(item)}
                        >{item}</button>
                  )}
              </div>

              <button
                className="py-page-btn"
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

.py-root {
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
.py-header {
  display: flex;
  align-items: center;
  gap: 16px;
}
.py-header-icon {
  width: 48px; height: 48px;
  background: #1a2e1a;
  border-radius: 15px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 6px 18px rgba(26,46,26,0.25);
}
.py-title {
  font-family: 'Fraunces', serif;
  font-size: 26px; font-weight: 600;
  color: #1a2e1a; margin: 0 0 3px;
}
.py-sub { font-size: 13.5px; color: #999; margin: 0; }

/* stats grid */
.py-stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}
@media (min-width: 1024px) {
  .py-stats-grid { grid-template-columns: repeat(4, 1fr); }
}

.py-stat-card {
  background: #fff;
  border-radius: 16px;
  padding: 18px 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.05);
}
.py-stat-icon {
  width: 44px; height: 44px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.py-stat-label { font-size: 12.5px; color: #999; margin: 0 0 4px; }
.py-stat-value {
  font-family: 'Fraunces', serif;
  font-size: 22px; font-weight: 600;
  margin: 0;
}

/* charts */
.py-charts {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}
@media (min-width: 1024px) {
  .py-charts { grid-template-columns: 2fr 1fr; }
}

.py-chart-card {
  background: #fff;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.05);
}
.py-chart-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.py-chart-title {
  font-family: 'Fraunces', serif;
  font-size: 17px; font-weight: 600;
  color: #1a2e1a; margin: 0;
}
.py-period-select {
  font-family: 'DM Sans', sans-serif;
  font-size: 12.5px;
  padding: 6px 12px;
  border: 1.5px solid #e8e4dc;
  border-radius: 8px;
  background: #f9f8f6;
  color: #555;
  cursor: pointer;
  outline: none;
}
.py-period-select:focus { border-color: #22c55e; }

.py-chart-wrap { height: 240px; }

/* pie */
.py-pie-wrap {
  height: 180px;
  position: relative;
}
.py-pie-center {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
}
.py-pie-num {
  display: block;
  font-family: 'Fraunces', serif;
  font-size: 22px; font-weight: 600; color: #1a2e1a; line-height: 1;
}
.py-pie-lbl { font-size: 11px; color: #aaa; margin-top: 2px; display: block; }

/* legend */
.py-legend { display: flex; flex-direction: column; gap: 8px; margin-top: 16px; }
.py-legend-row {
  display: flex; align-items: center; gap: 8px;
  font-size: 13px;
}
.py-legend-dot {
  width: 9px; height: 9px;
  border-radius: 50%; flex-shrink: 0;
}
.py-legend-name { color: #666; flex: 1; }
.py-legend-val { font-weight: 500; color: #333; }

/* card */
.py-card {
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 4px 20px rgba(0,0,0,0.06);
  overflow: hidden;
}

/* toolbar */
.py-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 24px;
  border-bottom: 1px solid #f0ede6;
  flex-wrap: wrap;
}
.py-filters { display: flex; gap: 10px; }
.py-filter-select {
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  padding: 8px 14px;
  border: 1.5px solid #e8e4dc;
  border-radius: 10px;
  background: #f9f8f6;
  color: #555;
  cursor: pointer;
  outline: none;
}
.py-filter-select:focus { border-color: #22c55e; }
.py-count { font-size: 12.5px; color: #bbb; white-space: nowrap; }

/* table */
.py-table-wrap { overflow-x: auto; }
.py-table { width: 100%; border-collapse: collapse; }

.py-th {
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

.py-tr {
  border-bottom: 1px solid #f7f5f1;
  transition: background 0.15s;
}
.py-tr:last-child { border-bottom: none; }
.py-tr:hover { background: #faf9f6; }

.py-td {
  padding: 14px 20px;
  vertical-align: middle;
}

.py-cell-text { font-size: 13.5px; color: #555; }
.py-cell-bold { font-size: 13.5px; font-weight: 500; color: #222; margin: 0 0 2px; }
.py-cell-muted { font-size: 12px; color: #aaa; margin: 0; }

/* amount */
.py-amount {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 600;
  color: #22c55e;
}
.py-currency {
  font-size: 11px;
  font-weight: 400;
  color: #aaa;
  margin-left: 2px;
}

/* provider */
.py-provider {
  font-size: 12px;
  font-weight: 600;
  color: #666;
  background: #f5f2ec;
  padding: 4px 10px;
  border-radius: 6px;
}

/* phone */
.py-phone {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  color: #555;
}

/* order type */
.py-order-type {
  font-size: 12px;
  color: #666;
  background: #f0f9ff;
  padding: 4px 10px;
  border-radius: 6px;
  text-transform: capitalize;
}

/* status */
.py-status {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border-radius: 99px;
  font-size: 12.5px;
  font-weight: 500;
  text-transform: capitalize;
}
.py-status-success { background: #f0fdf4; color: #22c55e; }
.py-status-pending { background: #fffbeb; color: #f59e0b; }
.py-status-failed { background: #fef2f2; color: #ef4444; }

/* loading / empty */
.py-loading, .py-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 64px 24px;
  color: #bbb;
  font-size: 14px;
}
.py-spinner {
  width: 36px; height: 36px;
  border: 2.5px solid #e8e4dc;
  border-top-color: #22c55e;
  border-radius: 50%;
  animation: pyspin 0.7s linear infinite;
}
@keyframes pyspin { to { transform: rotate(360deg); } }

/* pagination */
.py-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 18px 24px;
  border-top: 1px solid #f0ede6;
  flex-wrap: wrap;
}
.py-page-btn {
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
.py-page-btn:hover:not(:disabled) { background: #f0ede6; border-color: #d4cfc5; }
.py-page-btn:disabled { opacity: 0.35; cursor: not-allowed; }

.py-page-pills { display: flex; align-items: center; gap: 4px; }
.py-page-num {
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
.py-page-num:hover { background: #f5f2ec; }
.py-page-active {
  background: #22c55e !important;
  color: #fff !important;
  border-color: #22c55e !important;
}
.py-page-ellipsis { font-size: 13px; color: #bbb; padding: 0 4px; }
`;
