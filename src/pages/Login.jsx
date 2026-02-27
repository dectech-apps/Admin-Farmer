import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf, Mail, Lock, AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role !== 'admin') {
        setError('Access denied. Admin privileges required.');
        localStorage.removeItem('adminToken');
        return;
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;1,9..144,300&family=DM+Sans:wght@300;400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .ff-root {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr;
          font-family: 'DM Sans', sans-serif;
          background: #f5f2ec;
        }

        @media (min-width: 1024px) {
          .ff-root { grid-template-columns: 1fr 1fr; }
        }

        /* ── Left panel ── */
        .ff-panel {
          display: none;
          flex-direction: column;
          justify-content: space-between;
          padding: 48px;
          background: #1a2e1a;
          color: #fff;
          position: relative;
          overflow: hidden;
        }

        @media (min-width: 1024px) { .ff-panel { display: flex; } }

        .ff-panel::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 60% 50% at 80% 10%, rgba(74,124,57,0.35) 0%, transparent 70%),
            radial-gradient(ellipse 50% 60% at 10% 90%, rgba(34,85,34,0.4) 0%, transparent 60%);
          pointer-events: none;
        }

        .ff-panel-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          position: relative;
        }

        .ff-panel-icon {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .ff-panel-brand-name {
          font-family: 'Fraunces', serif;
          font-size: 20px;
          font-weight: 600;
          line-height: 1.1;
        }

        .ff-panel-brand-sub {
          font-size: 12px;
          color: rgba(255,255,255,0.55);
          margin-top: 2px;
          letter-spacing: 0.02em;
        }

        .ff-panel-copy { position: relative; }

        .ff-panel-headline {
          font-family: 'Fraunces', serif;
          font-size: clamp(28px, 3vw, 40px);
          font-weight: 300;
          line-height: 1.25;
          color: #fff;
          margin-bottom: 16px;
        }

        .ff-panel-headline em {
          font-style: italic;
          color: #a3d977;
        }

        .ff-panel-desc {
          font-size: 14px;
          color: rgba(255,255,255,0.55);
          line-height: 1.7;
          max-width: 360px;
        }

        .ff-panel-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          position: relative;
        }

        .ff-stat {
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 18px 20px;
          backdrop-filter: blur(8px);
        }

        .ff-stat-label {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: rgba(255,255,255,0.4);
          margin-bottom: 8px;
        }

        .ff-stat-value {
          font-family: 'Fraunces', serif;
          font-size: 18px;
          font-weight: 600;
          color: #fff;
        }

        /* ── Right / form side ── */
        .ff-form-side {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 24px;
          background: #f5f2ec;
        }

        @media (min-width: 640px) { .ff-form-side { padding: 48px 40px; } }

        .ff-card {
          width: 100%;
          max-width: 420px;
          background: #fff;
          border-radius: 24px;
          padding: 40px 36px;
          box-shadow:
            0 1px 2px rgba(0,0,0,0.04),
            0 4px 24px rgba(0,0,0,0.07),
            0 0 0 1px rgba(0,0,0,0.04);
          animation: rise 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        @keyframes rise {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @media (min-width: 640px) { .ff-card { padding: 48px 44px; } }

        .ff-card-header {
          text-align: center;
          margin-bottom: 36px;
        }

        .ff-logo-wrap {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 60px;
          height: 60px;
          background: #1a2e1a;
          border-radius: 18px;
          margin-bottom: 20px;
          box-shadow: 0 8px 24px rgba(26,46,26,0.28);
        }

        .ff-title {
          font-family: 'Fraunces', serif;
          font-size: 26px;
          font-weight: 600;
          color: #111;
          margin-bottom: 6px;
        }

        .ff-subtitle {
          font-size: 14px;
          color: #888;
          font-weight: 300;
        }

        /* ── Error ── */
        .ff-error {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          background: #fff5f5;
          border: 1px solid #fecdd3;
          border-radius: 12px;
          padding: 12px 14px;
          margin-bottom: 24px;
          color: #be123c;
          font-size: 13.5px;
          line-height: 1.5;
        }

        .ff-error svg { flex-shrink: 0; margin-top: 1px; }

        /* ── Form ── */
        .ff-form { display: flex; flex-direction: column; gap: 20px; }

        .ff-field { display: flex; flex-direction: column; gap: 7px; }

        .ff-label {
          font-size: 13px;
          font-weight: 500;
          color: #444;
          letter-spacing: 0.01em;
        }

        .ff-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .ff-input-icon {
          position: absolute;
          left: 14px;
          color: #aaa;
          display: flex;
          align-items: center;
          pointer-events: none;
          transition: color 0.2s;
        }

        .ff-input {
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
          -webkit-appearance: none;
        }

        .ff-input::placeholder { color: #c2bdb3; }

        .ff-input:focus {
          border-color: #2d5a27;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(45,90,39,0.1);
        }

        .ff-input:focus + .ff-focus-ring { opacity: 1; }

        .ff-input-wrap:focus-within .ff-input-icon { color: #2d5a27; }

        /* ── Submit button ── */
        .ff-btn {
          margin-top: 4px;
          width: 100%;
          padding: 14px;
          background: #1a2e1a;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 500;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          letter-spacing: 0.01em;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 14px rgba(26,46,26,0.25);
          position: relative;
          overflow: hidden;
        }

        .ff-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(255,255,255,0);
          transition: background 0.2s;
        }

        .ff-btn:hover:not(:disabled) {
          background: #2d5a27;
          box-shadow: 0 6px 20px rgba(26,46,26,0.32);
          transform: translateY(-1px);
        }

        .ff-btn:active:not(:disabled) { transform: translateY(0); }

        .ff-btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .ff-btn-inner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .ff-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .ff-footer {
          text-align: center;
          margin-top: 28px;
          font-size: 12px;
          color: #bbb;
          letter-spacing: 0.02em;
        }
      `}</style>

      <div className="ff-root">
        {/* Left decorative panel */}
        <div className="ff-panel">
          <div className="ff-panel-brand">
            <div className="ff-panel-icon">
              <Leaf size={20} color="#a3d977" />
            </div>
            <div>
              <p className="ff-panel-brand-name">FarmFresh</p>
              <p className="ff-panel-brand-sub">Admin Control Center</p>
            </div>
          </div>

          <div className="ff-panel-copy">
            <h1 className="ff-panel-headline">
              Keep every harvest, order, and delivery on <em>one clean canvas.</em>
            </h1>
            <p className="ff-panel-desc">
              Monitor farmer onboarding, rider availability, and customer demand
              with precision dashboards built for real-time decisions.
            </p>
          </div>

          <div className="ff-panel-stats">
            <div className="ff-stat">
              <p className="ff-stat-label">Live Ops</p>
              <p className="ff-stat-value">24/7 Visibility</p>
            </div>
            <div className="ff-stat">
              <p className="ff-stat-label">Quality</p>
              <p className="ff-stat-value">Verified Farms</p>
            </div>
          </div>
        </div>

        {/* Right form side */}
        <div className="ff-form-side">
          <div className="ff-card">
            <div className="ff-card-header">
              <div className="ff-logo-wrap">
                <Leaf size={28} color="#a3d977" />
              </div>
              <h1 className="ff-title">FarmFresh Admin</h1>
              <p className="ff-subtitle">Sign in to your operations workspace</p>
            </div>

            {error && (
              <div className="ff-error">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="ff-form">
              <div className="ff-field">
                <label className="ff-label" htmlFor="email">Email address</label>
                <div className="ff-input-wrap">
                  <span className="ff-input-icon"><Mail size={16} /></span>
                  <input
                    id="email"
                    type="email"
                    className="ff-input"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="ff-field">
                <label className="ff-label" htmlFor="password">Password</label>
                <div className="ff-input-wrap">
                  <span className="ff-input-icon"><Lock size={16} /></span>
                  <input
                    id="password"
                    type="password"
                    className="ff-input"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <button type="submit" className="ff-btn" disabled={loading}>
                <span className="ff-btn-inner">
                  {loading && <span className="ff-spinner" />}
                  {loading ? 'Signing in…' : 'Sign In'}
                </span>
              </button>
            </form>

            <p className="ff-footer">FarmFresh Admin Dashboard v1.0</p>
          </div>
        </div>
      </div>
    </>
  );
}