import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft, UtensilsCrossed, Mail, Phone, MapPin, Calendar,
  Building2, Globe, CheckCircle, XCircle, Clock,
  Wallet, TrendingUp, ArrowDownToLine, ShieldCheck, ShieldX, ShieldAlert,
  AlertCircle, Star, DollarSign, Truck, User, Image,
} from 'lucide-react';
import { adminAPI } from '../services/api';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function currency(value) {
  return Number(value || 0).toLocaleString();
}

const VERIFY_META = {
  verified: { label: 'Verified',  bg: '#fff8eb', color: '#f59e0b', icon: ShieldCheck },
  approved: { label: 'Approved',  bg: '#fff8eb', color: '#f59e0b', icon: ShieldCheck },
  pending:  { label: 'Pending',   bg: '#fef9ec', color: '#b45309', icon: ShieldAlert },
  rejected: { label: 'Rejected',  bg: '#fff1f2', color: '#be123c', icon: ShieldX },
};

export default function RestaurantDetails() {
  const { restaurantId } = useParams();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);

  const assetBase = useMemo(() => {
    const apiUrl = import.meta.env.VITE_API_URL || '';
    // Remove /api/v1 suffix to get base URL for static assets
    const base = apiUrl.replace(/\/api\/v1\/?$/, '');
    return base || '';
  }, []);

  const toAssetUrl = (url) => {
    if (!url) return null;
    // Already a full URL
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    // Handle relative paths - ensure proper formatting
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    // If we have a base URL, prepend it; otherwise use relative path
    return assetBase ? `${assetBase}${cleanUrl}` : cleanUrl;
  };

  const fetchDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminAPI.getRestaurantDetails(restaurantId);
      setDetails(response.data?.data || null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load restaurant details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [restaurantId]);

  const handleVerification = async () => {
    const restaurant = details?.restaurant;
    if (!restaurant?.id) return;

    const nextVerified = !restaurant.is_verified;
    setVerifying(true);
    try {
      await adminAPI.updateRestaurantVerification(restaurant.id, nextVerified);
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
      <div className="rd-state-wrap">
        <div className="rd-spinner" />
        <p>Loading restaurant details...</p>
      </div>
    </>
  );

  if (error) return (
    <>
      <style>{styles}</style>
      <div className="rd-root">
        <Link to="/restaurants" className="rd-back">
          <ArrowLeft size={15} /> Back to Restaurants
        </Link>
        <div className="rd-error">
          <AlertCircle size={16} />
          {error}
        </div>
      </div>
    </>
  );

  const restaurant   = details?.restaurant || {};
  const owner        = details?.owner || {};
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

      <div className="rd-root">

        {/* Back + header */}
        <div>
          <Link to="/restaurants" className="rd-back">
            <ArrowLeft size={15} /> Back to Restaurants
          </Link>
          <div className="rd-page-header">
            <div className="rd-page-icon">
              <UtensilsCrossed size={24} color="#f59e0b" />
            </div>
            <div>
              <h1 className="rd-title">{restaurant.name || 'Restaurant Details'}</h1>
              <p className="rd-sub">Business details, wallet and verification info</p>
            </div>
            {restaurant.is_verified && (
              <span className="rd-header-badge">
                <ShieldCheck size={14} /> Verified
              </span>
            )}
          </div>
        </div>

        {/* Quick stats */}
        <div className="rd-grid-4">
          {[
            { label: 'Rating',           value: `${parseFloat(restaurant.rating || 0).toFixed(1)}`,  icon: Star,       accent: '#f59e0b', bg: '#fffbeb' },
            { label: 'Reviews',          value: restaurant.review_count || 0,                        icon: Star,       accent: '#f59e0b', bg: '#fffbeb' },
            { label: 'Delivery Fee',     value: `$${currency(restaurant.delivery_fee)}`,             icon: Truck,      accent: '#0369a1', bg: '#f0f9ff' },
            { label: 'Min Order',        value: `$${currency(restaurant.minimum_order)}`,            icon: DollarSign, accent: '#7c3aed', bg: '#faf5ff' },
          ].map(c => {
            const Icon = c.icon;
            return (
              <div className="rd-stat-card" key={c.label}>
                <div className="rd-stat-icon" style={{ background: c.bg }}>
                  <Icon size={16} color={c.accent} />
                </div>
                <div>
                  <p className="rd-stat-label">{c.label}</p>
                  <p className="rd-stat-value" style={{ color: c.accent }}>{c.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Wallet cards */}
        <div className="rd-grid-3">
          {[
            { label: 'Wallet Balance',   value: `$${currency(wallet.balance)}`,        icon: Wallet,          accent: '#f59e0b', bg: '#fffbeb' },
            { label: 'Total Earned',     value: `$${currency(wallet.total_earned)}`,    icon: TrendingUp,      accent: '#22c55e', bg: '#f0fdf4' },
            { label: 'Total Withdrawn',  value: `$${currency(wallet.total_withdrawn)}`, icon: ArrowDownToLine, accent: '#0369a1', bg: '#e0f2fe' },
          ].map(c => {
            const Icon = c.icon;
            return (
              <div className="rd-wallet-card" key={c.label}>
                <div className="rd-wallet-icon" style={{ background: c.bg }}>
                  <Icon size={18} color={c.accent} />
                </div>
                <div>
                  <p className="rd-wallet-label">{c.label}</p>
                  <p className="rd-wallet-value" style={{ color: c.accent }}>{c.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Restaurant + Owner */}
        <div className="rd-grid-2">

          {/* Restaurant details */}
          <section className="rd-card">
            <div className="rd-section-head">
              <div className="rd-section-icon" style={{ background: '#fffbeb' }}>
                <UtensilsCrossed size={15} color="#f59e0b" />
              </div>
              <h2 className="rd-section-title">Restaurant Details</h2>
            </div>

            {/* Restaurant Image */}
            {restaurant.image_url && (
              <div className="rd-business-img-wrap">
                <img
                  src={toAssetUrl(restaurant.image_url)}
                  alt={restaurant.name}
                  className="rd-business-img"
                  onError={(e) => { e.target.parentElement.style.display = 'none'; }}
                />
              </div>
            )}

            <div className="rd-rows">
              <div className="rd-row">
                <UtensilsCrossed size={14} color="#c4bfb5" />
                <span className="rd-row-label">Name</span>
                <span className="rd-row-val">{restaurant.name || '—'}</span>
              </div>
              <div className="rd-row">
                <Globe size={14} color="#c4bfb5" />
                <span className="rd-row-label">Cuisine Types</span>
                <span className="rd-row-val">
                  {restaurant.cuisine_types?.length
                    ? restaurant.cuisine_types.map(c => (
                        <span key={c} className="rd-tag">{c}</span>
                      ))
                    : '—'}
                </span>
              </div>
              <div className="rd-row">
                <Mail size={14} color="#c4bfb5" />
                <span className="rd-row-label">Business Email</span>
                <span className="rd-row-val">{restaurant.business_email || '—'}</span>
              </div>
              <div className="rd-row">
                <Phone size={14} color="#c4bfb5" />
                <span className="rd-row-label">Business Phone</span>
                <span className="rd-row-val">{restaurant.business_phone || '—'}</span>
              </div>
              <div className="rd-row">
                <MapPin size={14} color="#c4bfb5" />
                <span className="rd-row-label">Street Address</span>
                <span className="rd-row-val">{restaurant.street_address || '—'}</span>
              </div>
              <div className="rd-row">
                <span style={{ width: 14 }} />
                <span className="rd-row-label">City</span>
                <span className="rd-row-val">{restaurant.city || '—'}</span>
              </div>
              <div className="rd-row">
                <span style={{ width: 14 }} />
                <span className="rd-row-label">State</span>
                <span className="rd-row-val">{restaurant.state || '—'}</span>
              </div>
              <div className="rd-row">
                <span style={{ width: 14 }} />
                <span className="rd-row-label">Zipcode</span>
                <span className="rd-row-val">{restaurant.zipcode || '—'}</span>
              </div>
              <div className="rd-row">
                <span style={{ width: 14 }} />
                <span className="rd-row-label">Country</span>
                <span className="rd-row-val">{restaurant.country || '—'}</span>
              </div>
              <div className="rd-row">
                <Clock size={14} color="#c4bfb5" />
                <span className="rd-row-label">Est. Delivery</span>
                <span className="rd-row-val">{restaurant.estimated_delivery_time || 30} mins</span>
              </div>
              <div className="rd-row">
                <span style={{ width: 14 }} />
                <span className="rd-row-label">Online</span>
                <span className={`rd-pill ${restaurant.is_online ? 'rd-pill-green' : 'rd-pill-grey'}`}>
                  {restaurant.is_online
                    ? <><CheckCircle size={11} /> Online</>
                    : <><XCircle size={11} /> Offline</>}
                </span>
              </div>
              <div className="rd-row">
                <span style={{ width: 14 }} />
                <span className="rd-row-label">Setup Complete</span>
                <span className={`rd-pill ${restaurant.is_setup_complete ? 'rd-pill-green' : 'rd-pill-grey'}`}>
                  {restaurant.is_setup_complete
                    ? <><CheckCircle size={11} /> Complete</>
                    : <><XCircle size={11} /> Incomplete</>}
                </span>
              </div>
            </div>

            {/* Operating hours */}
            {(restaurant.operating_hours || []).length > 0 && (
              <div className="rd-hours-wrap">
                <div className="rd-section-head" style={{ marginBottom: 12 }}>
                  <div className="rd-section-icon" style={{ background: '#fef9ec' }}>
                    <Clock size={14} color="#b45309" />
                  </div>
                  <h3 className="rd-section-title" style={{ fontSize: 14 }}>Operating Hours</h3>
                </div>
                <div className="rd-hours-grid">
                  {restaurant.operating_hours.map(slot => (
                    <div key={slot.day_of_week} className={`rd-hour-slot ${slot.is_open ? 'rd-hour-open' : 'rd-hour-closed'}`}>
                      <span className="rd-hour-day">{DAY_LABELS[slot.day_of_week] || `D${slot.day_of_week}`}</span>
                      <span className="rd-hour-time">
                        {slot.is_open ? `${slot.open_time || '--'} – ${slot.close_time || '--'}` : 'Closed'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Owner details */}
          <section className="rd-card">
            <div className="rd-section-head">
              <div className="rd-section-icon" style={{ background: '#eff6ff' }}>
                <Building2 size={15} color="#1d4ed8" />
              </div>
              <h2 className="rd-section-title">Owner Details</h2>
            </div>

            {/* Owner Profile Image */}
            <div className="rd-profile-img-wrap">
              {owner.profile_image ? (
                <img
                  src={toAssetUrl(owner.profile_image)}
                  alt={owner.name}
                  className="rd-profile-img"
                  onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                />
              ) : null}
              <div className="rd-profile-img-placeholder" style={{ display: owner.profile_image ? 'none' : 'flex' }}>
                <User size={32} color="#c4bfb5" />
              </div>
            </div>

            <div className="rd-rows">
              <div className="rd-row">
                <Building2 size={14} color="#c4bfb5" />
                <span className="rd-row-label">Name</span>
                <span className="rd-row-val">{owner.name || '—'}</span>
              </div>
              <div className="rd-row">
                <Mail size={14} color="#c4bfb5" />
                <span className="rd-row-label">Email</span>
                <span className="rd-row-val">{owner.email || '—'}</span>
              </div>
              <div className="rd-row">
                <Phone size={14} color="#c4bfb5" />
                <span className="rd-row-label">Phone</span>
                <span className="rd-row-val">{owner.phone || '—'}</span>
              </div>
              <div className="rd-row">
                <Calendar size={14} color="#c4bfb5" />
                <span className="rd-row-label">Joined</span>
                <span className="rd-row-val">
                  {restaurant.created_at
                    ? new Date(restaurant.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                    : '—'}
                </span>
              </div>
            </div>

            {/* Description */}
            {restaurant.description && (
              <div className="rd-desc-wrap">
                <h4 className="rd-desc-title">Description</h4>
                <p className="rd-desc-text">{restaurant.description}</p>
              </div>
            )}

            {/* Bio */}
            {restaurant.bio && (
              <div className="rd-desc-wrap">
                <h4 className="rd-desc-title">Bio</h4>
                <p className="rd-desc-text">{restaurant.bio}</p>
              </div>
            )}
          </section>
        </div>

        {/* Verification */}
        <section className="rd-card">
          <div className="rd-section-head">
            <div className="rd-section-icon" style={{ background: vMeta.bg }}>
              <VIcon size={15} color={vMeta.color} />
            </div>
            <h2 className="rd-section-title">Verification Details</h2>
            {verification && (
              <span className="rd-verify-badge" style={{ background: vMeta.bg, color: vMeta.color }}>
                {vMeta.label}
              </span>
            )}
          </div>

          {/* Verify/Unverify Button */}
          <div className="rd-verify-actions">
            <button
              onClick={handleVerification}
              disabled={verifying}
              className={`rd-verify-btn ${restaurant.is_verified ? 'rd-verify-btn-unverify' : 'rd-verify-btn-verify'}`}
            >
              {verifying ? (
                <span className="rd-btn-spinner" />
              ) : restaurant.is_verified ? (
                <ShieldX size={16} />
              ) : (
                <ShieldCheck size={16} />
              )}
              {restaurant.is_verified ? 'Unverify Restaurant' : 'Verify Restaurant'}
            </button>
            <p className="rd-verify-hint">
              {restaurant.is_verified
                ? 'Click to remove verification status from this restaurant'
                : 'Click to verify this restaurant and grant verified badge'}
            </p>
          </div>

          {!verification ? (
            <p className="rd-empty-note">No verification documents submitted yet.</p>
          ) : (
            <>
              <div className="rd-grid-3" style={{ marginBottom: 20 }}>
                {[
                  { label: 'Status',       value: verification.status || 'pending' },
                  { label: 'Submitted',    value: verification.submitted_at ? new Date(verification.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—' },
                  { label: 'Verified At',  value: verification.verified_at  ? new Date(verification.verified_at).toLocaleDateString('en-US',  { month: 'short', day: 'numeric', year: 'numeric' }) : '—' },
                ].map(item => (
                  <div key={item.label} className="rd-info-tile">
                    <p className="rd-info-label">{item.label}</p>
                    <p className="rd-info-value">{item.value}</p>
                  </div>
                ))}
              </div>

              {verification.rejection_reason && (
                <div className="rd-rejection">
                  <AlertCircle size={15} />
                  <span><strong>Rejection reason:</strong> {verification.rejection_reason}</span>
                </div>
              )}

              <div className="rd-docs-grid">
                {docs.map(doc => {
                  const docUrl = toAssetUrl(doc.url);
                  return (
                    <div key={doc.label} className="rd-doc-card">
                      <p className="rd-doc-label">{doc.label}</p>
                      {docUrl ? (
                        <a href={docUrl} target="_blank" rel="noreferrer" className="rd-doc-img-wrap">
                          <img src={docUrl} alt={doc.label} className="rd-doc-img" />
                          <div className="rd-doc-overlay">View full</div>
                        </a>
                      ) : (
                        <div className="rd-doc-empty">Not uploaded</div>
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

.rd-root {
  font-family: 'DM Sans', sans-serif;
  padding: 32px 28px;
  max-width: 1100px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-height: 100vh;
  background: #f5f2ec;
}

.rd-state-wrap {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 14px; height: 320px;
  font-family: 'DM Sans', sans-serif;
  color: #bbb; font-size: 14px;
  background: #f5f2ec;
}
.rd-spinner {
  width: 40px; height: 40px;
  border: 3px solid #e8e4dc;
  border-top-color: #f59e0b;
  border-radius: 50%;
  animation: rdspin 0.7s linear infinite;
}
@keyframes rdspin { to { transform: rotate(360deg); } }

.rd-error {
  display: flex; align-items: center; gap: 10px;
  background: #fff5f5; border: 1px solid #fecdd3;
  border-radius: 14px; padding: 16px 20px;
  color: #be123c; font-size: 14px;
}

/* back link */
.rd-back {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 13px; font-weight: 500;
  color: #888; text-decoration: none;
  margin-bottom: 16px;
  transition: color 0.15s;
}
.rd-back:hover { color: #1a2e1a; }

/* page header */
.rd-page-header { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
.rd-page-icon {
  width: 52px; height: 52px;
  background: #1a2e1a;
  border-radius: 16px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 6px 20px rgba(26,46,26,0.28);
}
.rd-title {
  font-family: 'Fraunces', serif;
  font-size: 26px; font-weight: 600;
  color: #1a2e1a; margin: 0 0 3px;
}
.rd-sub { font-size: 13.5px; color: #999; margin: 0; }
.rd-header-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #fffbeb;
  color: #f59e0b;
  font-size: 12px;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: 99px;
  margin-left: auto;
}

/* grids */
.rd-grid-4 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}
@media (min-width: 768px) { .rd-grid-4 { grid-template-columns: repeat(4, 1fr); } }

.rd-grid-3 {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 16px;
}
@media (min-width: 640px) { .rd-grid-3 { grid-template-columns: repeat(3, 1fr); } }

.rd-grid-2 {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}
@media (min-width: 1024px) { .rd-grid-2 { grid-template-columns: 1fr 1fr; } }

/* stat cards */
.rd-stat-card {
  background: #fff;
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04);
  display: flex; align-items: center; gap: 12px;
}
.rd-stat-icon {
  width: 38px; height: 38px;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.rd-stat-label { font-size: 11.5px; color: #999; margin: 0 0 3px; }
.rd-stat-value {
  font-family: 'Fraunces', serif;
  font-size: 18px; font-weight: 600; margin: 0; line-height: 1;
}

/* wallet cards */
.rd-wallet-card {
  background: #fff;
  border-radius: 18px;
  padding: 20px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.05);
  display: flex; align-items: center; gap: 14px;
  transition: transform 0.2s, box-shadow 0.2s;
}
.rd-wallet-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.09); }
.rd-wallet-icon {
  width: 44px; height: 44px;
  border-radius: 13px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.rd-wallet-label { font-size: 12.5px; color: #999; margin: 0 0 4px; }
.rd-wallet-value {
  font-family: 'Fraunces', serif;
  font-size: 24px; font-weight: 600; margin: 0; line-height: 1;
}

/* card */
.rd-card {
  background: #fff;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 4px 20px rgba(0,0,0,0.06);
}

/* section head */
.rd-section-head {
  display: flex; align-items: center; gap: 10px;
  margin-bottom: 20px;
}
.rd-section-icon {
  width: 32px; height: 32px;
  border-radius: 9px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.rd-section-title {
  font-family: 'Fraunces', serif;
  font-size: 16px; font-weight: 600;
  color: #1a2e1a; margin: 0; flex: 1;
}

/* rows */
.rd-rows { display: flex; flex-direction: column; gap: 0; }
.rd-row {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 11px 0;
  border-bottom: 1px solid #f7f5f1;
  font-size: 13.5px;
}
.rd-row:last-child { border-bottom: none; }
.rd-row-label { color: #aaa; min-width: 120px; flex-shrink: 0; }
.rd-row-val {
  color: #333; font-weight: 500;
  display: flex; align-items: center; gap: 5px; flex-wrap: wrap;
}

/* tags */
.rd-tag {
  display: inline-block;
  background: #fffbeb; color: #f59e0b;
  font-size: 12px; font-weight: 500;
  padding: 2px 8px; border-radius: 6px;
}

/* pill */
.rd-pill {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 4px 10px; border-radius: 99px;
  font-size: 12px; font-weight: 500;
}
.rd-pill-green { background: #f0fdf4; color: #22c55e; }
.rd-pill-grey  { background: #f5f2ec; color: #999; }

/* operating hours */
.rd-hours-wrap {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0ede6;
}
.rd-hours-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}
@media (min-width: 640px) { .rd-hours-grid { grid-template-columns: repeat(7, 1fr); } }

.rd-hour-slot {
  border-radius: 10px;
  padding: 8px 6px;
  text-align: center;
}
.rd-hour-open   { background: #fffbeb; }
.rd-hour-closed { background: #f9f8f6; }
.rd-hour-day {
  display: block;
  font-size: 11px; font-weight: 600;
  letter-spacing: 0.04em;
  margin-bottom: 4px;
}
.rd-hour-open .rd-hour-day   { color: #f59e0b; }
.rd-hour-closed .rd-hour-day { color: #bbb; }
.rd-hour-time {
  display: block;
  font-size: 10px; line-height: 1.3;
}
.rd-hour-open .rd-hour-time   { color: #555; }
.rd-hour-closed .rd-hour-time { color: #ccc; }

/* desc */
.rd-desc-wrap {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #f0ede6;
}
.rd-desc-title {
  font-size: 13px;
  font-weight: 600;
  color: #666;
  margin: 0 0 8px;
}
.rd-desc-text {
  font-size: 13.5px;
  color: #555;
  line-height: 1.6;
  margin: 0;
}

/* verify badge */
.rd-verify-badge {
  font-size: 12px; font-weight: 600;
  padding: 4px 12px; border-radius: 99px;
  text-transform: capitalize;
}

/* verify actions */
.rd-verify-actions {
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0ede6;
}
.rd-verify-btn {
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
.rd-verify-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
.rd-verify-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.rd-verify-btn-verify {
  background: #f59e0b;
  color: #fff;
}
.rd-verify-btn-unverify {
  background: #fef2f2;
  color: #dc2626;
  border: 1.5px solid #fecaca;
}
.rd-verify-btn-unverify:hover:not(:disabled) {
  background: #fee2e2;
}
.rd-verify-hint {
  font-size: 12.5px;
  color: #999;
  margin: 10px 0 0;
}
.rd-btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: rdspin 0.6s linear infinite;
}

/* info tiles */
.rd-info-tile {
  background: #faf9f6;
  border-radius: 12px;
  padding: 14px 16px;
}
.rd-info-label { font-size: 12px; color: #aaa; margin: 0 0 5px; }
.rd-info-value {
  font-size: 14px; font-weight: 600;
  color: #222; margin: 0; text-transform: capitalize;
}

/* rejection */
.rd-rejection {
  display: flex; align-items: flex-start; gap: 10px;
  background: #fff5f5; border: 1px solid #fecdd3;
  border-radius: 12px; padding: 12px 16px;
  color: #be123c; font-size: 13.5px;
  margin-bottom: 20px;
}

/* docs */
.rd-docs-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 16px;
}
@media (min-width: 640px) { .rd-docs-grid { grid-template-columns: repeat(3, 1fr); } }

.rd-doc-card {
  border-radius: 14px;
  border: 1.5px solid #f0ede6;
  overflow: hidden;
  background: #faf9f6;
}
.rd-doc-label {
  font-size: 12.5px; font-weight: 600;
  color: #555;
  padding: 10px 14px;
  border-bottom: 1px solid #f0ede6;
}
.rd-doc-img-wrap {
  display: block;
  position: relative;
  overflow: hidden;
}
.rd-doc-img {
  width: 100%; height: 180px;
  object-fit: cover;
  display: block;
  transition: transform 0.3s;
}
.rd-doc-img-wrap:hover .rd-doc-img { transform: scale(1.04); }
.rd-doc-overlay {
  position: absolute;
  inset: 0;
  background: rgba(26,46,26,0);
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 600;
  opacity: 0;
  transition: background 0.2s, opacity 0.2s;
}
.rd-doc-img-wrap:hover .rd-doc-overlay {
  background: rgba(26,46,26,0.45);
  opacity: 1;
}
.rd-doc-empty {
  height: 180px;
  display: flex; align-items: center; justify-content: center;
  color: #c4bfb5; font-size: 13px;
}

/* profile image */
.rd-profile-img-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}
.rd-profile-img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #fffbeb;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
.rd-profile-img-placeholder {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: #f5f2ec;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid #e8e4dc;
}

/* business image */
.rd-business-img-wrap {
  margin-bottom: 20px;
  border-radius: 14px;
  overflow: hidden;
  border: 1.5px solid #f0ede6;
}
.rd-business-img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  display: block;
}

.rd-empty-note { font-size: 13.5px; color: #bbb; padding: 8px 0; margin: 0; }
`;
