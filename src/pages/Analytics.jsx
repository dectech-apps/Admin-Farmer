import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import {
  DollarSign,
  TrendingUp,
  Leaf,
  ShoppingCart,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export default function Analytics() {
  const [period, setPeriod] = useState('30days');
  const [dailyData, setDailyData] = useState([]);
  const [topFarms, setTopFarms] = useState([]);
  const [stats, setStats] = useState(null);
  const [commissionRates, setCommissionRates] = useState({ platform: 15, farmer: 85 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [revenueRes, dashboardRes] = await Promise.all([
        adminAPI.getRevenueAnalytics(period),
        adminAPI.getDashboard(),
      ]);

      const analyticsData = revenueRes.data.data;
      setDailyData(analyticsData?.dailyRevenue?.map(item => ({
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: parseFloat(item.total) || 0,
        commission: parseFloat(item.platform_commission) || 0,
        orders: parseInt(item.order_count) || 0,
      })) || []);
      setTopFarms(analyticsData?.topFarms || []);
      setCommissionRates(analyticsData?.commissionRates || { platform: 15, farmer: 85 });

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
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
    },
    {
      label: 'Platform Commission',
      value: `$${(stats?.revenue?.platformCommission || 0).toLocaleString()}`,
      subLabel: `${commissionRates.platform}% of sales`,
      icon: TrendingUp,
      color: 'text-cyan-700',
      bgColor: 'bg-cyan-50',
    },
    {
      label: 'Farmer Earnings',
      value: `$${(stats?.revenue?.farmerEarnings || 0).toLocaleString()}`,
      subLabel: `${commissionRates.farmer}% of sales`,
      icon: Leaf,
      color: 'text-primary-700',
      bgColor: 'bg-primary-50',
    },
    {
      label: 'Total Orders',
      value: stats?.orders?.total || 0,
      subLabel: `${stats?.orders?.completed || 0} completed`,
      icon: ShoppingCart,
      color: 'text-amber-700',
      bgColor: 'bg-amber-50',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="page-content space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Revenue and commission insights</p>
        </div>

        {/* Period selector */}
        <div className="flex items-center gap-2 bg-white/70 rounded-xl border border-white/70 p-1 shadow-sm">
          {[
            { value: '7days', label: '7 Days' },
            { value: '30days', label: '30 Days' },
            { value: '90days', label: '90 Days' },
            { value: 'year', label: 'Year' },
          ].map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                period === p.value
                  ? 'bg-primary-600 text-white shadow-md shadow-primary-600/25'
                  : 'text-slate-600 hover:bg-slate-100/70'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="card p-6 animate-rise"
              style={{ animationDelay: `${index * 90}ms` }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-500 text-sm">{card.label}</p>
                  <p className={`text-2xl font-semibold mt-1 ${card.color}`}>
                    {card.value}
                  </p>
                  {card.subLabel && (
                    <p className="text-xs text-slate-400 mt-1">{card.subLabel}</p>
                  )}
                </div>
                <div className={`${card.bgColor} p-3 rounded-2xl ring-1 ring-slate-200/60`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Commission Rate Info */}
      <div className="bg-gradient-to-r from-primary-600 to-emerald-600 rounded-2xl p-6 text-white shadow-lg shadow-primary-600/20">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-2xl">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Platform Commission Rate</h3>
            <p className="text-white/80">
              Currently set to{' '}
              <span className="text-2xl font-bold text-white">
                {commissionRates.platform}%
              </span>{' '}
              of each order value
            </p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Revenue Trend
          </h3>
          <div className="h-80">
            {dailyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Total Revenue"
                    stroke="#0f766e"
                    fill="#ccfbf1"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">
                No revenue data for this period
              </div>
            )}
          </div>
        </div>

        {/* Commission Breakdown */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Commission Breakdown
          </h3>
          <div className="h-80">
            {dailyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="commission"
                    name="Platform Commission"
                    fill="#0891b2"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">
                No commission data for this period
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Farms */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Top Performing Farms
        </h3>
        {topFarms.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/80">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Rank</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Farm Name</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Orders</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topFarms.map((farm, index) => (
                  <tr key={farm.id} className="hover:bg-primary-50/40">
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-sm font-medium ${
                        index === 0 ? 'bg-amber-100 text-amber-700' :
                        index === 1 ? 'bg-slate-200 text-slate-700' :
                        index === 2 ? 'bg-orange-100 text-orange-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">{farm.name}</td>
                    <td className="px-4 py-3 text-slate-600">{farm.order_count}</td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-emerald-700">
                        ${parseFloat(farm.total_revenue || 0).toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            No farm data available for this period
          </div>
        )}
      </div>

      {/* Order Volume */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Order Volume
        </h3>
        <div className="h-64">
          {dailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip />
                <Bar
                  dataKey="orders"
                  name="Orders"
                  fill="#f59e0b"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500">
              No order data for this period
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
