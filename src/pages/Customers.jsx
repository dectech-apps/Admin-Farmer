import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { User, ShoppingBag, MapPin, DollarSign, Search, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');

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
                    {['Customer', 'Phone', 'Address', 'Orders', 'Total Spent', 'Joined'].map(h => (
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
    </>
  );
}

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,600&family=DM+Sans:wght@300;400;500&display=swap');

.cu-root {
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
`;