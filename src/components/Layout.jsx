import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, Truck, ShoppingCart,
  BarChart3, LogOut, Menu, X, Leaf, UtensilsCrossed, CreditCard, Shield, Package,
} from 'lucide-react';

const navItems = [
  { path: '/',            label: 'Dashboard',   icon: LayoutDashboard, permission: 'dashboard' },
  { path: '/farmers',     label: 'Farmers',     icon: Leaf,            permission: 'farmers' },
  { path: '/restaurants', label: 'Restaurants', icon: UtensilsCrossed, permission: 'restaurants' },
  { path: '/products',    label: 'Products',    icon: Package,         permission: 'products' },
  { path: '/riders',      label: 'Riders',      icon: Truck,           permission: 'riders' },
  { path: '/customers',   label: 'Customers',   icon: Users,           permission: 'customers' },
  { path: '/orders',      label: 'Orders',      icon: ShoppingCart,    permission: 'orders' },
  { path: '/payments',    label: 'Payments',    icon: CreditCard,      permission: 'payments' },
  { path: '/analytics',   label: 'Analytics',   icon: BarChart3,       permission: 'analytics' },
  { path: '/users',       label: 'Users',       icon: Shield,          permission: 'users' },
];

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, hasPermission } = useAuth();

  // Filter nav items based on user permissions
  const filteredNavItems = navItems.filter(item => hasPermission(item.permission));

  const handleLogout = () => { logout(); navigate('/login'); };

  const initials = (name = '') => {
    const p = name.trim().split(' ');
    return p.length >= 2 ? (p[0][0] + p[1][0]).toUpperCase() : (p[0]?.[0] || 'A').toUpperCase();
  };

  return (
    <>
      <style>{styles}</style>

      <div className="ly-root">

        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div className="ly-backdrop" onClick={() => setSidebarOpen(false)} />
        )}

        {/* ── Sidebar ── */}
        <aside className={`ly-sidebar ${sidebarOpen ? 'ly-sidebar-open' : ''}`}>

          {/* Brand */}
          <div className="ly-brand">
            <div className="ly-brand-logo">
              <Leaf size={20} color="#a3d977" />
            </div>
            <div className="ly-brand-text">
              <p className="ly-brand-name">FarmFresh</p>
              <p className="ly-brand-sub">Admin Center</p>
            </div>
            <button className="ly-close-btn" onClick={() => setSidebarOpen(false)}>
              <X size={18} />
            </button>
          </div>

          {/* Nav */}
          <nav className="ly-nav">
            <p className="ly-nav-label">Navigation</p>
            {filteredNavItems.map(item => {
              const Icon = item.icon;
              const active = location.pathname === item.path ||
                (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`ly-nav-item ${active ? 'ly-nav-active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className={`ly-nav-icon-wrap ${active ? 'ly-nav-icon-active' : ''}`}>
                    <Icon size={16} />
                  </span>
                  <span>{item.label}</span>
                  {active && <span className="ly-nav-dot" />}
                </Link>
              );
            })}
          </nav>

          {/* User + logout */}
          <div className="ly-sidebar-footer">
            <div className="ly-user-row">
              <div className="ly-user-avatar">
                {initials(user?.name)}
              </div>
              <div className="ly-user-info">
                <p className="ly-user-name">{user?.name || 'Admin'}</p>
                <p className="ly-user-email">{user?.email || ''}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="ly-logout-btn">
              <LogOut size={15} />
              <span>Sign out</span>
            </button>
          </div>
        </aside>

        {/* ── Main ── */}
        <div className={`ly-main ${sidebarOpen ? 'ly-main-pushed' : ''}`}>

          {/* Top bar */}
          <header className="ly-topbar">
            <button className="ly-hamburger" onClick={() => setSidebarOpen(true)}>
              <Menu size={20} />
            </button>

            {/* Breadcrumb-style title */}
            <div className="ly-topbar-title">
              {navItems.find(n =>
                n.path === location.pathname ||
                (n.path !== '/' && location.pathname.startsWith(n.path))
              )?.label || filteredNavItems[0]?.label || 'Dashboard'}
            </div>

            {/* User chip */}
            <div className="ly-topbar-user">
              <div className="ly-topbar-avatar">{initials(user?.name)}</div>
              <div className="ly-topbar-info">
                <p className="ly-topbar-name">{user?.name || 'Admin'}</p>
                <p className="ly-topbar-role">Administrator</p>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="ly-content">{children}</main>
        </div>

      </div>
    </>
  );
}

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,600&family=DM+Sans:wght@300;400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; }

.ly-root {
  display: flex;
  min-height: 100vh;
  background: #f5f2ec;
  font-family: 'DM Sans', sans-serif;
}

/* ── backdrop ── */
.ly-backdrop {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.4);
  z-index: 40;
  backdrop-filter: blur(2px);
}

/* ── sidebar ── */
.ly-sidebar {
  position: fixed;
  top: 0; left: 0;
  height: 100vh;
  width: 256px;
  background: #1a2e1a;
  display: flex;
  flex-direction: column;
  z-index: 50;
  transform: translateX(-100%);
  transition: transform 0.28s cubic-bezier(0.22,1,0.36,1);
  box-shadow: 4px 0 32px rgba(0,0,0,0.18);
}

@media (min-width: 1024px) {
  .ly-sidebar { transform: translateX(0); }
}

.ly-sidebar-open { transform: translateX(0) !important; }

/* brand */
.ly-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 22px 20px 18px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.ly-brand-logo {
  width: 38px; height: 38px;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 11px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.ly-brand-text { flex: 1; }
.ly-brand-name {
  font-family: 'Fraunces', serif;
  font-size: 17px; font-weight: 600;
  color: #fff; margin: 0; line-height: 1.1;
}
.ly-brand-sub {
  font-size: 11px; color: rgba(255,255,255,0.4);
  margin: 2px 0 0; letter-spacing: 0.02em;
}
.ly-close-btn {
  display: flex; align-items: center; justify-content: center;
  width: 30px; height: 30px;
  background: rgba(255,255,255,0.08);
  border: none; border-radius: 8px;
  color: rgba(255,255,255,0.5);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.ly-close-btn:hover { background: rgba(255,255,255,0.14); color: #fff; }
@media (min-width: 1024px) { .ly-close-btn { display: none; } }

/* nav */
.ly-nav {
  flex: 1;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
}
.ly-nav-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.25);
  padding: 0 10px 8px;
  margin: 0;
}
.ly-nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 11px;
  font-size: 13.5px;
  font-weight: 500;
  color: rgba(255,255,255,0.55);
  text-decoration: none;
  transition: background 0.15s, color 0.15s;
  position: relative;
}
.ly-nav-item:hover {
  background: rgba(255,255,255,0.07);
  color: rgba(255,255,255,0.9);
}
.ly-nav-active {
  background: rgba(163,217,119,0.12) !important;
  color: #a3d977 !important;
}
.ly-nav-icon-wrap {
  width: 30px; height: 30px;
  border-radius: 8px;
  background: rgba(255,255,255,0.06);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  transition: background 0.15s;
}
.ly-nav-active .ly-nav-icon-wrap,
.ly-nav-icon-active {
  background: rgba(163,217,119,0.18) !important;
}
.ly-nav-dot {
  width: 5px; height: 5px;
  background: #a3d977;
  border-radius: 50%;
  margin-left: auto;
}

/* sidebar footer */
.ly-sidebar-footer {
  padding: 14px 12px 20px;
  border-top: 1px solid rgba(255,255,255,0.07);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.ly-user-row {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 10px;
  border-radius: 11px;
  background: rgba(255,255,255,0.05);
}
.ly-user-avatar {
  width: 34px; height: 34px;
  border-radius: 10px;
  background: rgba(163,217,119,0.2);
  color: #a3d977;
  font-size: 13px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  letter-spacing: 0.02em;
}
.ly-user-name {
  font-size: 13px; font-weight: 600;
  color: #fff; margin: 0 0 2px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  max-width: 130px;
}
.ly-user-email {
  font-size: 11px; color: rgba(255,255,255,0.35);
  margin: 0;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  max-width: 130px;
}
.ly-logout-btn {
  display: flex; align-items: center; gap: 8px;
  width: 100%; padding: 9px 12px;
  background: rgba(239,68,68,0.08);
  border: 1px solid rgba(239,68,68,0.15);
  border-radius: 10px;
  color: #fca5a5;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px; font-weight: 500;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}
.ly-logout-btn:hover {
  background: rgba(239,68,68,0.16);
  border-color: rgba(239,68,68,0.3);
  color: #fecaca;
}

/* ── main area ── */
.ly-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  margin-left: 0;
  transition: margin-left 0.28s cubic-bezier(0.22,1,0.36,1);
}
@media (min-width: 1024px) {
  .ly-main { margin-left: 256px; }
}

/* topbar */
.ly-topbar {
  position: sticky;
  top: 0; z-index: 30;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 24px;
  height: 60px;
  background: rgba(245,242,236,0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(0,0,0,0.06);
  box-shadow: 0 1px 0 rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04);
}
.ly-hamburger {
  display: flex; align-items: center; justify-content: center;
  width: 36px; height: 36px;
  background: #fff;
  border: 1.5px solid #e8e4dc;
  border-radius: 10px;
  cursor: pointer;
  color: #555;
  transition: background 0.15s, border-color 0.15s;
  flex-shrink: 0;
}
.ly-hamburger:hover { background: #f0ede6; border-color: #d4cfc5; }
@media (min-width: 1024px) { .ly-hamburger { display: none; } }

.ly-topbar-title {
  font-family: 'Fraunces', serif;
  font-size: 17px; font-weight: 600;
  color: #1a2e1a;
  flex: 1;
}

.ly-topbar-user {
  display: flex; align-items: center; gap: 10px;
  padding: 6px 10px 6px 6px;
  background: #fff;
  border: 1.5px solid #e8e4dc;
  border-radius: 99px;
}
.ly-topbar-avatar {
  width: 30px; height: 30px;
  border-radius: 50%;
  background: #1a2e1a;
  color: #a3d977;
  font-size: 12px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  letter-spacing: 0.02em;
}
.ly-topbar-name {
  font-size: 13px; font-weight: 600;
  color: #1a1a1a; margin: 0;
  white-space: nowrap;
}
.ly-topbar-role {
  font-size: 11px; color: #aaa; margin: 0;
}

/* content */
.ly-content {
  flex: 1;
  padding: 0;
  overflow-x: hidden;
}
`;