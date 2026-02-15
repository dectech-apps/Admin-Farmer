import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import DataTable from '../components/DataTable';
import { Truck, Star, CheckCircle, XCircle } from 'lucide-react';

export default function Riders() {
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchRiders();
  }, [page, search]);

  const fetchRiders = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getRiders({ page, limit: 10, search });
      const payload = response.data || {};
      const rows = Array.isArray(payload.data)
        ? payload.data
        : Array.isArray(payload.data?.data)
          ? payload.data.data
          : Array.isArray(payload.riders)
            ? payload.riders
            : [];
      const pagination = payload.pagination || payload.data?.pagination || payload.meta?.pagination || {};
      setRiders(rows);
      setTotalPages(pagination.pages || 1);
    } catch (err) {
      console.error('Failed to fetch riders:', err);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Rider',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center ring-1 ring-cyan-200/70">
            <Truck className="w-5 h-5 text-cyan-700" />
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
      key: 'vehicle_type',
      label: 'Vehicle',
      render: (type, row) => (
        <div>
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 rounded-md text-sm capitalize text-slate-600">
            {type || 'Not specified'}
          </span>
          {row.license_plate && (
            <p className="text-xs text-slate-500 mt-1">{row.license_plate}</p>
          )}
        </div>
      ),
    },
    {
      key: 'total_deliveries',
      label: 'Deliveries',
      render: (count) => (
        <span className="font-semibold text-slate-800">{count || 0}</span>
      ),
    },
    {
      key: 'rating',
      label: 'Rating',
      render: (rating) => (
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span className="font-medium">{rating ? parseFloat(rating).toFixed(1) : 'N/A'}</span>
        </div>
      ),
    },
    {
      key: 'is_available',
      label: 'Available',
      render: (isAvailable) => (
        <span
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm ${
            isAvailable
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          {isAvailable ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Available
            </>
          ) : (
            <>
              <XCircle className="w-4 h-4" />
              Unavailable
            </>
          )}
        </span>
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
        <h1 className="page-title">Riders</h1>
        <p className="page-subtitle">Manage delivery rider accounts</p>
      </div>

      <DataTable
        columns={columns}
        data={riders}
        loading={loading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search riders..."
      />
    </div>
  );
}
