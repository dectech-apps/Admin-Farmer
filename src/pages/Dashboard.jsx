import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import {
  Users,
  Leaf,
  Truck,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Package,
  AlertCircle,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#0f766e', '#f59e0b', '#16a34a', '#ef4444'];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardRes, revenueRes] = await Promise.all([
        adminAPI.getDashboard(),
        adminAPI.getRevenueAnalytics('30days'),
      ]);
      setStats(dashboardRes.data.data);
      // Backend returns { dailyRevenue, topFarms, commissionRates }
      const analyticsData = revenueRes.data.data;
      setRevenueData(analyticsData?.dailyRevenue?.map(item => ({
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: parseFloat(item.total) || 0,
        commission: parseFloat(item.platform_commission) || 0,
        orders: parseInt(item.order_count) || 0,
      })) || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 text-red-700">
        <AlertCircle className="w-5 h-5" />
        <p>{error}</p>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Farmers',
      value: stats?.users?.farmers || 0,
      icon: Leaf,
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-50',
    },
    {
      label: 'Total Riders',
      value: stats?.users?.riders || 0,
      icon: Truck,
      color: 'bg-cyan-500',
      bgColor: 'bg-cyan-50',
    },
    {
      label: 'Total Customers',
      value: stats?.users?.customers || 0,
      icon: Users,
      color: 'bg-amber-500',
      bgColor: 'bg-amber-50',
    },
    {
      label: 'Total Orders',
      value: stats?.orders?.total || 0,
      icon: ShoppingCart,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
    },
  ];

  const revenueCards = [
    {
      label: 'Total Revenue',
      value: `$${(stats?.revenue?.total || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'text-emerald-700',
    },
    {
      label: 'Platform Commission',
      value: `$${(stats?.revenue?.platformCommission || 0).toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-cyan-700',
    },
    {
      label: 'Farmer Earnings',
      value: `$${(stats?.revenue?.farmerEarnings || 0).toLocaleString()}`,
      icon: Leaf,
      color: 'text-primary-700',
    },
  ];

  const orderStatusData = [
    { name: 'Completed', value: stats?.orders?.completed || 0 },
    { name: 'Pending', value: stats?.orders?.pending || 0 },
    { name: 'Processing', value: stats?.orders?.processing || 0 },
    { name: 'Cancelled', value: stats?.orders?.cancelled || 0 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Welcome back! Here's what's happening.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="card p-6 transition-transform duration-300 hover:-translate-y-1 animate-rise"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm">{stat.label}</p>
                  <p className="text-3xl font-semibold text-slate-900 mt-1">
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-2xl ring-1 ring-slate-200/60`}>
                  <Icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {revenueCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="card p-6 animate-rise"
              style={{ animationDelay: `${index * 90}ms` }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-slate-50/80 ring-1 ring-slate-200/60 flex items-center justify-center">
                  <Icon className={`w-4 h-4 ${card.color}`} />
                </div>
                <p className="text-slate-500">{card.label}</p>
              </div>
              <p className={`text-2xl font-semibold ${card.color}`}>{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 card p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Revenue Overview
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#0f766e"
                  fill="#ccfbf1"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status Chart */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Order Status
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {orderStatusData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index] }}
                />
                <span className="text-sm text-slate-600">
                  {item.name}: {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
