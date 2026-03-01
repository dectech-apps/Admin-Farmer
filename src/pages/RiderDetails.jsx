import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Truck, AlertCircle, ShieldCheck, Clock, ShieldX, MapPin, Phone, Mail, Star, Wallet, CheckCircle, XCircle, Image, User, FileText, X } from 'lucide-react';
import { adminAPI } from '../services/api';

export default function RiderDetails() {
  const { riderId } = useParams();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Verification action states
  const [verifying, setVerifying] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionError, setActionError] = useState('');

  // Image preview modal
  const [previewImage, setPreviewImage] = useState(null);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminAPI.getRiderDetails(riderId);
      console.log('Rider details API response:', response.data);

      // Handle different possible API response structures
      const payload = response.data;
      let data = null;

      if (payload?.data?.rider || payload?.data?.profile) {
        // Structure: { data: { rider: {...}, profile: {...}, ... } }
        data = payload.data;
      } else if (payload?.rider || payload?.profile) {
        // Structure: { rider: {...}, profile: {...}, ... }
        data = payload;
      } else if (payload?.data) {
        // Structure: { data: {...} }
        data = payload.data;
      }

      console.log('Extracted rider details:', data);
      setDetails(data);
    } catch (err) {
      console.error('Error fetching rider details:', err);
      setError(err.response?.data?.message || 'Failed to load rider details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (riderId) {
      fetchDetails();
    }
  }, [riderId]);

  const handleVerify = async () => {
    setVerifying(true);
    setActionError('');
    try {
      await adminAPI.updateRiderVerification(riderId, 'verify');
      await fetchDetails();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to verify rider');
    } finally {
      setVerifying(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setActionError('Please provide a reason for rejection');
      return;
    }
    setVerifying(true);
    setActionError('');
    try {
      await adminAPI.updateRiderVerification(riderId, 'reject', rejectionReason);
      setRejectModal(false);
      setRejectionReason('');
      await fetchDetails();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to reject verification');
    } finally {
      setVerifying(false);
    }
  };

  const getVerificationStatus = () => {
    if (details?.rider?.is_verified) return 'verified';
    if (details?.verification?.status) return details.verification.status;
    return 'not_submitted';
  };

  const renderVerificationBadge = () => {
    const status = getVerificationStatus();
    switch (status) {
      case 'verified':
        return (
          <span className="rdd-badge rdd-badge-verified">
            <ShieldCheck size={14} /> Verified
          </span>
        );
      case 'pending':
      case 'under_review':
        return (
          <span className="rdd-badge rdd-badge-pending">
            <Clock size={14} /> Pending Review
          </span>
        );
      case 'rejected':
        return (
          <span className="rdd-badge rdd-badge-rejected">
            <ShieldX size={14} /> Rejected
          </span>
        );
      default:
        return (
          <span className="rdd-badge rdd-badge-none">
            <ShieldX size={14} /> Not Submitted
          </span>
        );
    }
  };

  return (
    <>
      <style>{styles}</style>

      <div className="rdd-root">
        <Link to="/riders" className="rdd-back">
          <ArrowLeft size={16} /> Back to Riders
        </Link>

        {loading && (
          <div className="rdd-state">
            <div className="rdd-spinner" />
            <p>Loading rider details...</p>
          </div>
        )}

        {error && (
          <div className="rdd-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {!loading && !error && details && (
          <div className="rdd-content">
            {/* Header */}
            <div className="rdd-header-card">
              <div className="rdd-header-icon">
                <Truck size={28} color="#7dd3fc" />
              </div>
              <div className="rdd-header-info">
                <h1 className="rdd-name">{details.profile?.name || '—'}</h1>
                <p className="rdd-email">{details.profile?.email || '—'}</p>
                <div className="rdd-header-badges">
                  {renderVerificationBadge()}
                  <span className={`rdd-badge ${details.rider?.is_available ? 'rdd-badge-online' : 'rdd-badge-offline'}`}>
                    {details.rider?.is_available ? <><CheckCircle size={12} /> Online</> : <><XCircle size={12} /> Offline</>}
                  </span>
                </div>
              </div>
              <div className="rdd-header-stats">
                <div className="rdd-stat">
                  <span className="rdd-stat-value">{details.rider?.total_deliveries || 0}</span>
                  <span className="rdd-stat-label">Deliveries</span>
                </div>
                <div className="rdd-stat">
                  <Star size={16} color="#f59e0b" fill="#f59e0b" />
                  <span className="rdd-stat-value">{parseFloat(details.rider?.rating || 0).toFixed(1)}</span>
                  <span className="rdd-stat-label">Rating</span>
                </div>
              </div>
            </div>

            <div className="rdd-grid">
              {/* Profile Information */}
              <div className="rdd-card">
                <h2 className="rdd-card-title">
                  <User size={18} /> Profile Information
                </h2>
                <div className="rdd-info-grid">
                  <div className="rdd-info-item">
                    <span className="rdd-info-label"><Mail size={14} /> Email</span>
                    <span className="rdd-info-value">{details.profile?.email || '—'}</span>
                  </div>
                  <div className="rdd-info-item">
                    <span className="rdd-info-label"><Phone size={14} /> Phone</span>
                    <span className="rdd-info-value">{details.profile?.phone || '—'}</span>
                  </div>
                  <div className="rdd-info-item full-width">
                    <span className="rdd-info-label"><MapPin size={14} /> Address</span>
                    <span className="rdd-info-value">
                      {details.rider?.address
                        ? `${details.rider.address}${details.rider.city ? ', ' + details.rider.city : ''}${details.rider.region ? ', ' + details.rider.region : ''}`
                        : details.profile?.address || '—'}
                    </span>
                  </div>
                  <div className="rdd-info-item">
                    <span className="rdd-info-label">Joined</span>
                    <span className="rdd-info-value">
                      {details.profile?.created_at
                        ? new Date(details.profile.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                        : '—'}
                    </span>
                  </div>
                  <div className="rdd-info-item">
                    <span className="rdd-info-label">Setup Complete</span>
                    <span className="rdd-info-value">
                      {details.rider?.is_setup_complete ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Vehicle Information */}
              <div className="rdd-card">
                <h2 className="rdd-card-title">
                  <Truck size={18} /> Vehicle Information
                </h2>
                <div className="rdd-info-grid">
                  <div className="rdd-info-item">
                    <span className="rdd-info-label">Vehicle Type</span>
                    <span className="rdd-info-value rdd-vehicle-pill">{details.rider?.vehicle_type || 'Not specified'}</span>
                  </div>
                  <div className="rdd-info-item">
                    <span className="rdd-info-label">License Plate</span>
                    <span className="rdd-info-value">{details.rider?.license_plate || '—'}</span>
                  </div>
                  <div className="rdd-info-item">
                    <span className="rdd-info-label">License Number</span>
                    <span className="rdd-info-value">{details.rider?.license_number || '—'}</span>
                  </div>
                </div>
              </div>

              {/* Wallet Information */}
              <div className="rdd-card">
                <h2 className="rdd-card-title">
                  <Wallet size={18} /> Wallet
                </h2>
                <div className="rdd-info-grid">
                  <div className="rdd-info-item">
                    <span className="rdd-info-label">Balance</span>
                    <span className="rdd-info-value rdd-amount">GH₵ {parseFloat(details.wallet?.balance || 0).toFixed(2)}</span>
                  </div>
                  <div className="rdd-info-item">
                    <span className="rdd-info-label">Total Earned</span>
                    <span className="rdd-info-value rdd-amount">GH₵ {parseFloat(details.wallet?.total_earned || 0).toFixed(2)}</span>
                  </div>
                  <div className="rdd-info-item">
                    <span className="rdd-info-label">Total Withdrawn</span>
                    <span className="rdd-info-value">GH₵ {parseFloat(details.wallet?.total_withdrawn || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Verification Section */}
              <div className="rdd-card rdd-card-verification">
                <h2 className="rdd-card-title">
                  <FileText size={18} /> Identity Verification
                </h2>

                <div className="rdd-verify-status">
                  {renderVerificationBadge()}
                  {details.verification?.submitted_at && (
                    <span className="rdd-verify-date">
                      Submitted: {new Date(details.verification.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  )}
                  {details.verification?.verified_at && (
                    <span className="rdd-verify-date">
                      Verified: {new Date(details.verification.verified_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  )}
                </div>

                {details.verification?.rejection_reason && (
                  <div className="rdd-rejection-reason">
                    <AlertCircle size={14} />
                    <span>Rejection Reason: {details.verification.rejection_reason}</span>
                  </div>
                )}

                {/* Verification Documents */}
                {details.verification && (
                  <div className="rdd-documents">
                    <h3 className="rdd-documents-title">Submitted Documents</h3>
                    <div className="rdd-documents-grid">
                      {details.verification.ghana_card_front_url && (
                        <div className="rdd-document" onClick={() => setPreviewImage(details.verification.ghana_card_front_url)}>
                          <Image size={20} />
                          <span>Ghana Card (Front)</span>
                        </div>
                      )}
                      {details.verification.ghana_card_back_url && (
                        <div className="rdd-document" onClick={() => setPreviewImage(details.verification.ghana_card_back_url)}>
                          <Image size={20} />
                          <span>Ghana Card (Back)</span>
                        </div>
                      )}
                      {details.verification.selfie_url && (
                        <div className="rdd-document" onClick={() => setPreviewImage(details.verification.selfie_url)}>
                          <Image size={20} />
                          <span>Selfie</span>
                        </div>
                      )}
                      {details.verification.license_image_url && (
                        <div className="rdd-document" onClick={() => setPreviewImage(details.verification.license_image_url)}>
                          <Image size={20} />
                          <span>Driver's License</span>
                        </div>
                      )}
                      {details.verification.vehicle_image_url && (
                        <div className="rdd-document" onClick={() => setPreviewImage(details.verification.vehicle_image_url)}>
                          <Image size={20} />
                          <span>Vehicle Photo</span>
                        </div>
                      )}
                    </div>

                    {!details.verification.ghana_card_front_url &&
                     !details.verification.selfie_url &&
                     !details.verification.license_image_url && (
                      <p className="rdd-no-docs">No documents submitted yet</p>
                    )}
                  </div>
                )}

                {!details.verification && (
                  <p className="rdd-no-docs">Rider has not submitted verification documents yet</p>
                )}

                {/* Verification Actions */}
                {details.verification && getVerificationStatus() !== 'verified' && (
                  <div className="rdd-verify-actions">
                    {actionError && (
                      <div className="rdd-action-error">
                        <AlertCircle size={14} /> {actionError}
                      </div>
                    )}
                    <button
                      className="rdd-btn rdd-btn-verify"
                      onClick={handleVerify}
                      disabled={verifying}
                    >
                      <ShieldCheck size={16} />
                      {verifying ? 'Processing...' : 'Approve Verification'}
                    </button>
                    <button
                      className="rdd-btn rdd-btn-reject"
                      onClick={() => setRejectModal(true)}
                      disabled={verifying}
                    >
                      <ShieldX size={16} />
                      Reject
                    </button>
                  </div>
                )}

                {getVerificationStatus() === 'verified' && (
                  <div className="rdd-verified-message">
                    <ShieldCheck size={18} />
                    <span>This rider has been verified and can accept deliveries</span>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Deliveries */}
            {details.recentDeliveries && details.recentDeliveries.length > 0 && (
              <div className="rdd-card rdd-card-full">
                <h2 className="rdd-card-title">Recent Deliveries</h2>
                <div className="rdd-table-wrap">
                  <table className="rdd-table">
                    <thead>
                      <tr>
                        <th>Order #</th>
                        <th>Farm</th>
                        <th>Amount</th>
                        <th>Delivery Fee</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {details.recentDeliveries.map((delivery, idx) => (
                        <tr key={delivery.id || idx}>
                          <td>{delivery.order_number || '—'}</td>
                          <td>{delivery.farm_name || '—'}</td>
                          <td>GH₵ {parseFloat(delivery.total_amount || 0).toFixed(2)}</td>
                          <td>GH₵ {parseFloat(delivery.delivery_fee || 0).toFixed(2)}</td>
                          <td>
                            <span className={`rdd-delivery-status rdd-status-${delivery.delivery_status || 'pending'}`}>
                              {delivery.delivery_status || 'Pending'}
                            </span>
                          </td>
                          <td>
                            {delivery.created_at
                              ? new Date(delivery.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                              : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {!loading && !error && !details && (
          <div className="rdd-state">
            <Truck size={32} color="#ccc" />
            <p>No rider data found</p>
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="rdd-preview-overlay" onClick={() => setPreviewImage(null)}>
          <div className="rdd-preview-content" onClick={e => e.stopPropagation()}>
            <button className="rdd-preview-close" onClick={() => setPreviewImage(null)}>
              <X size={20} />
            </button>
            <img src={previewImage} alt="Document preview" className="rdd-preview-image" />
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="rdd-modal-overlay" onClick={() => setRejectModal(false)}>
          <div className="rdd-modal" onClick={e => e.stopPropagation()}>
            <div className="rdd-modal-header">
              <h2>Reject Verification</h2>
              <button className="rdd-modal-close" onClick={() => setRejectModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="rdd-modal-body">
              <p>Please provide a reason for rejecting this rider's verification:</p>
              <textarea
                className="rdd-textarea"
                placeholder="Enter rejection reason..."
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                rows={4}
              />
              {actionError && (
                <div className="rdd-action-error">
                  <AlertCircle size={14} /> {actionError}
                </div>
              )}
              <div className="rdd-modal-actions">
                <button className="rdd-btn rdd-btn-cancel" onClick={() => setRejectModal(false)}>
                  Cancel
                </button>
                <button
                  className="rdd-btn rdd-btn-reject"
                  onClick={handleReject}
                  disabled={verifying}
                >
                  {verifying ? 'Processing...' : 'Reject Verification'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,600&family=DM+Sans:wght@300;400;500&display=swap');

.rdd-root {
  font-family: 'DM Sans', sans-serif;
  padding: 32px 28px;
  width: 100%;
  min-height: 100vh;
  background: #f5f2ec;
}

.rdd-back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #666;
  text-decoration: none;
  font-size: 14px;
  margin-bottom: 20px;
  transition: color 0.15s;
}
.rdd-back:hover { color: #333; }

.rdd-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 64px 24px;
  color: #bbb;
  font-size: 14px;
  background: #fff;
  border-radius: 16px;
}

.rdd-spinner {
  width: 36px; height: 36px;
  border: 2.5px solid #e8e4dc;
  border-top-color: #0369a1;
  border-radius: 50%;
  animation: rddspin 0.7s linear infinite;
}
@keyframes rddspin { to { transform: rotate(360deg); } }

.rdd-error {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 10px;
  padding: 16px;
  color: #dc2626;
  font-size: 14px;
}

.rdd-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Header Card */
.rdd-header-card {
  background: #fff;
  border-radius: 20px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 4px 20px rgba(0,0,0,0.06);
}
.rdd-header-icon {
  width: 64px; height: 64px;
  background: #0c2340;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.rdd-header-info { flex: 1; }
.rdd-name {
  font-family: 'Fraunces', serif;
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 4px;
}
.rdd-email {
  color: #888;
  font-size: 14px;
  margin: 0 0 12px;
}
.rdd-header-badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.rdd-header-stats {
  display: flex;
  gap: 32px;
}
.rdd-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.rdd-stat-value {
  font-family: 'Fraunces', serif;
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
}
.rdd-stat-label {
  font-size: 12px;
  color: #888;
}

/* Badges */
.rdd-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border-radius: 99px;
  font-size: 12px;
  font-weight: 500;
}
.rdd-badge-verified { background: #dcfce7; color: #166534; }
.rdd-badge-pending { background: #fef3c7; color: #92400e; }
.rdd-badge-rejected { background: #fee2e2; color: #dc2626; }
.rdd-badge-none { background: #f5f5f5; color: #888; }
.rdd-badge-online { background: #dcfce7; color: #166534; }
.rdd-badge-offline { background: #f5f2ec; color: #888; }

/* Grid */
.rdd-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}
@media (max-width: 900px) {
  .rdd-grid { grid-template-columns: 1fr; }
}

/* Cards */
.rdd-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 4px 20px rgba(0,0,0,0.06);
}
.rdd-card-full {
  grid-column: 1 / -1;
}
.rdd-card-verification {
  grid-column: 1 / -1;
}
.rdd-card-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: 'Fraunces', serif;
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 20px;
}

/* Info Grid */
.rdd-info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}
.rdd-info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.rdd-info-item.full-width {
  grid-column: 1 / -1;
}
.rdd-info-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #888;
}
.rdd-info-value {
  font-size: 14px;
  color: #1a1a1a;
}
.rdd-vehicle-pill {
  display: inline-block;
  background: #f5f2ec;
  padding: 4px 10px;
  border-radius: 6px;
  text-transform: capitalize;
}
.rdd-amount {
  font-family: 'Fraunces', serif;
  font-weight: 600;
  font-size: 16px;
  color: #166534;
}

/* Verification Section */
.rdd-verify-status {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.rdd-verify-date {
  font-size: 12px;
  color: #888;
}
.rdd-rejection-reason {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 12px;
  color: #dc2626;
  font-size: 13px;
  margin-bottom: 16px;
}

/* Documents */
.rdd-documents {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0ede6;
}
.rdd-documents-title {
  font-size: 14px;
  font-weight: 600;
  color: #555;
  margin: 0 0 12px;
}
.rdd-documents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
}
.rdd-document {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px 12px;
  background: #faf9f6;
  border: 1.5px solid #e8e4dc;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.15s;
  color: #555;
  font-size: 12px;
  text-align: center;
}
.rdd-document:hover {
  background: #f5f2ec;
  border-color: #0369a1;
  color: #0369a1;
}
.rdd-no-docs {
  color: #888;
  font-size: 14px;
  text-align: center;
  padding: 20px;
}

/* Verify Actions */
.rdd-verify-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
  flex-wrap: wrap;
}
.rdd-action-error {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  color: #dc2626;
  font-size: 13px;
  margin-bottom: 8px;
}
.rdd-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 500;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s;
}
.rdd-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.rdd-btn-verify {
  background: #166534;
  color: #fff;
}
.rdd-btn-verify:hover:not(:disabled) { background: #15803d; }
.rdd-btn-reject {
  background: #dc2626;
  color: #fff;
}
.rdd-btn-reject:hover:not(:disabled) { background: #b91c1c; }
.rdd-btn-cancel {
  background: #f5f2ec;
  color: #666;
}
.rdd-btn-cancel:hover:not(:disabled) { background: #e8e4dc; }

.rdd-verified-message {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #dcfce7;
  color: #166534;
  padding: 16px;
  border-radius: 10px;
  font-size: 14px;
  margin-top: 16px;
}

/* Table */
.rdd-table-wrap {
  overflow-x: auto;
}
.rdd-table {
  width: 100%;
  border-collapse: collapse;
}
.rdd-table th {
  padding: 12px 16px;
  text-align: left;
  font-size: 11px;
  font-weight: 500;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: #faf9f6;
  border-bottom: 1px solid #f0ede6;
}
.rdd-table td {
  padding: 14px 16px;
  font-size: 13px;
  color: #333;
  border-bottom: 1px solid #f7f5f1;
}
.rdd-table tr:last-child td {
  border-bottom: none;
}
.rdd-delivery-status {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  text-transform: capitalize;
}
.rdd-status-delivered { background: #dcfce7; color: #166534; }
.rdd-status-pending { background: #fef3c7; color: #92400e; }
.rdd-status-assigned { background: #e0f2fe; color: #0369a1; }
.rdd-status-picked_up { background: #dbeafe; color: #1d4ed8; }

/* Image Preview Modal */
.rdd-preview-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}
.rdd-preview-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
}
.rdd-preview-close {
  position: absolute;
  top: -40px;
  right: 0;
  background: rgba(255,255,255,0.2);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #fff;
  transition: background 0.15s;
}
.rdd-preview-close:hover { background: rgba(255,255,255,0.3); }
.rdd-preview-image {
  max-width: 100%;
  max-height: 85vh;
  border-radius: 8px;
}

/* Reject Modal */
.rdd-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}
.rdd-modal {
  background: #fff;
  border-radius: 16px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 25px 50px rgba(0,0,0,0.25);
}
.rdd-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #f0ede6;
}
.rdd-modal-header h2 {
  font-family: 'Fraunces', serif;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}
.rdd-modal-close {
  width: 36px; height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f2ec;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  color: #666;
  transition: all 0.15s;
}
.rdd-modal-close:hover {
  background: #e8e4dc;
  color: #333;
}
.rdd-modal-body {
  padding: 24px;
}
.rdd-modal-body p {
  margin: 0 0 16px;
  color: #555;
  font-size: 14px;
}
.rdd-textarea {
  width: 100%;
  padding: 12px;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  border: 1.5px solid #e8e4dc;
  border-radius: 10px;
  background: #faf9f6;
  resize: vertical;
  outline: none;
  transition: border-color 0.15s;
}
.rdd-textarea:focus {
  border-color: #0369a1;
  background: #fff;
}
.rdd-modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
}
`;
