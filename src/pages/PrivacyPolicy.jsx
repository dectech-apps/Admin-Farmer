import { Leaf, Shield, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;1,9..144,300&family=DM+Sans:wght@300;400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .pp-root {
          min-height: 100vh;
          font-family: 'DM Sans', sans-serif;
          background: #f5f2ec;
        }

        .pp-header {
          background: #1a2e1a;
          color: #fff;
          padding: 32px 24px;
          position: relative;
          overflow: hidden;
        }

        .pp-header::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 60% 50% at 80% 10%, rgba(74,124,57,0.35) 0%, transparent 70%),
            radial-gradient(ellipse 50% 60% at 10% 90%, rgba(34,85,34,0.4) 0%, transparent 60%);
          pointer-events: none;
        }

        .pp-header-inner {
          max-width: 800px;
          margin: 0 auto;
          position: relative;
        }

        .pp-back {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: rgba(255,255,255,0.7);
          text-decoration: none;
          font-size: 14px;
          margin-bottom: 24px;
          transition: color 0.2s;
        }

        .pp-back:hover { color: #fff; }

        .pp-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
        }

        .pp-brand-icon {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pp-brand-name {
          font-family: 'Fraunces', serif;
          font-size: 20px;
          font-weight: 600;
        }

        .pp-title {
          font-family: 'Fraunces', serif;
          font-size: clamp(28px, 4vw, 36px);
          font-weight: 300;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .pp-title-icon {
          width: 48px;
          height: 48px;
          background: rgba(163,217,119,0.2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pp-updated {
          margin-top: 12px;
          font-size: 14px;
          color: rgba(255,255,255,0.6);
        }

        .pp-content {
          max-width: 800px;
          margin: 0 auto;
          padding: 40px 24px 60px;
        }

        .pp-card {
          background: #fff;
          border-radius: 20px;
          padding: 32px 28px;
          box-shadow:
            0 1px 2px rgba(0,0,0,0.04),
            0 4px 24px rgba(0,0,0,0.07);
        }

        @media (min-width: 640px) {
          .pp-card { padding: 40px 44px; }
        }

        .pp-section {
          margin-bottom: 32px;
        }

        .pp-section:last-child { margin-bottom: 0; }

        .pp-section-title {
          font-family: 'Fraunces', serif;
          font-size: 20px;
          font-weight: 600;
          color: #1a2e1a;
          margin-bottom: 12px;
        }

        .pp-text {
          font-size: 15px;
          line-height: 1.7;
          color: #555;
        }

        .pp-text p { margin-bottom: 12px; }
        .pp-text p:last-child { margin-bottom: 0; }

        .pp-list {
          list-style: none;
          padding: 0;
          margin: 12px 0;
        }

        .pp-list li {
          position: relative;
          padding-left: 20px;
          margin-bottom: 8px;
          font-size: 15px;
          color: #555;
          line-height: 1.6;
        }

        .pp-list li::before {
          content: '';
          position: absolute;
          left: 0;
          top: 10px;
          width: 6px;
          height: 6px;
          background: #a3d977;
          border-radius: 50%;
        }

        .pp-contact {
          background: #f9f8f6;
          border-radius: 12px;
          padding: 20px;
          margin-top: 16px;
        }

        .pp-contact-label {
          font-size: 13px;
          color: #888;
          margin-bottom: 4px;
        }

        .pp-contact-value {
          font-size: 15px;
          color: #1a2e1a;
          font-weight: 500;
        }

        .pp-footer {
          text-align: center;
          margin-top: 32px;
          font-size: 13px;
          color: #999;
        }
      `}</style>

      <div className="pp-root">
        <header className="pp-header">
          <div className="pp-header-inner">
            <Link to="/login" className="pp-back">
              <ArrowLeft size={16} />
              Back to Login
            </Link>
            <div className="pp-brand">
              <div className="pp-brand-icon">
                <Leaf size={20} color="#a3d977" />
              </div>
              <span className="pp-brand-name">DoorStep</span>
            </div>
            <h1 className="pp-title">
              <span className="pp-title-icon">
                <Shield size={24} color="#a3d977" />
              </span>
              Privacy Policy
            </h1>
            <p className="pp-updated">Last updated: March 14, 2026</p>
          </div>
        </header>

        <main className="pp-content">
          <div className="pp-card">
            <section className="pp-section">
              <h2 className="pp-section-title">Introduction</h2>
              <div className="pp-text">
                <p>
                  Welcome to DoorStep. We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and services.
                </p>
                <p>
                  Please read this privacy policy carefully. By using our services, you agree to the collection and use of information in accordance with this policy.
                </p>
              </div>
            </section>

            <section className="pp-section">
              <h2 className="pp-section-title">Information We Collect</h2>
              <div className="pp-text">
                <p>We collect information that you provide directly to us, including:</p>
                <ul className="pp-list">
                  <li>Personal identification information (name, email address, phone number)</li>
                  <li>Account credentials (username and password)</li>
                  <li>Profile information (profile picture, address, preferences)</li>
                  <li>Transaction and order history</li>
                  <li>Payment information (processed securely through third-party providers)</li>
                  <li>Location data (with your consent, for delivery services)</li>
                  <li>Device information and usage data</li>
                </ul>
              </div>
            </section>

            <section className="pp-section">
              <h2 className="pp-section-title">How We Use Your Information</h2>
              <div className="pp-text">
                <p>We use the information we collect to:</p>
                <ul className="pp-list">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process transactions and send related information</li>
                  <li>Send promotional communications (with your consent)</li>
                  <li>Respond to your comments, questions, and requests</li>
                  <li>Monitor and analyze trends, usage, and activities</li>
                  <li>Detect, investigate, and prevent fraudulent transactions</li>
                  <li>Personalize and improve your experience</li>
                </ul>
              </div>
            </section>

            <section className="pp-section">
              <h2 className="pp-section-title">Information Sharing</h2>
              <div className="pp-text">
                <p>
                  We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
                </p>
                <ul className="pp-list">
                  <li>With service providers who assist in our operations</li>
                  <li>With farmers, restaurants, and riders to fulfill your orders</li>
                  <li>To comply with legal obligations</li>
                  <li>To protect our rights and prevent fraud</li>
                  <li>With your consent or at your direction</li>
                </ul>
              </div>
            </section>

            <section className="pp-section">
              <h2 className="pp-section-title">Data Security</h2>
              <div className="pp-text">
                <p>
                  We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
                </p>
              </div>
            </section>

            <section className="pp-section">
              <h2 className="pp-section-title">Your Rights</h2>
              <div className="pp-text">
                <p>You have the right to:</p>
                <ul className="pp-list">
                  <li>Access and receive a copy of your personal data</li>
                  <li>Rectify or update your personal information</li>
                  <li>Request deletion of your personal data</li>
                  <li>Object to or restrict processing of your data</li>
                  <li>Data portability</li>
                  <li>Withdraw consent at any time</li>
                </ul>
              </div>
            </section>

            <section className="pp-section">
              <h2 className="pp-section-title">Data Retention</h2>
              <div className="pp-text">
                <p>
                  We retain your personal information for as long as necessary to fulfill the purposes outlined in this privacy policy, unless a longer retention period is required by law. When you request account deletion, we will delete your data within 30 days, except where we are required to retain certain information for legal or legitimate business purposes.
                </p>
              </div>
            </section>

            <section className="pp-section">
              <h2 className="pp-section-title">Children's Privacy</h2>
              <div className="pp-text">
                <p>
                  Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we learn that we have collected personal information from a child under 13, we will take steps to delete that information promptly.
                </p>
              </div>
            </section>

            <section className="pp-section">
              <h2 className="pp-section-title">Changes to This Policy</h2>
              <div className="pp-text">
                <p>
                  We may update this privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page and updating the "Last updated" date. You are advised to review this privacy policy periodically for any changes.
                </p>
              </div>
            </section>

            <section className="pp-section">
              <h2 className="pp-section-title">Contact Us</h2>
              <div className="pp-text">
                <p>
                  If you have any questions about this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="pp-contact">
                  <p className="pp-contact-label">Email</p>
                  <p className="pp-contact-value">privacy@dectechgh.com</p>
                </div>
              </div>
            </section>
          </div>

          <p className="pp-footer">DoorStep - Your trusted delivery partner</p>
        </main>
      </div>
    </>
  );
}
