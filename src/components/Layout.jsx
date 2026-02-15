import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Truck,
  ShoppingCart,
  BarChart3,
  LogOut,
  Menu,
  X,
  Leaf,
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/farmers', label: 'Farmers', icon: Leaf },
  { path: '/riders', label: 'Riders', icon: Truck },
  { path: '/customers', label: 'Customers', icon: Users },
  { path: '/orders', label: 'Orders', icon: ShoppingCart },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
];

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-transparent text-slate-900">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-72 flex flex-col bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-800 text-emerald-50 shadow-[0_20px_50px_rgba(15,23,42,0.35)] border-r border-emerald-800/40 transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-5 border-b border-emerald-800/40">
          <div className="flex items-center gap-2">
            <div className="w-11 h-11 bg-emerald-400/20 rounded-2xl ring-1 ring-emerald-300/40 flex items-center justify-center">
              <Leaf className="w-6 h-6 text-emerald-50" />
            </div>
            <span className="font-semibold text-lg tracking-wide text-emerald-50">
              FarmFresh
            </span>
          </div>
          <button
            className="lg:hidden p-2 hover:bg-white/10 rounded-lg"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-white/[0.12] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)]'
                    : 'text-emerald-100/80 hover:bg-white/10 hover:text-white'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="font-medium tracking-wide">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-emerald-800/40">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-rose-200 hover:bg-rose-500/15 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content - keep space for fixed sidebar when open */}
      <div
        className={`app-shell flex flex-col flex-1 min-w-0 ${
          sidebarOpen ? 'is-open pl-72' : 'pl-0'
        } lg:pl-72 transition-[padding] duration-300`}
      >
        {/* Top bar */}
        <header className="bg-white/70 backdrop-blur-md sticky top-0 z-30 border-b border-white/60 shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
          <div className="flex items-center justify-between px-4 py-4 lg:px-6">
            {/* Mobile hamburger */}
            <button
              className="lg:hidden p-2 hover:bg-slate-100/70 rounded-lg"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex-1 lg:flex-none" />
            {/* User info */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="font-medium text-slate-900 leading-tight">{user?.name || 'Admin'}</p>
                <p className="text-sm text-slate-500 leading-tight">{user?.email}</p>
              </div>
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center ring-1 ring-emerald-200/60 shrink-0">
                <span className="text-emerald-700 font-semibold">
                  {user?.name?.charAt(0) || 'A'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="app-main flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
