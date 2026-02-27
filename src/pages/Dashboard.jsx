import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import {
  Users, Leaf, Truck, ShoppingCart,
  TrendingUp, DollarSign, AlertCircle, UtensilsCrossed, Receipt,
} from 'lucide-react';
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

const COLORS = ['#2d5a27', '#f59e0b', '#3b82f6', '#ef4444'];

/* ─── tiny custom tooltip ─── */
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
          {p.name}: <strong>${p.value?.toLocaleString()}</strong>
        </p>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardRes, revenueRes] = await Promise.all([
        adminAPI.getDashboard(),
        adminAPI.getRevenueAnalytics('30days'),
      ]);
      setStats(dashboardRes.data.data);
      const analyticsData = revenueRes.data.data;
      setRevenueData(
        analyticsData?.chart?.map(item => ({
          date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          revenue: parseFloat(item.revenue) || 0,
          commission: parseFloat(item.platformCommission) || 0,
          orders: parseInt(item.orders) || 0,
        })) || []
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <>
      <style>{dashStyles}</style>
      <div className="dash-loading">
        <div className="dash-spinner" />
      </div>
    </>
  );

  if (error) return (
    <>
      <style>{dashStyles}</style>
      <div className="dash-error">
        <AlertCircle size={18} />
        <p>{error}</p>
      </div>
    </>
  );

  const statCards = [
    { label: 'Total Farmers',     value: stats?.users?.farmers     || 0, icon: Leaf,             accent: '#2d5a27', bg: '#f0faf0' },
    { label: 'Total Restaurants', value: stats?.users?.restaurants || 0, icon: UtensilsCrossed,  accent: '#f59e0b', bg: '#fffbeb' },
    { label: 'Total Riders',      value: stats?.users?.riders      || 0, icon: Truck,            accent: '#0369a1', bg: '#f0f9ff' },
    { label: 'Total Customers',   value: stats?.users?.customers   || 0, icon: Users,            accent: '#7c3aed', bg: '#faf5ff' },
    { label: 'Total Orders',      value: stats?.orders?.total      || 0, icon: ShoppingCart,     accent: '#be185d', bg: '#fdf2f8' },
  ];

  const revenueCards = [
    { label: 'Total Revenue',        value: stats?.revenue?.total              || 0, icon: DollarSign,      accent: '#2d5a27' },
    { label: 'Platform Commission',  value: stats?.revenue?.platformCommission || 0, icon: TrendingUp,      accent: '#0369a1' },
    { label: 'Farm Revenue',         value: stats?.revenue?.farmRevenue        || 0, icon: Leaf,            accent: '#166534' },
    { label: 'Restaurant Revenue',   value: stats?.revenue?.restaurantRevenue  || 0, icon: UtensilsCrossed, accent: '#f59e0b' },
    { label: 'Farmer Earnings',      value: stats?.revenue?.farmerEarnings     || 0, icon: Leaf,            accent: '#b45309' },
    { label: 'Restaurant Earnings',  value: stats?.revenue?.restaurantEarnings || 0, icon: UtensilsCrossed, accent: '#ea580c' },
  ];

  const orderStatusData = [
    { name: 'Completed',  value: stats?.orders?.completed  || 0 },
    { name: 'Pending',    value: stats?.orders?.pending    || 0 },
    { name: 'Processing', value: stats?.orders?.processing || 0 },
    { name: 'Cancelled',  value: stats?.orders?.cancelled  || 0 },
  ];

  const totalOrders = orderStatusData.reduce((s, d) => s + d.value, 0);

  return (
    <>
      <style>{dashStyles}</style>

      <div className="dash-root">

        {/* Header */}
        <div className="dash-header">
          <div>
            <h1 className="dash-title">Dashboard</h1>
            <p className="dash-sub">Welcome back — here's what's happening today.</p>
          </div>
          <div className="dash-date">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
        </div>

        {/* Stat cards */}
        <div className="dash-grid-4">
          {statCards.map((s, i) => {
            const Icon = s.icon;
            return (
              <div className="dash-stat-card" key={s.label} style={{ animationDelay: `${i * 60}ms` }}>
                <div className="dash-stat-icon" style={{ background: s.bg }}>
                  <Icon size={20} color={s.accent} />
                </div>
                <p className="dash-stat-label">{s.label}</p>
                <p className="dash-stat-value" style={{ color: s.accent }}>{s.value.toLocaleString()}</p>
                <div className="dash-stat-bar" style={{ background: s.bg }}>
                  <div className="dash-stat-bar-fill" style={{ background: s.accent, width: '60%' }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Revenue cards */}
        <div className="dash-grid-3">
          {revenueCards.map((c, i) => {
            const Icon = c.icon;
            return (
              <div className="dash-rev-card" key={c.label} style={{ animationDelay: `${i * 70}ms` }}>
                <div className="dash-rev-top">
                  <div className="dash-rev-icon" style={{ background: c.accent + '18' }}>
                    <Icon size={16} color={c.accent} />
                  </div>
                  <span className="dash-rev-label">{c.label}</span>
                </div>
                <p className="dash-rev-value" style={{ color: c.accent }}>
                  ${c.value.toLocaleString()}
                </p>
              </div>
            );
          })}
        </div>

        {/* Charts row */}
        <div className="dash-charts">

          {/* Area chart */}
          <div className="dash-card dash-chart-main">
            <div className="dash-card-head">
              <h3 className="dash-card-title">Revenue Overview</h3>
              <span className="dash-badge">Last 30 days</span>
            </div>
            <div className="dash-chart-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#2d5a27" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#2d5a27" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="comGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#0369a1" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#0369a1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0ede6" vertical={false} />
                  <XAxis dataKey="date" stroke="#c4bfb5" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#c4bfb5" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="revenue"    name="Revenue"    stroke="#2d5a27" fill="url(#revGrad)" strokeWidth={2.5} dot={false} />
                  <Area type="monotone" dataKey="commission" name="Commission" stroke="#0369a1" fill="url(#comGrad)" strokeWidth={2}   dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie chart */}
          <div className="dash-card dash-chart-side">
            <div className="dash-card-head">
              <h3 className="dash-card-title">Order Status</h3>
              <span className="dash-badge">{totalOrders} total</span>
            </div>

            <div className="dash-pie-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%" cy="50%"
                    innerRadius={58} outerRadius={80}
                    paddingAngle={4} dataKey="value"
                    strokeWidth={0}
                  >
                    {orderStatusData.map((_, i) => (
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
              {/* centre label */}
              <div className="dash-pie-center">
                <span className="dash-pie-num">{totalOrders}</span>
                <span className="dash-pie-lbl">orders</span>
              </div>
            </div>

            <div className="dash-legend">
              {orderStatusData.map((item, i) => (
                <div className="dash-legend-row" key={item.name}>
                  <span className="dash-legend-dot" style={{ background: COLORS[i] }} />
                  <span className="dash-legend-name">{item.name}</span>
                  <span className="dash-legend-val">{item.value}</span>
                  <span className="dash-legend-pct">
                    {totalOrders ? Math.round(item.value / totalOrders * 100) : 0}%
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Platform Commission Chart */}
        <div className="dash-card">
          <div className="dash-card-head">
            <h3 className="dash-card-title">Platform Commission Trend</h3>
            <span className="dash-badge" style={{ background: '#f0f9ff', color: '#0369a1' }}>Last 30 days</span>
          </div>
          <div className="dash-commission-wrap">
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="commissionLineGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#0ea5e9" />
                      <stop offset="100%" stopColor="#0369a1" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0ede6" vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="#c4bfb5"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#c4bfb5"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      const commission = payload[0]?.value || 0;
                      return (
                        <div style={{
                          background: '#0c4a6e', borderRadius: 12, padding: '12px 16px',
                          color: '#fff', fontSize: 13, boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                        }}>
                          <p style={{ color: '#7dd3fc', marginBottom: 6, fontWeight: 500 }}>{label}</p>
                          <p style={{ color: '#fff', fontSize: 18, fontWeight: 600, margin: 0 }}>
                            ${commission.toLocaleString()}
                          </p>
                          <p style={{ color: '#bae6fd', fontSize: 11, marginTop: 4 }}>Platform Commission</p>
                        </div>
                      );
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="commission"
                    name="Commission"
                    stroke="url(#commissionLineGrad)"
                    strokeWidth={3}
                    dot={{ fill: '#0369a1', strokeWidth: 0, r: 4 }}
                    activeDot={{ fill: '#0ea5e9', strokeWidth: 3, stroke: '#fff', r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="dash-empty-chart">No commission data available</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── styles ─── */
const dashStyles = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,600&family=DM+Sans:wght@300;400;500&display=swap');

.dash-root {
  font-family: 'DM Sans', sans-serif;
  padding: 32px 28px;
  max-width: 1280px;
  display: flex;
  flex-direction: column;
  gap: 28px;
  background: #f5f2ec;
  min-height: 100vh;
}

/* loading / error */
.dash-loading {
  display: flex; align-items: center; justify-content: center;
  height: 280px;
}
.dash-spinner {
  width: 44px; height: 44px;
  border: 3px solid #e4e0d8;
  border-top-color: #2d5a27;
  border-radius: 50%;
  animation: dspin 0.7s linear infinite;
}
@keyframes dspin { to { transform: rotate(360deg); } }

.dash-error {
  display: flex; align-items: center; gap: 10px;
  background: #fff5f5; border: 1px solid #fecdd3;
  border-radius: 14px; padding: 16px 20px;
  color: #be123c; font-size: 14px;
}

/* header */
.dash-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}
.dash-title {
  font-family: 'Fraunces', serif;
  font-size: 28px;
  font-weight: 600;
  color: #1a2e1a;
  margin: 0 0 4px;
}
.dash-sub { font-size: 14px; color: #888; margin: 0; }
.dash-date {
  font-size: 13px; color: #aaa; font-weight: 300;
  white-space: nowrap;
}

/* grids */
.dash-grid-4 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}
@media (min-width: 768px) {
  .dash-grid-4 { grid-template-columns: repeat(3, 1fr); }
}
@media (min-width: 1024px) {
  .dash-grid-4 { grid-template-columns: repeat(5, 1fr); }
}

.dash-grid-3 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}
@media (min-width: 768px)  { .dash-grid-3 { grid-template-columns: repeat(3, 1fr); } }
@media (min-width: 1024px) { .dash-grid-3 { grid-template-columns: repeat(6, 1fr); } }

/* stat card */
.dash-stat-card {
  background: #fff;
  border-radius: 20px;
  padding: 22px 20px 18px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  gap: 10px;
  animation: dash-rise 0.4s cubic-bezier(0.22,1,0.36,1) both;
  transition: transform 0.2s, box-shadow 0.2s;
}
.dash-stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 28px rgba(0,0,0,0.1);
}
@keyframes dash-rise {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}

.dash-stat-icon {
  width: 42px; height: 42px;
  border-radius: 13px;
  display: flex; align-items: center; justify-content: center;
}
.dash-stat-label {
  font-size: 12.5px; color: #999; margin: 0;
  letter-spacing: 0.01em;
}
.dash-stat-value {
  font-family: 'Fraunces', serif;
  font-size: 30px; font-weight: 600;
  line-height: 1; margin: 0;
}
.dash-stat-bar {
  height: 4px; border-radius: 99px; overflow: hidden; margin-top: 4px;
}
.dash-stat-bar-fill {
  height: 100%; border-radius: 99px;
  opacity: 0.6;
}

/* revenue card */
.dash-rev-card {
  background: #fff;
  border-radius: 20px;
  padding: 20px 22px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.05);
  animation: dash-rise 0.4s cubic-bezier(0.22,1,0.36,1) both;
}
.dash-rev-top {
  display: flex; align-items: center; gap: 10px; margin-bottom: 12px;
}
.dash-rev-icon {
  width: 34px; height: 34px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.dash-rev-label { font-size: 13px; color: #888; }
.dash-rev-value {
  font-family: 'Fraunces', serif;
  font-size: 26px; font-weight: 600; margin: 0;
}

/* charts row */
.dash-charts {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}
@media (min-width: 1024px) {
  .dash-charts { grid-template-columns: 2fr 1fr; }
}

/* shared card */
.dash-card {
  background: #fff;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.05);
}
.dash-card-head {
  display: flex; align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.dash-card-title {
  font-family: 'Fraunces', serif;
  font-size: 17px; font-weight: 600; color: #1a2e1a; margin: 0;
}
.dash-badge {
  font-size: 11.5px; color: #888;
  background: #f5f2ec; border-radius: 99px;
  padding: 4px 10px;
}

/* area chart */
.dash-chart-wrap { height: 280px; }

/* commission chart */
.dash-commission-wrap { height: 240px; }
.dash-empty-chart {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c4bfb5;
  font-size: 14px;
}

/* pie */
.dash-pie-wrap {
  height: 200px;
  position: relative;
}
.dash-pie-center {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
}
.dash-pie-num {
  display: block;
  font-family: 'Fraunces', serif;
  font-size: 26px; font-weight: 600; color: #1a2e1a; line-height: 1;
}
.dash-pie-lbl { font-size: 11px; color: #aaa; margin-top: 2px; display: block; }

/* legend */
.dash-legend { display: flex; flex-direction: column; gap: 10px; margin-top: 20px; }
.dash-legend-row {
  display: flex; align-items: center; gap: 8px;
  font-size: 13px;
}
.dash-legend-dot {
  width: 9px; height: 9px;
  border-radius: 50%; flex-shrink: 0;
}
.dash-legend-name { color: #666; flex: 1; }
.dash-legend-val  { font-weight: 500; color: #333; min-width: 28px; text-align: right; }
.dash-legend-pct  { color: #aaa; font-size: 11.5px; min-width: 34px; text-align: right; }
`;