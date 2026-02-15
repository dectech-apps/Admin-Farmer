import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import DataTable from '../components/DataTable';
import { Package, User, Truck, DollarSign, Clock } from 'lucide-react';

const statusColors = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-cyan-100 text-cyan-700',
  processing: 'bg-sky-100 text-sky-700',
  ready_for_pickup: 'bg-teal-100 text-teal-700',
  picked_up: 'bg-blue-100 text-blue-700',
  in_transit: 'bg-orange-100 text-orange-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-rose-100 text-rose-700',
};

const statusLabels = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  ready_for_pickup: 'Ready for Pickup',
  picked_up: 'Picked Up',
  in_transit: 'In Transit',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

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

  const columns = [
    {
      key: 'id',
      label: 'Order ID',
      render: (id) => (
        <span className="font-mono text-sm text-slate-600">
          #{String(id).slice(0, 8)}
        </span>
      ),
    },
    {
      key: 'customer_name',
      label: 'Customer',
      render: (name, row) => (
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-slate-400" />
          <div>
            <span className="block">{name || 'Unknown'}</span>
            <span className="text-xs text-slate-500">{row.customer_email}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'farm_name',
      label: 'Farm',
      render: (name) => (
        <span className="text-slate-600">{name || 'N/A'}</span>
      ),
    },
    {
      key: 'total_amount',
      label: 'Total',
      render: (amount) => (
        <div className="flex items-center gap-1">
          <DollarSign className="w-4 h-4 text-emerald-500" />
          <span className="font-semibold text-emerald-700">
            {parseFloat(amount || 0).toLocaleString()}
          </span>
        </div>
      ),
    },
    {
      key: 'platform_commission',
      label: 'Commission',
      render: (commission) => (
        <span className="text-cyan-700 font-medium">
          ${parseFloat(commission || 0).toFixed(2)}
        </span>
      ),
    },
    {
      key: 'rider_name',
      label: 'Rider',
      render: (name) => (
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-slate-400" />
          <span>{name || 'Unassigned'}</span>
        </div>
      ),
    },
    {
      key: 'customer_status',
      label: 'Status',
      render: (status) => (
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            statusColors[status] || 'bg-slate-100 text-slate-600'
          }`}
        >
          {statusLabels[status] || status}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Date',
      render: (date) => (
        <div className="flex items-center gap-1 text-sm text-slate-500">
          <Clock className="w-4 h-4" />
          {date ? new Date(date).toLocaleDateString() : 'N/A'}
        </div>
      ),
    },
  ];

  return (
    <div className="page-content space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Orders</h1>
          <p className="page-subtitle">View and manage all orders</p>
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="input max-w-xs"
        >
          <option value="">All Statuses</option>
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <DataTable
        columns={columns}
        data={orders}
        loading={loading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
