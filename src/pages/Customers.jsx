import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import DataTable from '../components/DataTable';
import { User, ShoppingBag, MapPin, DollarSign } from 'lucide-react';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, [page, search]);

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

  const columns = [
    {
      key: 'name',
      label: 'Customer',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center ring-1 ring-amber-200/70">
            <User className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <p className="font-medium text-slate-800">{row.name}</p>
            <p className="text-sm text-slate-500">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (phone) => phone || 'N/A',
    },
    {
      key: 'address',
      label: 'Address',
      render: (address) => (
        <div className="flex items-center gap-1 text-sm text-slate-600 max-w-xs truncate">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{address || 'Not provided'}</span>
        </div>
      ),
    },
    {
      key: 'orders',
      label: 'Orders',
      render: (orders) => (
        <div className="flex items-center gap-1">
          <ShoppingBag className="w-4 h-4 text-slate-400" />
          <span className="font-semibold text-slate-800">
            {orders?.order_count || 0}
          </span>
        </div>
      ),
    },
    {
      key: 'orders',
      label: 'Total Spent',
      render: (orders) => (
        <div className="flex items-center gap-1">
          <DollarSign className="w-4 h-4 text-emerald-500" />
          <span className="font-semibold text-emerald-700">
            {parseFloat(orders?.total_spent || 0).toLocaleString()}
          </span>
        </div>
      ),
    },
    {
      key: 'created_at',
      label: 'Joined',
      render: (date) => date ? new Date(date).toLocaleDateString() : 'N/A',
    },
  ];

  return (
    <div className="page-content space-y-8">
      <div>
        <h1 className="page-title">Customers</h1>
        <p className="page-subtitle">View customer accounts and order history</p>
      </div>

      <DataTable
        columns={columns}
        data={customers}
        loading={loading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search customers..."
      />
    </div>
  );
}
