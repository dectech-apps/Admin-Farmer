import { useState } from 'react';
import { Leaf, UserX, ArrowLeft, AlertTriangle, CheckCircle, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DeleteAccount() {
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!confirmed) {
      setError('Please confirm that you understand the consequences of account deletion.');
      return;
    }

    setLoading(true);

    // Simulate API call - replace with actual API endpoint
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSubmitted(true);
    } catch (err) {
      setError('Failed to submit request. Please try again or contact support.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;1,9..144,300&family=DM+Sans:wght@300;400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .da-root {
          min-height: 100vh;
          font-family: 'DM Sans', sans-serif;
          background: #f5f2ec;
        }

        .da-header {
          background: #1a2e1a;
          color: #fff;
          padding: 32px 24px;
          position: relative;
          overflow: hidden;
        }

        .da-header::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 60% 50% at 80% 10%, rgba(74,124,57,0.35) 0%, transparent 70%),
            radial-gradient(ellipse 50% 60% at 10% 90%, rgba(34,85,34,0.4) 0%, transparent 60%);
          pointer-events: none;
        }

        .da-header-inner {
          max-width: 600px;
          margin: 0 auto;
          position: relative;
        }

        .da-back {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: rgba(255,255,255,0.7);
          text-decoration: none;
          font-size: 14px;
          margin-bottom: 24px;
          transition: color 0.2s;
        }

        .da-back:hover { color: #fff; }

        .da-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
        }

        .da-brand-icon {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .da-brand-name {
          font-family: 'Fraunces', serif;
          font-size: 20px;
          font-weight: 600;
        }

        .da-title {
          font-family: 'Fraunces', serif;
          font-size: clamp(24px, 4vw, 32px);
          font-weight: 300;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .da-title-icon {
          width: 48px;
          height: 48px;
          background: rgba(239,68,68,0.2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .da-subtitle {
          margin-top: 12px;
          font-size: 14px;
          color: rgba(255,255,255,0.6);
          max-width: 400px;
        }

        .da-content {
          max-width: 600px;
          margin: 0 auto;
          padding: 40px 24px 60px;
        }

        .da-card {
          background: #fff;
          border-radius: 20px;
          padding: 32px 28px;
          box-shadow:
            0 1px 2px rgba(0,0,0,0.04),
            0 4px 24px rgba(0,0,0,0.07);
        }

        @media (min-width: 640px) {
          .da-card { padding: 40px 44px; }
        }

        .da-warning {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          background: #fef3c7;
          border: 1px solid #fcd34d;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 28px;
        }

        .da-warning-icon {
          flex-shrink: 0;
          width: 40px;
          height: 40px;
          background: #f59e0b;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .da-warning-title {
          font-weight: 500;
          color: #92400e;
          margin-bottom: 4px;
        }

        .da-warning-text {
          font-size: 14px;
          color: #a16207;
          line-height: 1.5;
        }

        .da-info {
          margin-bottom: 28px;
        }

        .da-info-title {
          font-family: 'Fraunces', serif;
          font-size: 18px;
          font-weight: 600;
          color: #1a2e1a;
          margin-bottom: 12px;
        }

        .da-info-text {
          font-size: 15px;
          color: #555;
          line-height: 1.7;
          margin-bottom: 12px;
        }

        .da-info-list {
          list-style: none;
          padding: 0;
          margin: 12px 0 0;
        }

        .da-info-list li {
          position: relative;
          padding-left: 24px;
          margin-bottom: 10px;
          font-size: 14px;
          color: #666;
          line-height: 1.5;
        }

        .da-info-list li::before {
          content: '';
          position: absolute;
          left: 0;
          top: 8px;
          width: 8px;
          height: 8px;
          background: #ef4444;
          border-radius: 50%;
        }

        .da-form { display: flex; flex-direction: column; gap: 20px; }

        .da-field { display: flex; flex-direction: column; gap: 7px; }

        .da-label {
          font-size: 13px;
          font-weight: 500;
          color: #444;
          letter-spacing: 0.01em;
        }

        .da-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .da-input-icon {
          position: absolute;
          left: 14px;
          color: #aaa;
          display: flex;
          align-items: center;
          pointer-events: none;
          transition: color 0.2s;
        }

        .da-input {
          width: 100%;
          padding: 13px 14px 13px 42px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14.5px;
          font-weight: 400;
          color: #111;
          background: #f9f8f6;
          border: 1.5px solid #e4e0d8;
          border-radius: 12px;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }

        .da-input::placeholder { color: #c2bdb3; }

        .da-input:focus {
          border-color: #2d5a27;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(45,90,39,0.1);
        }

        .da-input-wrap:focus-within .da-input-icon { color: #2d5a27; }

        .da-textarea {
          width: 100%;
          min-height: 100px;
          padding: 13px 14px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14.5px;
          color: #111;
          background: #f9f8f6;
          border: 1.5px solid #e4e0d8;
          border-radius: 12px;
          outline: none;
          resize: vertical;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }

        .da-textarea::placeholder { color: #c2bdb3; }

        .da-textarea:focus {
          border-color: #2d5a27;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(45,90,39,0.1);
        }

        .da-checkbox-wrap {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 12px;
        }

        .da-checkbox {
          width: 20px;
          height: 20px;
          margin-top: 2px;
          accent-color: #ef4444;
          cursor: pointer;
        }

        .da-checkbox-label {
          font-size: 14px;
          color: #991b1b;
          line-height: 1.5;
          cursor: pointer;
        }

        .da-error {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 12px;
          padding: 12px 14px;
          color: #be123c;
          font-size: 13.5px;
          line-height: 1.5;
        }

        .da-btn {
          margin-top: 4px;
          width: 100%;
          padding: 14px;
          background: #dc2626;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 500;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 14px rgba(220,38,38,0.25);
        }

        .da-btn:hover:not(:disabled) {
          background: #b91c1c;
          box-shadow: 0 6px 20px rgba(220,38,38,0.32);
          transform: translateY(-1px);
        }

        .da-btn:active:not(:disabled) { transform: translateY(0); }

        .da-btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .da-btn-inner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .da-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .da-success {
          text-align: center;
          padding: 20px 0;
        }

        .da-success-icon {
          width: 64px;
          height: 64px;
          background: #dcfce7;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
        }

        .da-success-title {
          font-family: 'Fraunces', serif;
          font-size: 22px;
          font-weight: 600;
          color: #1a2e1a;
          margin-bottom: 12px;
        }

        .da-success-text {
          font-size: 15px;
          color: #555;
          line-height: 1.7;
          max-width: 400px;
          margin: 0 auto;
        }

        .da-footer {
          text-align: center;
          margin-top: 32px;
          font-size: 13px;
          color: #999;
        }

        .da-alternative {
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid #e5e5e5;
        }

        .da-alternative-title {
          font-size: 14px;
          font-weight: 500;
          color: #333;
          margin-bottom: 8px;
        }

        .da-alternative-text {
          font-size: 14px;
          color: #666;
          line-height: 1.6;
        }

        .da-alternative-link {
          color: #1a2e1a;
          font-weight: 500;
          text-decoration: none;
        }

        .da-alternative-link:hover { text-decoration: underline; }
      `}</style>

      <div className="da-root">
        <header className="da-header">
          <div className="da-header-inner">
            <Link to="/login" className="da-back">
              <ArrowLeft size={16} />
              Back to Login
            </Link>
            <div className="da-brand">
              <div className="da-brand-icon">
                <Leaf size={20} color="#a3d977" />
              </div>
              <span className="da-brand-name">DoorStep</span>
            </div>
            <h1 className="da-title">
              <span className="da-title-icon">
                <UserX size={24} color="#ef4444" />
              </span>
              Delete Account
            </h1>
            <p className="da-subtitle">
              Request permanent deletion of your DoorStep account and associated data
            </p>
          </div>
        </header>

        <main className="da-content">
          <div className="da-card">
            {!submitted ? (
              <>
                <div className="da-warning">
                  <div className="da-warning-icon">
                    <AlertTriangle size={20} color="#fff" />
                  </div>
                  <div>
                    <p className="da-warning-title">This action is permanent</p>
                    <p className="da-warning-text">
                      Once your account is deleted, all your data will be permanently removed and cannot be recovered.
                    </p>
                  </div>
                </div>

                <div className="da-info">
                  <h2 className="da-info-title">What happens when you delete your account?</h2>
                  <p className="da-info-text">
                    When you submit a deletion request, the following will be permanently removed:
                  </p>
                  <ul className="da-info-list">
                    <li>Your profile information and account credentials</li>
                    <li>Order history and transaction records</li>
                    <li>Saved addresses and payment methods</li>
                    <li>Preferences and settings</li>
                    <li>Any wallet balance or credits (non-refundable)</li>
                  </ul>
                  <p className="da-info-text" style={{ marginTop: '16px' }}>
                    Your deletion request will be processed within 30 days. Some information may be retained for legal compliance purposes.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="da-form">
                  <div className="da-field">
                    <label className="da-label" htmlFor="email">Email address associated with your account</label>
                    <div className="da-input-wrap">
                      <span className="da-input-icon"><Mail size={16} /></span>
                      <input
                        id="email"
                        type="email"
                        className="da-input"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="da-field">
                    <label className="da-label" htmlFor="reason">Reason for leaving (optional)</label>
                    <textarea
                      id="reason"
                      className="da-textarea"
                      placeholder="Help us improve by sharing why you're leaving..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    />
                  </div>

                  <div className="da-checkbox-wrap">
                    <input
                      type="checkbox"
                      id="confirm"
                      className="da-checkbox"
                      checked={confirmed}
                      onChange={(e) => setConfirmed(e.target.checked)}
                    />
                    <label htmlFor="confirm" className="da-checkbox-label">
                      I understand that this action is irreversible and all my data, including any remaining wallet balance, will be permanently deleted.
                    </label>
                  </div>

                  {error && (
                    <div className="da-error">
                      <AlertTriangle size={16} />
                      <span>{error}</span>
                    </div>
                  )}

                  <button type="submit" className="da-btn" disabled={loading || !email}>
                    <span className="da-btn-inner">
                      {loading && <span className="da-spinner" />}
                      {loading ? 'Submitting Request...' : 'Request Account Deletion'}
                    </span>
                  </button>
                </form>

                <div className="da-alternative">
                  <p className="da-alternative-title">Having issues with your account?</p>
                  <p className="da-alternative-text">
                    Before deleting your account, you may want to contact our support team at{' '}
                    <a href="mailto:support@dectechgh.com" className="da-alternative-link">
                      support@dectechgh.com
                    </a>{' '}
                    to resolve any issues.
                  </p>
                </div>
              </>
            ) : (
              <div className="da-success">
                <div className="da-success-icon">
                  <CheckCircle size={32} color="#16a34a" />
                </div>
                <h2 className="da-success-title">Request Submitted</h2>
                <p className="da-success-text">
                  Your account deletion request has been received. We will process your request within 30 days and send a confirmation to <strong>{email}</strong> once completed.
                </p>
              </div>
            )}
          </div>

          <p className="da-footer">DoorStep - Your trusted delivery partner</p>
        </main>
      </div>
    </>
  );
}
