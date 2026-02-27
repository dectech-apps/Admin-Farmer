import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { DollarSign, TrendingUp, Leaf, ShoppingCart, UtensilsCrossed } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';

/* ── shared custom tooltip ── */
const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#1a2e1a', borderRadius: 10, padding: '10px 14px',
      color: '#fff', fontSize: 13, boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
    }}>
      <p style={{ color: '#a3d977', marginBottom: 6, fontWeight: 500 }}>{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: '#e5e7eb', marginBottom: 2 }}>
          {p.name}:{' '}
          <strong>{typeof p.value === 'number' && p.name !== 'Orders'
            ? `$${p.value.toLocaleString()}` : p.value}</strong>
        </p>
      ))}
    </div>
  );
};

const PERIODS = [
  { value: '7days',  label: '7D' },
  { value: '30days', label: '30D' },
  { value: '90days', label: '90D' },
  { value: 'year',   label: '1Y' },
];

const MEDALS = ['#f59e0b', '#94a3b8', '#ea7c2b'];

export default function Analytics() {
  const [period, setPeriod] = useState('30days');
  const [dailyData, setDailyData] = useState([]);
  const [topFarms, setTopFarms] = useState([]);
  const [topRestaurants, setTopRestaurants] = useState([]);
  const [stats, setStats] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [commissionRates, setCommissionRates] = useState({ platform: 15, farmer: 85 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAnalytics(); }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [revenueRes, dashboardRes] = await Promise.all([
        adminAPI.getRevenueAnalytics(period),
        adminAPI.getDashboard(),
      ]);
      const data = revenueRes.data.data;
      setAnalyticsData(data);
      setDailyData(data?.chart?.map(item => ({
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue:           parseFloat(item.revenue) || 0,
        farmRevenue:       parseFloat(item.farmRevenue) || 0,
        restaurantRevenue: parseFloat(item.restaurantRevenue) || 0,
        orders:            parseInt(item.orders) || 0,
        farmOrders:        parseInt(item.farmOrders) || 0,
        restaurantOrders:  parseInt(item.restaurantOrders) || 0,
      })) || []);
      setTopFarms(data?.topFarms || []);
      setTopRestaurants(data?.topRestaurants || []);
      setCommissionRates(dashboardRes.data.data?.commissionRates || { platform: 15, farmer: 85 });
      setStats(dashboardRes.data.data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const summaryCards = [
    {
      label: 'Total Revenue',
      value: `$${(stats?.revenue?.total || 0).toLocaleString()}`,
      icon: DollarSign,
      accent: '#2d5a27', bg: '#f0faf0',
    },
    {
      label: 'Farm Revenue',
      value: `$${(stats?.revenue?.farmRevenue || 0).toLocaleString()}`,
      sub: `${stats?.orders?.farmOrders || 0} orders`,
      icon: Leaf,
      accent: '#166534', bg: '#f0fdf4',
    },
    {
      label: 'Restaurant Revenue',
      value: `$${(stats?.revenue?.restaurantRevenue || 0).toLocaleString()}`,
      sub: `${stats?.orders?.restaurantOrders || 0} orders`,
      icon: UtensilsCrossed,
      accent: '#f59e0b', bg: '#fffbeb',
    },
    {
      label: 'Platform Commission',
      value: `$${(stats?.revenue?.platformCommission || 0).toLocaleString()}`,
      sub: `${commissionRates.platform}% of sales`,
      icon: TrendingUp,
      accent: '#0369a1', bg: '#f0f9ff',
    },
    {
      label: 'Farmer Earnings',
      value: `$${(stats?.revenue?.farmerEarnings || 0).toLocaleString()}`,
      icon: Leaf,
      accent: '#15803d', bg: '#f0fdf4',
    },
    {
      label: 'Restaurant Earnings',
      value: `$${(stats?.revenue?.restaurantEarnings || 0).toLocaleString()}`,
      icon: UtensilsCrossed,
      accent: '#ea580c', bg: '#fff7ed',
    },
  ];

  /* max revenue for farm/restaurant bars */
  const maxRevenue = Math.max(...topFarms.map(f => parseFloat(f.total_revenue || 0)), 1);
  const maxRestaurantRevenue = Math.max(...topRestaurants.map(r => parseFloat(r.total_revenue || 0)), 1);

  if (loading) return (
    <>
      <style>{styles}</style>
      <div className="an-state">
        <div className="an-spinner" />
        <p>Loading analytics…</p>
      </div>
    </>
  );

  return (
    <>
      <style>{styles}</style>

      <div className="an-root">

        {/* Header */}
        <div className="an-header">
          <div>
            <h1 className="an-title">Analytics</h1>
            <p className="an-sub">Revenue and commission insights</p>
          </div>

          {/* Period tabs */}
          <div className="an-period-wrap">
            {PERIODS.map(p => (
              <button
                key={p.value}
                className={`an-period-btn ${period === p.value ? 'an-period-active' : ''}`}
                onClick={() => setPeriod(p.value)}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Summary cards */}
        <div className="an-grid-6">
          {summaryCards.map((c, i) => {
            const Icon = c.icon;
            return (
              <div className="an-stat-card" key={c.label} style={{ animationDelay: `${i * 60}ms` }}>
                <div className="an-stat-icon" style={{ background: c.bg }}>
                  <Icon size={18} color={c.accent} />
                </div>
                <p className="an-stat-label">{c.label}</p>
                <p className="an-stat-value" style={{ color: c.accent }}>{c.value}</p>
                {c.sub && <p className="an-stat-sub">{c.sub}</p>}
              </div>
            );
          })}
        </div>

        {/* Commission banner */}
        <div className="an-banner">
          <div className="an-banner-icon">
            <TrendingUp size={22} color="#a3d977" />
          </div>
          <div className="an-banner-body">
            <p className="an-banner-title">Platform Commission Rate</p>
            <p className="an-banner-desc">
              Currently set to{' '}
              <strong className="an-banner-rate">{commissionRates.platform}%</strong>
              {' '}of each order value — farmers keep{' '}
              <strong className="an-banner-rate">{commissionRates.farmer}%</strong>
            </p>
          </div>
          <div className="an-banner-pill">{commissionRates.platform}% / {commissionRates.farmer}%</div>
        </div>

        {/* Commission Breakdown Pie Chart */}
        <div className="an-card">
          <div className="an-card-head">
            <h3 className="an-card-title">Commission Breakdown</h3>
            <span className="an-badge">By source</span>
          </div>
          <div className="an-pie-container">
            <div className="an-pie-wrap">
              {(() => {
                const farmComm = stats?.revenue?.farmCommission || 0;
                const restComm = stats?.revenue?.restaurantCommission || 0;
                const riderComm = stats?.revenue?.riderCommission || 0;
                const total = farmComm + restComm + riderComm;

                const pieData = [
                  { name: 'Farm Commission', value: farmComm, color: '#2d5a27' },
                  { name: 'Restaurant Commission', value: restComm, color: '#f59e0b' },
                  { name: 'Rider Commission', value: riderComm, color: '#0ea5e9' },
                ].filter(d => d.value > 0);

                if (total === 0) {
                  return (
                    <div className="an-empty-chart an-empty-chart-lg">
                      No commission data available
                    </div>
                  );
                }

                return (
                  <ResponsiveContainer width="100%" height={320}>
                    <PieChart margin={{ top: 30, right: 30, bottom: 30, left: 30 }}>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}
                        labelLine={{ stroke: '#999', strokeWidth: 1 }}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        contentStyle={{ background: '#1a2e1a', borderRadius: 10, border: 'none', color: '#fff', fontSize: 13 }}
                        itemStyle={{ color: '#e5e7eb' }}
                        labelStyle={{ color: '#a3d977', fontWeight: 500 }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value, entry) => (
                          <span style={{ color: '#555', fontSize: 13 }}>{value}</span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                );
              })()}
            </div>
            <div className="an-pie-legend">
              <div className="an-pie-legend-item">
                <div className="an-pie-dot" style={{ background: '#2d5a27' }} />
                <div>
                  <p className="an-pie-legend-label">Farm Commission</p>
                  <p className="an-pie-legend-value">${(stats?.revenue?.farmCommission || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
              </div>
              <div className="an-pie-legend-item">
                <div className="an-pie-dot" style={{ background: '#f59e0b' }} />
                <div>
                  <p className="an-pie-legend-label">Restaurant Commission</p>
                  <p className="an-pie-legend-value">${(stats?.revenue?.restaurantCommission || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
              </div>
              <div className="an-pie-legend-item">
                <div className="an-pie-dot" style={{ background: '#0ea5e9' }} />
                <div>
                  <p className="an-pie-legend-label">Rider Commission</p>
                  <p className="an-pie-legend-value">${(stats?.revenue?.riderCommission || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
              </div>
              <div className="an-pie-total">
                <p className="an-pie-total-label">Total Platform Commission</p>
                <p className="an-pie-total-value">${(stats?.revenue?.platformCommission || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue charts */}
        <div className="an-grid-2">
          <div className="an-card">
            <div className="an-card-head">
              <h3 className="an-card-title">Farm Revenue</h3>
              <span className="an-badge" style={{ background: '#f0fdf4', color: '#166534' }}>Farms</span>
            </div>
            <div className="an-chart-wrap">
              {dailyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                    <defs>
                      <linearGradient id="anFarmGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#2d5a27" stopOpacity={0.18} />
                        <stop offset="95%" stopColor="#2d5a27" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0ede6" vertical={false} />
                    <XAxis dataKey="date" stroke="#c4bfb5" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#c4bfb5" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip content={<ChartTip />} />
                    <Area type="monotone" dataKey="farmRevenue" name="Farm Revenue" stroke="#2d5a27" fill="url(#anFarmGrad)" strokeWidth={2.5} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : <div className="an-empty-chart">No farm revenue data for this period</div>}
            </div>
          </div>

          <div className="an-card">
            <div className="an-card-head">
              <h3 className="an-card-title">Restaurant Revenue</h3>
              <span className="an-badge" style={{ background: '#fffbeb', color: '#f59e0b' }}>Restaurants</span>
            </div>
            <div className="an-chart-wrap">
              {dailyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                    <defs>
                      <linearGradient id="anRestGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.18} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0ede6" vertical={false} />
                    <XAxis dataKey="date" stroke="#c4bfb5" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#c4bfb5" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip content={<ChartTip />} />
                    <Area type="monotone" dataKey="restaurantRevenue" name="Restaurant Revenue" stroke="#f59e0b" fill="url(#anRestGrad)" strokeWidth={2.5} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : <div className="an-empty-chart">No restaurant revenue data for this period</div>}
            </div>
          </div>
        </div>

        {/* Order volume */}
        <div className="an-card">
          <div className="an-card-head">
            <h3 className="an-card-title">Order Volume</h3>
            <span className="an-badge">Daily orders</span>
          </div>
          <div className="an-chart-wrap an-chart-sm">
            {dailyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0ede6" vertical={false} />
                  <XAxis dataKey="date" stroke="#c4bfb5" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#c4bfb5" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip content={<ChartTip />} />
                  <Bar dataKey="orders" name="Orders" fill="#b45309" radius={[5, 5, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="an-empty-chart">No order data for this period</div>}
          </div>
        </div>

        {/* Top farms */}
        <div className="an-card">
          <div className="an-card-head">
            <h3 className="an-card-title">Top Performing Farms</h3>
            <span className="an-badge">{topFarms.length} farms</span>
          </div>

          {topFarms.length > 0 ? (
            <div className="an-farms">
              {topFarms.map((farm, i) => {
                const rev = parseFloat(farm.total_revenue || 0);
                const pct = Math.round((rev / maxRevenue) * 100);
                const medal = MEDALS[i] || '#e5e7eb';
                return (
                  <div className="an-farm-row" key={farm.id}>
                    <div className="an-farm-rank" style={{ background: medal + '22', color: medal }}>
                      {i + 1}
                    </div>
                    <div className="an-farm-info">
                      <div className="an-farm-top">
                        <p className="an-farm-name">{farm.name}</p>
                        <div className="an-farm-meta">
                          <span className="an-farm-orders">{farm.order_count} orders</span>
                          <span className="an-farm-rev">${rev.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="an-farm-bar-bg">
                        <div className="an-farm-bar-fill" style={{ width: `${pct}%`, background: medal }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="an-empty-chart an-empty-chart-lg">No farm data available for this period</div>
          )}
        </div>

        {/* Top restaurants */}
        <div className="an-card">
          <div className="an-card-head">
            <h3 className="an-card-title">Top Performing Restaurants</h3>
            <span className="an-badge" style={{ background: '#fffbeb', color: '#f59e0b' }}>{topRestaurants.length} restaurants</span>
          </div>

          {topRestaurants.length > 0 ? (
            <div className="an-farms">
              {topRestaurants.map((restaurant, i) => {
                const rev = parseFloat(restaurant.total_revenue || 0);
                const pct = Math.round((rev / maxRestaurantRevenue) * 100);
                const medal = MEDALS[i] || '#e5e7eb';
                return (
                  <div className="an-farm-row" key={restaurant.id}>
                    <div className="an-farm-rank" style={{ background: medal + '22', color: medal }}>
                      {i + 1}
                    </div>
                    <div className="an-farm-info">
                      <div className="an-farm-top">
                        <p className="an-farm-name">{restaurant.name}</p>
                        <div className="an-farm-meta">
                          <span className="an-farm-orders">{restaurant.order_count} orders</span>
                          <span className="an-farm-rev" style={{ color: '#f59e0b' }}>${rev.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="an-farm-bar-bg">
                        <div className="an-farm-bar-fill" style={{ width: `${pct}%`, background: medal }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="an-empty-chart an-empty-chart-lg">No restaurant data available for this period</div>
          )}
        </div>

      </div>
    </>
  );
}

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,600&family=DM+Sans:wght@300;400;500&display=swap');

.an-root {
  font-family: 'DM Sans', sans-serif;
  padding: 32px 28px;
  max-width: 1280px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-height: 100vh;
  background: #f5f2ec;
}

/* loading */
.an-state {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 14px; height: 280px;
  color: #bbb; font-family: 'DM Sans', sans-serif; font-size: 14px;
}
.an-spinner {
  width: 40px; height: 40px;
  border: 3px solid #e8e4dc;
  border-top-color: #2d5a27;
  border-radius: 50%;
  animation: anspin 0.7s linear infinite;
}
@keyframes anspin { to { transform: rotate(360deg); } }

/* header */
.an-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}
.an-title {
  font-family: 'Fraunces', serif;
  font-size: 26px; font-weight: 600;
  color: #1a2e1a; margin: 0 0 3px;
}
.an-sub { font-size: 13.5px; color: #999; margin: 0; }

/* period tabs */
.an-period-wrap {
  display: flex;
  background: #fff;
  border: 1.5px solid #e8e4dc;
  border-radius: 12px;
  padding: 4px;
  gap: 2px;
}
.an-period-btn {
  padding: 7px 16px;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px; font-weight: 500;
  color: #888;
  background: transparent;
  border: none;
  border-radius: 9px;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.an-period-btn:hover { background: #f5f2ec; color: #444; }
.an-period-active {
  background: #1a2e1a !important;
  color: #fff !important;
}

/* grids */
.an-grid-4 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}
@media (min-width: 1024px) { .an-grid-4 { grid-template-columns: repeat(4, 1fr); } }

.an-grid-6 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}
@media (min-width: 768px) { .an-grid-6 { grid-template-columns: repeat(3, 1fr); } }
@media (min-width: 1280px) { .an-grid-6 { grid-template-columns: repeat(6, 1fr); } }

.an-grid-2 {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}
@media (min-width: 1024px) { .an-grid-2 { grid-template-columns: 1fr 1fr; } }

/* stat card */
.an-stat-card {
  background: #fff;
  border-radius: 20px;
  padding: 22px 20px 18px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.05);
  display: flex; flex-direction: column; gap: 8px;
  animation: an-rise 0.4s cubic-bezier(0.22,1,0.36,1) both;
  transition: transform 0.2s, box-shadow 0.2s;
}
.an-stat-card:hover { transform: translateY(-3px); box-shadow: 0 8px 28px rgba(0,0,0,0.1); }
@keyframes an-rise {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
.an-stat-icon {
  width: 40px; height: 40px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
}
.an-stat-label { font-size: 12.5px; color: #999; margin: 0; }
.an-stat-value {
  font-family: 'Fraunces', serif;
  font-size: 26px; font-weight: 600; line-height: 1; margin: 0;
}
.an-stat-sub { font-size: 11.5px; color: #bbb; margin: 0; }

/* banner */
.an-banner {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #1a2e1a;
  border-radius: 18px;
  padding: 20px 24px;
  box-shadow: 0 6px 24px rgba(26,46,26,0.22);
  flex-wrap: wrap;
}
.an-banner-icon {
  width: 46px; height: 46px;
  background: rgba(255,255,255,0.1);
  border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.an-banner-body { flex: 1; min-width: 180px; }
.an-banner-title {
  font-family: 'Fraunces', serif;
  font-size: 16px; font-weight: 600;
  color: #fff; margin: 0 0 4px;
}
.an-banner-desc { font-size: 13.5px; color: rgba(255,255,255,0.6); margin: 0; }
.an-banner-rate { color: #a3d977; }
.an-banner-pill {
  font-size: 13px; font-weight: 600;
  background: rgba(163,217,119,0.18);
  color: #a3d977;
  border: 1px solid rgba(163,217,119,0.25);
  border-radius: 99px;
  padding: 6px 16px;
  white-space: nowrap;
}

/* shared card */
.an-card {
  background: #fff;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 4px 20px rgba(0,0,0,0.06);
}
.an-card-head {
  display: flex; align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.an-card-title {
  font-family: 'Fraunces', serif;
  font-size: 17px; font-weight: 600;
  color: #1a2e1a; margin: 0;
}
.an-badge {
  font-size: 11.5px; color: #888;
  background: #f5f2ec; border-radius: 99px;
  padding: 4px 10px;
}
.an-chart-wrap { height: 280px; }
.an-chart-sm   { height: 200px; }
.an-empty-chart {
  height: 100%; display: flex;
  align-items: center; justify-content: center;
  color: #c4bfb5; font-size: 14px;
}
.an-empty-chart-lg { height: 120px; }

/* top farms */
.an-farms { display: flex; flex-direction: column; gap: 16px; }
.an-farm-row { display: flex; align-items: center; gap: 14px; }
.an-farm-rank {
  width: 32px; height: 32px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Fraunces', serif;
  font-size: 15px; font-weight: 600;
  flex-shrink: 0;
}
.an-farm-info { flex: 1; display: flex; flex-direction: column; gap: 6px; }
.an-farm-top {
  display: flex; align-items: center;
  justify-content: space-between; gap: 8px;
}
.an-farm-name { font-size: 14px; font-weight: 500; color: #1a1a1a; margin: 0; }
.an-farm-meta { display: flex; align-items: center; gap: 10px; }
.an-farm-orders { font-size: 12px; color: #bbb; }
.an-farm-rev { font-size: 14px; font-weight: 600; color: #2d5a27; }
.an-farm-bar-bg {
  height: 5px; background: #f0ede6;
  border-radius: 99px; overflow: hidden;
}
.an-farm-bar-fill {
  height: 100%; border-radius: 99px;
  transition: width 0.6s cubic-bezier(0.22,1,0.36,1);
  opacity: 0.75;
}

/* Pie chart styles */
.an-pie-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  align-items: center;
}
@media (min-width: 768px) {
  .an-pie-container { grid-template-columns: 1fr 1fr; }
}
.an-pie-wrap {
  min-height: 300px;
  padding-top: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.an-pie-legend {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.an-pie-legend-item {
  display: flex;
  align-items: center;
  gap: 12px;
}
.an-pie-dot {
  width: 14px;
  height: 14px;
  border-radius: 4px;
  flex-shrink: 0;
}
.an-pie-legend-label {
  font-size: 13px;
  color: #888;
  margin: 0 0 2px;
}
.an-pie-legend-value {
  font-family: 'Fraunces', serif;
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}
.an-pie-total {
  margin-top: 8px;
  padding-top: 16px;
  border-top: 1px solid #f0ede6;
}
.an-pie-total-label {
  font-size: 12px;
  color: #999;
  margin: 0 0 4px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.an-pie-total-value {
  font-family: 'Fraunces', serif;
  font-size: 24px;
  font-weight: 600;
  color: #2d5a27;
  margin: 0;
}
`;