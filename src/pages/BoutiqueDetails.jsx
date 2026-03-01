import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft, ShoppingBag, Mail, Phone, MapPin, Calendar,
  Building2, Globe, CheckCircle, XCircle, Clock,
  Wallet, TrendingUp, ArrowDownToLine, ShieldCheck, ShieldX, ShieldAlert,
  AlertCircle, Star, DollarSign, Truck, User,
} from 'lucide-react';
import { adminAPI } from '../services/api';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function currency(value) {
  return Number(value || 0).toLocaleString();
}

const VERIFY_META = {
  verified: { label: 'Verified',  bg: '#f3e8ff', color: '#8b5cf6', icon: ShieldCheck },
  approved: { label: 'Approved',  bg: '#f3e8ff', color: '#8b5cf6', icon: ShieldCheck },
  pending:  { label: 'Pending',   bg: '#fef9ec', color: '#b45309', icon: ShieldAlert },
  rejected: { label: 'Rejected',  bg: '#fff1f2', color: '#be123c', icon: ShieldX },
};

export default function BoutiqueDetails() {
  const { boutiqueId } = useParams();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);

  const assetBase = useMemo(() => {
    const apiUrl = import.meta.env.VITE_API_URL || '';
    const base = apiUrl.replace(/\/api\/v1\/?$/, '');
    return base || '';
  }, []);

  const toAssetUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    return assetBase ? `${assetBase}${cleanUrl}` : cleanUrl;
  };

  const fetchDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminAPI.getBoutiqueDetails(boutiqueId);
      setDetails(response.data?.data || null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load boutique details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [boutiqueId]);

  const handleVerification = async () => {
    const boutique = details?.boutique;
    if (!boutique?.id) return;

    const nextVerified = !boutique.is_verified;
    setVerifying(true);
    try {
      await adminAPI.updateBoutiqueVerification(boutique.id, nextVerified);
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
      <div className="bd-state-wrap">
        <div className="bd-spinner" />
        <p>Loading boutique details...</p>
      </div>
    </>
  );

  if (error) return (
    <>
      <style>{styles}</style>
      <div className="bd-root">
        <Link to="/boutiques" className="bd-back">
          <ArrowLeft size={15} /> Back to Boutiques
        </Link>
        <div className="bd-error">
          <AlertCircle size={16} />
          {error}
        </div>
      </div>
    </>
  );

  const boutique     = details?.boutique || {};
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

      <div className="bd-root">

        {/* Back + header */}
        <div>
          <Link to="/boutiques" className="bd-back">
            <ArrowLeft size={15} /> Back to Boutiques
          </Link>
          <div className="bd-page-header">
            <div className="bd-page-icon">
              <ShoppingBag size={24} color="#8b5cf6" />
            </div>
            <div>
              <h1 className="bd-title">{boutique.name || 'Boutique Details'}</h1>
              <p className="bd-sub">Business details, wallet and verification info</p>
            </div>
            {boutique.is_verified && (
              <span className="bd-header-badge">
                <ShieldCheck size={14} /> Verified
              </span>
            )}
          </div>
        </div>

        {/* Quick stats */}
        <div className="bd-grid-4">
          {[
            { label: 'Rating',           value: `${parseFloat(boutique.rating || 0).toFixed(1)}`,  icon: Star,       accent: '#8b5cf6', bg: '#f3e8ff' },
            { label: 'Reviews',          value: boutique.review_count || 0,                        icon: Star,       accent: '#8b5cf6', bg: '#f3e8ff' },
            { label: 'Delivery Fee',     value: `$${currency(boutique.delivery_fee)}`,             icon: Truck,      accent: '#0369a1', bg: '#f0f9ff' },
            { label: 'Min Order',        value: `$${currency(boutique.minimum_order)}`,            icon: DollarSign, accent: '#7c3aed', bg: '#faf5ff' },
          ].map(c => {
            const Icon = c.icon;
            return (
              <div className="bd-stat-card" key={c.label}>
                <div className="bd-stat-icon" style={{ background: c.bg }}>
                  <Icon size={16} color={c.accent} />
                </div>
                <div>
                  <p className="bd-stat-label">{c.label}</p>
                  <p className="bd-stat-value" style={{ color: c.accent }}>{c.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Wallet cards */}
        <div className="bd-grid-3">
          {[
            { label: 'Wallet Balance',   value: `$${currency(wallet.balance)}`,        icon: Wallet,          accent: '#8b5cf6', bg: '#f3e8ff' },
            { label: 'Total Earned',     value: `$${currency(wallet.total_earned)}`,    icon: TrendingUp,      accent: '#22c55e', bg: '#f0fdf4' },
            { label: 'Total Withdrawn',  value: `$${currency(wallet.total_withdrawn)}`, icon: ArrowDownToLine, accent: '#0369a1', bg: '#e0f2fe' },
          ].map(c => {
            const Icon = c.icon;
            return (
              <div className="bd-wallet-card" key={c.label}>
                <div className="bd-wallet-icon" style={{ background: c.bg }}>
                  <Icon size={18} color={c.accent} />
                </div>
                <div>
                  <p className="bd-wallet-label">{c.label}</p>
                  <p className="bd-wallet-value" style={{ color: c.accent }}>{c.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Boutique + Owner */}
        <div className="bd-grid-2">

          {/* Boutique details */}
          <section className="bd-card">
            <div className="bd-section-head">
              <div className="bd-section-icon" style={{ background: '#f3e8ff' }}>
                <ShoppingBag size={15} color="#8b5cf6" />
              </div>
              <h2 className="bd-section-title">Boutique Details</h2>
            </div>

            {/* Boutique Image */}
            {boutique.image_url && (
              <div className="bd-business-img-wrap">
                <img
                  src={toAssetUrl(boutique.image_url)}
                  alt={boutique.name}
                  className="bd-business-img"
                  onError={(e) => { e.target.parentElement.style.display = 'none'; }}
                />
              </div>
            )}

            <div className="bd-rows">
              <div className="bd-row">
                <ShoppingBag size={14} color="#c4bfb5" />
                <span className="bd-row-label">Name</span>
                <span className="bd-row-val">{boutique.name || '—'}</span>
              </div>
              <div className="bd-row">
                <Globe size={14} color="#c4bfb5" />
                <span className="bd-row-label">Fashion Categories</span>
                <span className="bd-row-val">
                  {boutique.fashion_categories?.length
                    ? boutique.fashion_categories.map(c => (
                        <span key={c} className="bd-tag">{c}</span>
                      ))
                    : '—'}
                </span>
              </div>
              <div className="bd-row">
                <Mail size={14} color="#c4bfb5" />
                <span className="bd-row-label">Business Email</span>
                <span className="bd-row-val">{boutique.business_email || '—'}</span>
              </div>
              <div className="bd-row">
                <Phone size={14} color="#c4bfb5" />
                <span className="bd-row-label">Business Phone</span>
                <span className="bd-row-val">{boutique.business_phone || '—'}</span>
              </div>
              <div className="bd-row">
                <MapPin size={14} color="#c4bfb5" />
                <span className="bd-row-label">Street Address</span>
                <span className="bd-row-val">{boutique.street_address || '—'}</span>
              </div>
              <div className="bd-row">
                <span style={{ width: 14 }} />
                <span className="bd-row-label">City</span>
                <span className="bd-row-val">{boutique.city || '—'}</span>
              </div>
              <div className="bd-row">
                <span style={{ width: 14 }} />
                <span className="bd-row-label">State</span>
                <span className="bd-row-val">{boutique.state || '—'}</span>
              </div>
              <div className="bd-row">
                <span style={{ width: 14 }} />
                <span className="bd-row-label">Zipcode</span>
                <span className="bd-row-val">{boutique.zipcode || '—'}</span>
              </div>
              <div className="bd-row">
                <span style={{ width: 14 }} />
                <span className="bd-row-label">Country</span>
                <span className="bd-row-val">{boutique.country || '—'}</span>
              </div>
              <div className="bd-row">
                <span style={{ width: 14 }} />
                <span className="bd-row-label">Online</span>
                <span className={`bd-pill ${boutique.is_online ? 'bd-pill-green' : 'bd-pill-grey'}`}>
                  {boutique.is_online
                    ? <><CheckCircle size={11} /> Online</>
                    : <><XCircle size={11} /> Offline</>}
                </span>
              </div>
              <div className="bd-row">
                <span style={{ width: 14 }} />
                <span className="bd-row-label">Setup Complete</span>
                <span className={`bd-pill ${boutique.is_setup_complete ? 'bd-pill-green' : 'bd-pill-grey'}`}>
                  {boutique.is_setup_complete
                    ? <><CheckCircle size={11} /> Complete</>
                    : <><XCircle size={11} /> Incomplete</>}
                </span>
              </div>
            </div>

            {/* Operating hours */}
            {details?.operatingHours?.length > 0 && (
              <div className="bd-hours-wrap">
                <div className="bd-section-head" style={{ marginBottom: 12 }}>
                  <div className="bd-section-icon" style={{ background: '#fef9ec' }}>
                    <Clock size={14} color="#b45309" />
                  </div>
                  <h3 className="bd-section-title" style={{ fontSize: 14 }}>Operating Hours</h3>
                </div>
                <div className="bd-hours-grid">
                  {details.operatingHours.map(slot => (
                    <div key={slot.day_of_week} className={`bd-hour-slot ${slot.is_open ? 'bd-hour-open' : 'bd-hour-closed'}`}>
                      <span className="bd-hour-day">{DAY_LABELS[slot.day_of_week] || `D${slot.day_of_week}`}</span>
                      <span className="bd-hour-time">
                        {slot.is_open ? `${slot.open_time || '--'} – ${slot.close_time || '--'}` : 'Closed'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Owner details */}
          <section className="bd-card">
            <div className="bd-section-head">
              <div className="bd-section-icon" style={{ background: '#eff6ff' }}>
                <Building2 size={15} color="#1d4ed8" />
              </div>
              <h2 className="bd-section-title">Owner Details</h2>
            </div>

            {/* Owner Profile Image */}
            <div className="bd-profile-img-wrap">
              {owner.profile_image ? (
                <img
                  src={toAssetUrl(owner.profile_image)}
                  alt={owner.name}
                  className="bd-profile-img"
                  onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                />
              ) : null}
              <div className="bd-profile-img-placeholder" style={{ display: owner.profile_image ? 'none' : 'flex' }}>
                <User size={32} color="#c4bfb5" />
              </div>
            </div>

            <div className="bd-rows">
              <div className="bd-row">
                <Building2 size={14} color="#c4bfb5" />
                <span className="bd-row-label">Name</span>
                <span className="bd-row-val">{owner.name || '—'}</span>
              </div>
              <div className="bd-row">
                <Mail size={14} color="#c4bfb5" />
                <span className="bd-row-label">Email</span>
                <span className="bd-row-val">{owner.email || '—'}</span>
              </div>
              <div className="bd-row">
                <Phone size={14} color="#c4bfb5" />
                <span className="bd-row-label">Phone</span>
                <span className="bd-row-val">{owner.phone || '—'}</span>
              </div>
              <div className="bd-row">
                <Calendar size={14} color="#c4bfb5" />
                <span className="bd-row-label">Joined</span>
                <span className="bd-row-val">
                  {boutique.created_at
                    ? new Date(boutique.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                    : '—'}
                </span>
              </div>
            </div>

            {/* Description */}
            {boutique.description && (
              <div className="bd-desc-wrap">
                <h4 className="bd-desc-title">Description</h4>
                <p className="bd-desc-text">{boutique.description}</p>
              </div>
            )}

            {/* Bio */}
            {boutique.bio && (
              <div className="bd-desc-wrap">
                <h4 className="bd-desc-title">Bio</h4>
                <p className="bd-desc-text">{boutique.bio}</p>
              </div>
            )}
          </section>
        </div>

        {/* Verification */}
        <section className="bd-card">
          <div className="bd-section-head">
            <div className="bd-section-icon" style={{ background: vMeta.bg }}>
              <VIcon size={15} color={vMeta.color} />
            </div>
            <h2 className="bd-section-title">Verification Details</h2>
            {verification && (
              <span className="bd-verify-badge" style={{ background: vMeta.bg, color: vMeta.color }}>
                {vMeta.label}
              </span>
            )}
          </div>

          {/* Verify/Unverify Button */}
          <div className="bd-verify-actions">
            <button
              onClick={handleVerification}
              disabled={verifying}
              className={`bd-verify-btn ${boutique.is_verified ? 'bd-verify-btn-unverify' : 'bd-verify-btn-verify'}`}
            >
              {verifying ? (
                <span className="bd-btn-spinner" />
              ) : boutique.is_verified ? (
                <ShieldX size={16} />
              ) : (
                <ShieldCheck size={16} />
              )}
              {boutique.is_verified ? 'Unverify Boutique' : 'Verify Boutique'}
            </button>
            <p className="bd-verify-hint">
              {boutique.is_verified
                ? 'Click to remove verification status from this boutique'
                : 'Click to verify this boutique and grant verified badge'}
            </p>
          </div>

          {!verification ? (
            <p className="bd-empty-note">No verification documents submitted yet.</p>
          ) : (
            <>
              <div className="bd-grid-3" style={{ marginBottom: 20 }}>
                {[
                  { label: 'Status',       value: verification.status || 'pending' },
                  { label: 'Submitted',    value: verification.submitted_at ? new Date(verification.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—' },
                  { label: 'Verified At',  value: verification.verified_at  ? new Date(verification.verified_at).toLocaleDateString('en-US',  { month: 'short', day: 'numeric', year: 'numeric' }) : '—' },
                ].map(item => (
                  <div key={item.label} className="bd-info-tile">
                    <p className="bd-info-label">{item.label}</p>
                    <p className="bd-info-value">{item.value}</p>
                  </div>
                ))}
              </div>

              {verification.rejection_reason && (
                <div className="bd-rejection">
                  <AlertCircle size={15} />
                  <span><strong>Rejection reason:</strong> {verification.rejection_reason}</span>
                </div>
              )}

              <div className="bd-docs-grid">
                {docs.map(doc => {
                  const docUrl = toAssetUrl(doc.url);
                  return (
                    <div key={doc.label} className="bd-doc-card">
                      <p className="bd-doc-label">{doc.label}</p>
                      {docUrl ? (
                        <a href={docUrl} target="_blank" rel="noreferrer" className="bd-doc-img-wrap">
                          <img src={docUrl} alt={doc.label} className="bd-doc-img" />
                          <div className="bd-doc-overlay">View full</div>
                        </a>
                      ) : (
                        <div className="bd-doc-empty">Not uploaded</div>
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

.bd-root {
  font-family: 'DM Sans', sans-serif;
  padding: 32px 28px;
  max-width: 1100px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-height: 100vh;
  background: #f5f2ec;
}

.bd-state-wrap {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 14px; height: 320px;
  font-family: 'DM Sans', sans-serif;
  color: #bbb; font-size: 14px;
  background: #f5f2ec;
}
.bd-spinner {
  width: 40px; height: 40px;
  border: 3px solid #e8e4dc;
  border-top-color: #8b5cf6;
  border-radius: 50%;
  animation: bdspin 0.7s linear infinite;
}
@keyframes bdspin { to { transform: rotate(360deg); } }

.bd-error {
  display: flex; align-items: center; gap: 10px;
  background: #fff5f5; border: 1px solid #fecdd3;
  border-radius: 14px; padding: 16px 20px;
  color: #be123c; font-size: 14px;
}

/* back link */
.bd-back {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 13px; font-weight: 500;
  color: #888; text-decoration: none;
  margin-bottom: 16px;
  transition: color 0.15s;
}
.bd-back:hover { color: #1a2e1a; }

/* page header */
.bd-page-header { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
.bd-page-icon {
  width: 52px; height: 52px;
  background: #1a2e1a;
  border-radius: 16px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 6px 20px rgba(26,46,26,0.28);
}
.bd-title {
  font-family: 'Fraunces', serif;
  font-size: 26px; font-weight: 600;
  color: #1a2e1a; margin: 0 0 3px;
}
.bd-sub { font-size: 13.5px; color: #999; margin: 0; }
.bd-header-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #f3e8ff;
  color: #8b5cf6;
  font-size: 12px;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: 99px;
  margin-left: auto;
}

/* grids */
.bd-grid-4 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}
@media (min-width: 768px) { .bd-grid-4 { grid-template-columns: repeat(4, 1fr); } }

.bd-grid-3 {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 16px;
}
@media (min-width: 640px) { .bd-grid-3 { grid-template-columns: repeat(3, 1fr); } }

.bd-grid-2 {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}
@media (min-width: 1024px) { .bd-grid-2 { grid-template-columns: 1fr 1fr; } }

/* stat cards */
.bd-stat-card {
  background: #fff;
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04);
  display: flex; align-items: center; gap: 12px;
}
.bd-stat-icon {
  width: 38px; height: 38px;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.bd-stat-label { font-size: 11.5px; color: #999; margin: 0 0 3px; }
.bd-stat-value {
  font-family: 'Fraunces', serif;
  font-size: 18px; font-weight: 600; margin: 0; line-height: 1;
}

/* wallet cards */
.bd-wallet-card {
  background: #fff;
  border-radius: 18px;
  padding: 20px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.05);
  display: flex; align-items: center; gap: 14px;
  transition: transform 0.2s, box-shadow 0.2s;
}
.bd-wallet-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.09); }
.bd-wallet-icon {
  width: 44px; height: 44px;
  border-radius: 13px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.bd-wallet-label { font-size: 12.5px; color: #999; margin: 0 0 4px; }
.bd-wallet-value {
  font-family: 'Fraunces', serif;
  font-size: 24px; font-weight: 600; margin: 0; line-height: 1;
}

/* card */
.bd-card {
  background: #fff;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 4px 20px rgba(0,0,0,0.06);
}

/* section head */
.bd-section-head {
  display: flex; align-items: center; gap: 10px;
  margin-bottom: 20px;
}
.bd-section-icon {
  width: 32px; height: 32px;
  border-radius: 9px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.bd-section-title {
  font-family: 'Fraunces', serif;
  font-size: 16px; font-weight: 600;
  color: #1a2e1a; margin: 0; flex: 1;
}

/* rows */
.bd-rows { display: flex; flex-direction: column; gap: 0; }
.bd-row {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 11px 0;
  border-bottom: 1px solid #f7f5f1;
  font-size: 13.5px;
}
.bd-row:last-child { border-bottom: none; }
.bd-row-label { color: #aaa; min-width: 120px; flex-shrink: 0; }
.bd-row-val {
  color: #333; font-weight: 500;
  display: flex; align-items: center; gap: 5px; flex-wrap: wrap;
}

/* tags */
.bd-tag {
  display: inline-block;
  background: #f3e8ff; color: #8b5cf6;
  font-size: 12px; font-weight: 500;
  padding: 2px 8px; border-radius: 6px;
}

/* pill */
.bd-pill {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 4px 10px; border-radius: 99px;
  font-size: 12px; font-weight: 500;
}
.bd-pill-green { background: #f0fdf4; color: #22c55e; }
.bd-pill-grey  { background: #f5f2ec; color: #999; }

/* operating hours */
.bd-hours-wrap {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0ede6;
}
.bd-hours-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}
@media (min-width: 640px) { .bd-hours-grid { grid-template-columns: repeat(7, 1fr); } }

.bd-hour-slot {
  border-radius: 10px;
  padding: 8px 6px;
  text-align: center;
}
.bd-hour-open   { background: #f3e8ff; }
.bd-hour-closed { background: #f9f8f6; }
.bd-hour-day {
  display: block;
  font-size: 11px; font-weight: 600;
  letter-spacing: 0.04em;
  margin-bottom: 4px;
}
.bd-hour-open .bd-hour-day   { color: #8b5cf6; }
.bd-hour-closed .bd-hour-day { color: #bbb; }
.bd-hour-time {
  display: block;
  font-size: 10px; line-height: 1.3;
}
.bd-hour-open .bd-hour-time   { color: #555; }
.bd-hour-closed .bd-hour-time { color: #ccc; }

/* desc */
.bd-desc-wrap {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #f0ede6;
}
.bd-desc-title {
  font-size: 13px;
  font-weight: 600;
  color: #666;
  margin: 0 0 8px;
}
.bd-desc-text {
  font-size: 13.5px;
  color: #555;
  line-height: 1.6;
  margin: 0;
}

/* verify badge */
.bd-verify-badge {
  font-size: 12px; font-weight: 600;
  padding: 4px 12px; border-radius: 99px;
  text-transform: capitalize;
}

/* verify actions */
.bd-verify-actions {
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0ede6;
}
.bd-verify-btn {
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
.bd-verify-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
.bd-verify-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.bd-verify-btn-verify {
  background: #8b5cf6;
  color: #fff;
}
.bd-verify-btn-unverify {
  background: #fef2f2;
  color: #dc2626;
  border: 1.5px solid #fecaca;
}
.bd-verify-btn-unverify:hover:not(:disabled) {
  background: #fee2e2;
}
.bd-verify-hint {
  font-size: 12.5px;
  color: #999;
  margin: 10px 0 0;
}
.bd-btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: bdspin 0.6s linear infinite;
}

/* info tiles */
.bd-info-tile {
  background: #faf9f6;
  border-radius: 12px;
  padding: 14px 16px;
}
.bd-info-label { font-size: 12px; color: #aaa; margin: 0 0 5px; }
.bd-info-value {
  font-size: 14px; font-weight: 600;
  color: #222; margin: 0; text-transform: capitalize;
}

/* rejection */
.bd-rejection {
  display: flex; align-items: flex-start; gap: 10px;
  background: #fff5f5; border: 1px solid #fecdd3;
  border-radius: 12px; padding: 12px 16px;
  color: #be123c; font-size: 13.5px;
  margin-bottom: 20px;
}

/* docs */
.bd-docs-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 16px;
}
@media (min-width: 640px) { .bd-docs-grid { grid-template-columns: repeat(3, 1fr); } }

.bd-doc-card {
  border-radius: 14px;
  border: 1.5px solid #f0ede6;
  overflow: hidden;
  background: #faf9f6;
}
.bd-doc-label {
  font-size: 12.5px; font-weight: 600;
  color: #555;
  padding: 10px 14px;
  border-bottom: 1px solid #f0ede6;
}
.bd-doc-img-wrap {
  display: block;
  position: relative;
  overflow: hidden;
}
.bd-doc-img {
  width: 100%; height: 180px;
  object-fit: cover;
  display: block;
  transition: transform 0.3s;
}
.bd-doc-img-wrap:hover .bd-doc-img { transform: scale(1.04); }
.bd-doc-overlay {
  position: absolute;
  inset: 0;
  background: rgba(26,46,26,0);
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 600;
  opacity: 0;
  transition: background 0.2s, opacity 0.2s;
}
.bd-doc-img-wrap:hover .bd-doc-overlay {
  background: rgba(26,46,26,0.45);
  opacity: 1;
}
.bd-doc-empty {
  height: 180px;
  display: flex; align-items: center; justify-content: center;
  color: #c4bfb5; font-size: 13px;
}

/* profile image */
.bd-profile-img-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}
.bd-profile-img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #f3e8ff;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
.bd-profile-img-placeholder {
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
.bd-business-img-wrap {
  margin-bottom: 20px;
  border-radius: 14px;
  overflow: hidden;
  border: 1.5px solid #f0ede6;
}
.bd-business-img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  display: block;
}

.bd-empty-note { font-size: 13.5px; color: #bbb; padding: 8px 0; margin: 0; }
`;
