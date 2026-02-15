import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { adminAPI } from '../services/api';
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function currency(value) {
  return Number(value || 0).toLocaleString();
}

export default function FarmerDetails() {
  const { farmerId } = useParams();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const assetBase = useMemo(
    () => (import.meta.env.VITE_API_URL || '').replace(/\/api\/v1\/?$/, ''),
    []
  );

  const toAssetUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${assetBase}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await adminAPI.getFarmerDetails(farmerId);
        setDetails(response.data?.data || null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load farmer details');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [farmerId]);

  if (loading) {
    return (
      <div className="page-content">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-content space-y-6">
        <Link to="/farmers" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4" />
          Back to Farmers
        </Link>
        <div className="card p-6 text-rose-700">{error}</div>
      </div>
    );
  }

  const profile = details?.profile || {};
  const farm = details?.farm || null;
  const wallet = details?.wallet || {};
  const verification = details?.verification || null;
  const docs = verification
    ? [
      { label: 'Ghana Card Front', url: verification.ghana_card_front_url },
      { label: 'Ghana Card Back', url: verification.ghana_card_back_url },
      { label: 'Selfie', url: verification.selfie_url },
    ]
    : [];

  return (
    <div className="page-content space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Link to="/farmers" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4" />
            Back to Farmers
          </Link>
          <h1 className="page-title mt-2">{profile.name || 'Farmer Details'}</h1>
          <p className="page-subtitle">Profile, business, wallet and verification data</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5">
          <p className="text-sm text-slate-500 mb-1">Wallet Balance</p>
          <p className="text-2xl font-semibold text-slate-900">${currency(wallet.balance)}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-slate-500 mb-1">Total Earned</p>
          <p className="text-2xl font-semibold text-emerald-700">${currency(wallet.total_earned)}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-slate-500 mb-1">Total Withdrawn</p>
          <p className="text-2xl font-semibold text-cyan-700">${currency(wallet.total_withdrawn)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Farmer Profile</h2>
          <div className="space-y-2 text-sm text-slate-700">
            <p><span className="text-slate-500">Email:</span> {profile.email || 'N/A'}</p>
            <p><span className="text-slate-500">Phone:</span> {profile.phone || 'N/A'}</p>
            <p><span className="text-slate-500">Address:</span> {profile.address || 'N/A'}</p>
            <p><span className="text-slate-500">Joined:</span> {profile.created_at ? new Date(profile.created_at).toLocaleString() : 'N/A'}</p>
          </div>
        </section>

        <section className="card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Business Details</h2>
          {!farm ? (
            <p className="text-sm text-slate-500">No farm profile found for this farmer.</p>
          ) : (
            <div className="space-y-2 text-sm text-slate-700">
              <p><span className="text-slate-500">Farm:</span> {farm.name || 'N/A'}</p>
              <p><span className="text-slate-500">Business Email:</span> {farm.business_email || 'N/A'}</p>
              <p><span className="text-slate-500">Business Phone:</span> {farm.business_phone || 'N/A'}</p>
              <p><span className="text-slate-500">Location:</span> {[farm.street_address, farm.city, farm.country].filter(Boolean).join(', ') || 'N/A'}</p>
              <p><span className="text-slate-500">Categories:</span> {farm.categories?.length ? farm.categories.join(', ') : 'N/A'}</p>
              <p><span className="text-slate-500">Online:</span> {farm.is_online ? 'Yes' : 'No'}</p>
              <p><span className="text-slate-500">Farm Verified:</span> {farm.is_verified ? 'Yes' : 'No'}</p>
              <div>
                <p className="text-slate-500 mb-1">Operating Hours:</p>
                <div className="space-y-1">
                  {(farm.operating_hours || []).length ? farm.operating_hours.map((slot) => (
                    <p key={slot.day_of_week}>
                      {DAY_LABELS[slot.day_of_week] || `Day ${slot.day_of_week}`}: {slot.is_open ? `${slot.open_time || '--'} - ${slot.close_time || '--'}` : 'Closed'}
                    </p>
                  )) : <p>N/A</p>}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      <section className="card p-6 space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Verification Details</h2>
        {!verification ? (
          <p className="text-sm text-slate-500">No verification record yet.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-slate-500">Status</p>
                <p className="font-semibold text-slate-900">{verification.status || 'pending'}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-slate-500">Submitted</p>
                <p className="font-semibold text-slate-900">{verification.submitted_at ? new Date(verification.submitted_at).toLocaleString() : 'N/A'}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-slate-500">Verified At</p>
                <p className="font-semibold text-slate-900">{verification.verified_at ? new Date(verification.verified_at).toLocaleString() : 'N/A'}</p>
              </div>
            </div>

            {verification.rejection_reason ? (
              <p className="text-sm text-rose-700 bg-rose-50 border border-rose-100 rounded-lg p-3">
                Rejection reason: {verification.rejection_reason}
              </p>
            ) : null}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {docs.map((doc) => {
                const docUrl = toAssetUrl(doc.url);
                return (
                  <div key={doc.label} className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
                    <div className="px-3 py-2 text-sm font-medium text-slate-700">{doc.label}</div>
                    {docUrl ? (
                      <a href={docUrl} target="_blank" rel="noreferrer" className="block">
                        <img src={docUrl} alt={doc.label} className="h-48 w-full object-cover" />
                      </a>
                    ) : (
                      <div className="h-48 flex items-center justify-center text-sm text-slate-500 bg-slate-100">
                        Not uploaded
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
