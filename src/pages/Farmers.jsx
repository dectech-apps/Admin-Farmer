import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../services/api';
import DataTable from '../components/DataTable';
import { Shield, ShieldOff, DollarSign } from 'lucide-react';

export default function Farmers() {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchFarmers();
  }, [page, search]);

  const fetchFarmers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getFarmers({ page, limit: 10, search });
      const payload = response.data || {};
      const rows = Array.isArray(payload.data)
        ? payload.data
        : Array.isArray(payload.data?.data)
          ? payload.data.data
          : Array.isArray(payload.farmers)
            ? payload.farmers
            : [];
      const pagination = payload.pagination || payload.data?.pagination || payload.meta?.pagination || {};
      setFarmers(rows);
      setTotalPages(pagination.pages || pagination.totalPages || 1);
    } catch (err) {
      console.error('Failed to fetch farmers:', err);
    } finally {
      setLoading(false);
    }
  };

  const getVerificationValue = (row) =>
    row?.farm_verified ?? row?.is_verified ?? row?.verified ?? false;

  const getVerificationTarget = (row) => {
    if (row?.farm_id) return { id: row.farm_id, type: 'farm' };
    if (row?.id) return { id: row.id, type: 'user' };
    return { id: null, type: null };
  };

  const handleVerification = async (row) => {
    const target = getVerificationTarget(row);
    if (!target.id) return;

    const nextVerified = !getVerificationValue(row);
    setUpdatingId(target.id);
    try {
      if (target.type === 'farm') {
        await adminAPI.updateFarmVerification(target.id, nextVerified);
      } else {
        await adminAPI.updateUserStatus(target.id, nextVerified ? 'verified' : 'unverified');
      }

      setFarmers((prev) =>
        prev.map((farmer) => {
          const farmerTarget = getVerificationTarget(farmer);
          if (farmerTarget.id !== target.id || farmerTarget.type !== target.type) {
            return farmer;
          }
          return {
            ...farmer,
            farm_verified: nextVerified,
            is_verified: nextVerified,
          };
        })
      );
    } catch (err) {
      console.error('Failed to update verification:', err);
      fetchFarmers();
    } finally {
      setUpdatingId(null);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Farmer',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center ring-1 ring-emerald-200/70">
            <span className="text-emerald-700 font-semibold">
              {row.name?.charAt(0) || 'F'}
            </span>
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
      key: 'farm_name',
      label: 'Farm',
      render: (_, row) => (
        <div>
          <p className="font-medium text-slate-800">{row.farm_name || 'No farm'}</p>
          <p className="text-sm text-slate-500 capitalize">{row.farm_status || ''}</p>
        </div>
      ),
    },
    {
      key: 'wallet',
      label: 'Earnings',
      render: (wallet) => (
        <div className="flex items-center gap-1">
          <DollarSign className="w-4 h-4 text-emerald-500" />
          <span className="font-semibold text-emerald-700">
            {parseFloat(wallet?.total_earned || 0).toLocaleString()}
          </span>
        </div>
      ),
    },
    {
      key: 'farm_verified',
      label: 'Verified',
      render: (_, row) => {
        const target = getVerificationTarget(row);
        const isVerified = getVerificationValue(row);
        const isUpdating = updatingId === target.id;

        return (
          <button
            onClick={() => handleVerification(row)}
            disabled={!target.id || isUpdating}
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              isVerified
                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            } ${!target.id || isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {isVerified ? (
              <>
                <Shield className="w-4 h-4" />
                Verified
              </>
            ) : (
              <>
                <ShieldOff className="w-4 h-4" />
                Unverified
              </>
            )}
          </button>
        );
      },
    },
    {
      key: 'created_at',
      label: 'Joined',
      render: (date) => date ? new Date(date).toLocaleDateString() : 'N/A',
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <Link
          to={`/farmers/${row.id}`}
          className="inline-flex items-center px-3 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-sm font-medium"
        >
          View details
        </Link>
      ),
    },
  ];

  return (
    <div className="page-content space-y-8">
      <div>
        <h1 className="page-title">Farmers</h1>
        <p className="page-subtitle">Manage farmer accounts and farm verification</p>
      </div>

      <DataTable
        columns={columns}
        data={farmers}
        loading={loading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search farmers..."
      />
    </div>
  );
}
