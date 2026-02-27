import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft, Leaf, Mail, Phone, MapPin, Calendar,
  Building2, Globe, CheckCircle, XCircle, Clock,
  Wallet, TrendingUp, ArrowDownToLine, ShieldCheck, ShieldX, ShieldAlert,
  AlertCircle,
} from 'lucide-react';
import { adminAPI } from '../services/api';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function currency(value) {
  return Number(value || 0).toLocaleString();
}

const VERIFY_META = {
  approved: { label: 'Approved',  bg: '#f0faf0', color: '#2d5a27', icon: ShieldCheck },
  pending:  { label: 'Pending',   bg: '#fef9ec', color: '#b45309', icon: ShieldAlert },
  rejected: { label: 'Rejected',  bg: '#fff1f2', color: '#be123c', icon: ShieldX },
};

export default function FarmerDetails() {
  const { farmerId } = useParams();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);

  const assetBase = useMemo(
    () => (import.meta.env.VITE_API_URL || '').replace(/\/api\/v1\/?$/, ''),
    []
  );

  const toAssetUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${assetBase}${url.startsWith('/') ? '' : '/'}${url}`;
  };

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

  useEffect(() => {
    fetchDetails();
  }, [farmerId]);

  const handleVerification = async () => {
    const farm = details?.farm;
    if (!farm?.id) return;

    const nextVerified = !farm.is_verified;
    setVerifying(true);
    try {
      await adminAPI.updateFarmVerification(farm.id, nextVerified);
      // Refresh details after verification change
      await fetchDetails();
    } catch (err) {
      console.error('Failed to update verification:', err);
    } finally {
      setVerifying(false);
    }
  };

  if (loading) return (
    <>
      <style>{styles}</style>
      <div className="fd-state-wrap">
        <div className="fd-spinner" />
        <p>Loading farmer details…</p>
      </div>
    </>
  );

  if (error) return (
    <>
      <style>{styles}</style>
      <div className="fd-root">
        <Link to="/farmers" className="fd-back">
          <ArrowLeft size={15} /> Back to Farmers
        </Link>
        <div className="fd-error">
          <AlertCircle size={16} />
          {error}
        </div>
      </div>
    </>
  );

  const profile      = details?.profile || {};
  const farm         = details?.farm || null;
  const wallet       = details?.wallet || {};
  const verification = details?.verification || null;
  const vMeta        = VERIFY_META[verification?.status] || VERIFY_META.pending;
  const VIcon        = vMeta.icon;

  const docs = verification ? [
    { label: 'Ghana Card Front', url: verification.ghana_card_front_url },
    { label: 'Ghana Card Back',  url: verification.ghana_card_back_url },
    { label: 'Selfie',           url: verification.selfie_url },
  ] : [];

  return (
    <>
      <style>{styles}</style>

      <div className="fd-root">

        {/* Back + header */}
        <div>
          <Link to="/farmers" className="fd-back">
            <ArrowLeft size={15} /> Back to Farmers
          </Link>
          <div className="fd-page-header">
            <div className="fd-page-icon">
              <Leaf size={24} color="#a3d977" />
            </div>
            <div>
              <h1 className="fd-title">{profile.name || 'Farmer Details'}</h1>
              <p className="fd-sub">Profile, business, wallet and verification data</p>
            </div>
          </div>
        </div>

        {/* Wallet cards */}
        <div className="fd-grid-3">
          {[
            { label: 'Wallet Balance',   value: `$${currency(wallet.balance)}`,        icon: Wallet,          accent: '#1a2e1a', bg: '#f0faf0' },
            { label: 'Total Earned',     value: `$${currency(wallet.total_earned)}`,    icon: TrendingUp,      accent: '#2d5a27', bg: '#e8f5e0' },
            { label: 'Total Withdrawn',  value: `$${currency(wallet.total_withdrawn)}`, icon: ArrowDownToLine, accent: '#0369a1', bg: '#e0f2fe' },
          ].map(c => {
            const Icon = c.icon;
            return (
              <div className="fd-wallet-card" key={c.label}>
                <div className="fd-wallet-icon" style={{ background: c.bg }}>
                  <Icon size={18} color={c.accent} />
                </div>
                <div>
                  <p className="fd-wallet-label">{c.label}</p>
                  <p className="fd-wallet-value" style={{ color: c.accent }}>{c.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Profile + Business */}
        <div className="fd-grid-2">

          {/* Farmer profile */}
          <section className="fd-card">
            <div className="fd-section-head">
              <div className="fd-section-icon" style={{ background: '#f0faf0' }}>
                <Leaf size={15} color="#2d5a27" />
              </div>
              <h2 className="fd-section-title">Farmer Profile</h2>
            </div>
            <div className="fd-rows">
              <div className="fd-row">
                <Mail size={14} color="#c4bfb5" />
                <span className="fd-row-label">Email</span>
                <span className="fd-row-val">{profile.email || '—'}</span>
              </div>
              <div className="fd-row">
                <Phone size={14} color="#c4bfb5" />
                <span className="fd-row-label">Phone</span>
                <span className="fd-row-val">{profile.phone || '—'}</span>
              </div>
              <div className="fd-row">
                <MapPin size={14} color="#c4bfb5" />
                <span className="fd-row-label">Address</span>
                <span className="fd-row-val">{profile.address || '—'}</span>
              </div>
              <div className="fd-row">
                <Calendar size={14} color="#c4bfb5" />
                <span className="fd-row-label">Joined</span>
                <span className="fd-row-val">
                  {profile.created_at
                    ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                    : '—'}
                </span>
              </div>
            </div>
          </section>

          {/* Business details */}
          <section className="fd-card">
            <div className="fd-section-head">
              <div className="fd-section-icon" style={{ background: '#eff6ff' }}>
                <Building2 size={15} color="#1d4ed8" />
              </div>
              <h2 className="fd-section-title">Business Details</h2>
            </div>

            {!farm ? (
              <p className="fd-empty-note">No farm profile found for this farmer.</p>
            ) : (
              <>
                <div className="fd-rows">
                  <div className="fd-row">
                    <Leaf size={14} color="#c4bfb5" />
                    <span className="fd-row-label">Farm</span>
                    <span className="fd-row-val">{farm.name || '—'}</span>
                  </div>
                  <div className="fd-row">
                    <Mail size={14} color="#c4bfb5" />
                    <span className="fd-row-label">Business Email</span>
                    <span className="fd-row-val">{farm.business_email || '—'}</span>
                  </div>
                  <div className="fd-row">
                    <Phone size={14} color="#c4bfb5" />
                    <span className="fd-row-label">Business Phone</span>
                    <span className="fd-row-val">{farm.business_phone || '—'}</span>
                  </div>
                  <div className="fd-row">
                    <MapPin size={14} color="#c4bfb5" />
                    <span className="fd-row-label">Location</span>
                    <span className="fd-row-val">
                      {[farm.street_address, farm.city, farm.country].filter(Boolean).join(', ') || '—'}
                    </span>
                  </div>
                  <div className="fd-row">
                    <Globe size={14} color="#c4bfb5" />
                    <span className="fd-row-label">Categories</span>
                    <span className="fd-row-val">
                      {farm.categories?.length
                        ? farm.categories.map(c => (
                            <span key={c} className="fd-tag">{c}</span>
                          ))
                        : '—'}
                    </span>
                  </div>
                  <div className="fd-row">
                    <span style={{ width: 14 }} />
                    <span className="fd-row-label">Online</span>
                    <span className={`fd-pill ${farm.is_online ? 'fd-pill-green' : 'fd-pill-grey'}`}>
                      {farm.is_online
                        ? <><CheckCircle size={11} /> Online</>
                        : <><XCircle size={11} /> Offline</>}
                    </span>
                  </div>
                  <div className="fd-row">
                    <span style={{ width: 14 }} />
                    <span className="fd-row-label">Verified</span>
                    <span className={`fd-pill ${farm.is_verified ? 'fd-pill-green' : 'fd-pill-grey'}`}>
                      {farm.is_verified
                        ? <><CheckCircle size={11} /> Verified</>
                        : <><XCircle size={11} /> Unverified</>}
                    </span>
                  </div>
                </div>

                {/* Operating hours */}
                {(farm.operating_hours || []).length > 0 && (
                  <div className="fd-hours-wrap">
                    <div className="fd-section-head" style={{ marginBottom: 12 }}>
                      <div className="fd-section-icon" style={{ background: '#fef9ec' }}>
                        <Clock size={14} color="#b45309" />
                      </div>
                      <h3 className="fd-section-title" style={{ fontSize: 14 }}>Operating Hours</h3>
                    </div>
                    <div className="fd-hours-grid">
                      {farm.operating_hours.map(slot => (
                        <div key={slot.day_of_week} className={`fd-hour-slot ${slot.is_open ? 'fd-hour-open' : 'fd-hour-closed'}`}>
                          <span className="fd-hour-day">{DAY_LABELS[slot.day_of_week] || `D${slot.day_of_week}`}</span>
                          <span className="fd-hour-time">
                            {slot.is_open ? `${slot.open_time || '--'} – ${slot.close_time || '--'}` : 'Closed'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        </div>

        {/* Verification */}
        <section className="fd-card">
          <div className="fd-section-head">
            <div className="fd-section-icon" style={{ background: vMeta.bg }}>
              <VIcon size={15} color={vMeta.color} />
            </div>
            <h2 className="fd-section-title">Verification Details</h2>
            {verification && (
              <span className="fd-verify-badge" style={{ background: vMeta.bg, color: vMeta.color }}>
                {vMeta.label}
              </span>
            )}
          </div>

          {/* Verify/Unverify Button */}
          {farm && (
            <div className="fd-verify-actions">
              <button
                onClick={handleVerification}
                disabled={verifying}
                className={`fd-verify-btn ${farm.is_verified ? 'fd-verify-btn-unverify' : 'fd-verify-btn-verify'}`}
              >
                {verifying ? (
                  <span className="fd-btn-spinner" />
                ) : farm.is_verified ? (
                  <ShieldX size={16} />
                ) : (
                  <ShieldCheck size={16} />
                )}
                {farm.is_verified ? 'Unverify Farm' : 'Verify Farm'}
              </button>
              <p className="fd-verify-hint">
                {farm.is_verified
                  ? 'Click to remove verification status from this farm'
                  : 'Click to verify this farm and grant verified badge'}
              </p>
            </div>
          )}

          {!verification ? (
            <p className="fd-empty-note">No verification record yet.</p>
          ) : (
            <>
              <div className="fd-grid-3" style={{ marginBottom: 20 }}>
                {[
                  { label: 'Status',       value: verification.status || 'pending' },
                  { label: 'Submitted',    value: verification.submitted_at ? new Date(verification.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—' },
                  { label: 'Verified At',  value: verification.verified_at  ? new Date(verification.verified_at).toLocaleDateString('en-US',  { month: 'short', day: 'numeric', year: 'numeric' }) : '—' },
                ].map(item => (
                  <div key={item.label} className="fd-info-tile">
                    <p className="fd-info-label">{item.label}</p>
                    <p className="fd-info-value">{item.value}</p>
                  </div>
                ))}
              </div>

              {verification.rejection_reason && (
                <div className="fd-rejection">
                  <AlertCircle size={15} />
                  <span><strong>Rejection reason:</strong> {verification.rejection_reason}</span>
                </div>
              )}

              <div className="fd-docs-grid">
                {docs.map(doc => {
                  const docUrl = toAssetUrl(doc.url);
                  return (
                    <div key={doc.label} className="fd-doc-card">
                      <p className="fd-doc-label">{doc.label}</p>
                      {docUrl ? (
                        <a href={docUrl} target="_blank" rel="noreferrer" className="fd-doc-img-wrap">
                          <img src={docUrl} alt={doc.label} className="fd-doc-img" />
                          <div className="fd-doc-overlay">View full</div>
                        </a>
                      ) : (
                        <div className="fd-doc-empty">Not uploaded</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>

      </div>
    </>
  );
}

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,600&family=DM+Sans:wght@300;400;500&display=swap');

.fd-root {
  font-family: 'DM Sans', sans-serif;
  padding: 32px 28px;
  max-width: 1100px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-height: 100vh;
  background: #f5f2ec;
}

.fd-state-wrap {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 14px; height: 320px;
  font-family: 'DM Sans', sans-serif;
  color: #bbb; font-size: 14px;
  background: #f5f2ec;
}
.fd-spinner {
  width: 40px; height: 40px;
  border: 3px solid #e8e4dc;
  border-top-color: #2d5a27;
  border-radius: 50%;
  animation: fdspin 0.7s linear infinite;
}
@keyframes fdspin { to { transform: rotate(360deg); } }

.fd-error {
  display: flex; align-items: center; gap: 10px;
  background: #fff5f5; border: 1px solid #fecdd3;
  border-radius: 14px; padding: 16px 20px;
  color: #be123c; font-size: 14px;
}

/* back link */
.fd-back {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 13px; font-weight: 500;
  color: #888; text-decoration: none;
  margin-bottom: 16px;
  transition: color 0.15s;
}
.fd-back:hover { color: #1a2e1a; }

/* page header */
.fd-page-header { display: flex; align-items: center; gap: 16px; }
.fd-page-icon {
  width: 52px; height: 52px;
  background: #1a2e1a;
  border-radius: 16px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 6px 20px rgba(26,46,26,0.28);
}
.fd-title {
  font-family: 'Fraunces', serif;
  font-size: 26px; font-weight: 600;
  color: #1a2e1a; margin: 0 0 3px;
}
.fd-sub { font-size: 13.5px; color: #999; margin: 0; }

/* grids */
.fd-grid-3 {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 16px;
}
@media (min-width: 640px) { .fd-grid-3 { grid-template-columns: repeat(3, 1fr); } }

.fd-grid-2 {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}
@media (min-width: 1024px) { .fd-grid-2 { grid-template-columns: 1fr 1fr; } }

/* wallet cards */
.fd-wallet-card {
  background: #fff;
  border-radius: 18px;
  padding: 20px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.05);
  display: flex; align-items: center; gap: 14px;
  transition: transform 0.2s, box-shadow 0.2s;
}
.fd-wallet-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.09); }
.fd-wallet-icon {
  width: 44px; height: 44px;
  border-radius: 13px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.fd-wallet-label { font-size: 12.5px; color: #999; margin: 0 0 4px; }
.fd-wallet-value {
  font-family: 'Fraunces', serif;
  font-size: 24px; font-weight: 600; margin: 0; line-height: 1;
}

/* card */
.fd-card {
  background: #fff;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 4px 20px rgba(0,0,0,0.06);
}

/* section head */
.fd-section-head {
  display: flex; align-items: center; gap: 10px;
  margin-bottom: 20px;
}
.fd-section-icon {
  width: 32px; height: 32px;
  border-radius: 9px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.fd-section-title {
  font-family: 'Fraunces', serif;
  font-size: 16px; font-weight: 600;
  color: #1a2e1a; margin: 0; flex: 1;
}

/* rows */
.fd-rows { display: flex; flex-direction: column; gap: 0; }
.fd-row {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 11px 0;
  border-bottom: 1px solid #f7f5f1;
  font-size: 13.5px;
}
.fd-row:last-child { border-bottom: none; }
.fd-row-label { color: #aaa; min-width: 120px; flex-shrink: 0; }
.fd-row-val {
  color: #333; font-weight: 500;
  display: flex; align-items: center; gap: 5px; flex-wrap: wrap;
}

/* tags */
.fd-tag {
  display: inline-block;
  background: #f0faf0; color: #2d5a27;
  font-size: 12px; font-weight: 500;
  padding: 2px 8px; border-radius: 6px;
}

/* pill */
.fd-pill {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 4px 10px; border-radius: 99px;
  font-size: 12px; font-weight: 500;
}
.fd-pill-green { background: #f0faf0; color: #2d5a27; }
.fd-pill-grey  { background: #f5f2ec; color: #999; }

/* operating hours */
.fd-hours-wrap {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0ede6;
}
.fd-hours-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}
@media (min-width: 640px) { .fd-hours-grid { grid-template-columns: repeat(7, 1fr); } }

.fd-hour-slot {
  border-radius: 10px;
  padding: 8px 6px;
  text-align: center;
}
.fd-hour-open   { background: #f0faf0; }
.fd-hour-closed { background: #f9f8f6; }
.fd-hour-day {
  display: block;
  font-size: 11px; font-weight: 600;
  letter-spacing: 0.04em;
  margin-bottom: 4px;
}
.fd-hour-open .fd-hour-day   { color: #2d5a27; }
.fd-hour-closed .fd-hour-day { color: #bbb; }
.fd-hour-time {
  display: block;
  font-size: 10px; line-height: 1.3;
}
.fd-hour-open .fd-hour-time   { color: #555; }
.fd-hour-closed .fd-hour-time { color: #ccc; }

/* verify badge */
.fd-verify-badge {
  font-size: 12px; font-weight: 600;
  padding: 4px 12px; border-radius: 99px;
  text-transform: capitalize;
}

/* info tiles */
.fd-info-tile {
  background: #faf9f6;
  border-radius: 12px;
  padding: 14px 16px;
}
.fd-info-label { font-size: 12px; color: #aaa; margin: 0 0 5px; }
.fd-info-value {
  font-size: 14px; font-weight: 600;
  color: #222; margin: 0; text-transform: capitalize;
}

/* rejection */
.fd-rejection {
  display: flex; align-items: flex-start; gap: 10px;
  background: #fff5f5; border: 1px solid #fecdd3;
  border-radius: 12px; padding: 12px 16px;
  color: #be123c; font-size: 13.5px;
  margin-bottom: 20px;
}

/* docs */
.fd-docs-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 16px;
}
@media (min-width: 640px) { .fd-docs-grid { grid-template-columns: repeat(3, 1fr); } }

.fd-doc-card {
  border-radius: 14px;
  border: 1.5px solid #f0ede6;
  overflow: hidden;
  background: #faf9f6;
}
.fd-doc-label {
  font-size: 12.5px; font-weight: 600;
  color: #555;
  padding: 10px 14px;
  border-bottom: 1px solid #f0ede6;
}
.fd-doc-img-wrap {
  display: block;
  position: relative;
  overflow: hidden;
}
.fd-doc-img {
  width: 100%; height: 180px;
  object-fit: cover;
  display: block;
  transition: transform 0.3s;
}
.fd-doc-img-wrap:hover .fd-doc-img { transform: scale(1.04); }
.fd-doc-overlay {
  position: absolute;
  inset: 0;
  background: rgba(26,46,26,0);
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 600;
  opacity: 0;
  transition: background 0.2s, opacity 0.2s;
}
.fd-doc-img-wrap:hover .fd-doc-overlay {
  background: rgba(26,46,26,0.45);
  opacity: 1;
}
.fd-doc-empty {
  height: 180px;
  display: flex; align-items: center; justify-content: center;
  color: #c4bfb5; font-size: 13px;
}

.fd-empty-note { font-size: 13.5px; color: #bbb; padding: 8px 0; margin: 0; }

/* verify actions */
.fd-verify-actions {
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0ede6;
}
.fd-verify-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 12px;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.2s, opacity 0.2s;
}
.fd-verify-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
.fd-verify-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.fd-verify-btn-verify {
  background: #2d5a27;
  color: #fff;
}
.fd-verify-btn-unverify {
  background: #fef2f2;
  color: #dc2626;
  border: 1.5px solid #fecaca;
}
.fd-verify-btn-unverify:hover:not(:disabled) {
  background: #fee2e2;
}
.fd-verify-hint {
  font-size: 12.5px;
  color: #999;
  margin: 10px 0 0;
}
.fd-btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: fdspin 0.6s linear infinite;
}
`;
