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
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute -top-24 -right-16 h-64 w-64 rounded-full bg-primary-300/30 blur-3xl" />
      <div className="absolute bottom-10 left-10 h-52 w-52 rounded-full bg-emerald-400/20 blur-3xl" />

      <div className="relative grid min-h-screen lg:grid-cols-2">
        <div className="hidden lg:flex flex-col justify-between p-12 text-white bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 ring-1 ring-white/25 flex items-center justify-center">
              <Leaf className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="font-display text-xl font-semibold">FarmFresh</p>
              <p className="text-sm text-emerald-100/80">Admin Control Center</p>
            </div>
          </div>

          <div className="space-y-6">
            <h1 className="font-display text-4xl leading-tight">
              Keep every harvest, order, and delivery on one clean canvas.
            </h1>
            <p className="text-emerald-100/80 max-w-md">
              Monitor farmer onboarding, rider availability, and customer demand with
              precision dashboards built for real-time decisions.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm text-emerald-100/90">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-widest text-emerald-200/80">Live Ops</p>
              <p className="mt-2 text-lg font-semibold">24/7 Visibility</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-widest text-emerald-200/80">Quality</p>
              <p className="mt-2 text-lg font-semibold">Verified Farms</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md card p-10 sm:p-12 animate-rise">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4 shadow-lg shadow-primary-600/30">
                <Leaf className="w-9 h-9 text-white" />
              </div>
              <h1 className="page-title">FarmFresh Admin</h1>
              <p className="page-subtitle mt-2">Sign in to your operations workspace</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input pl-11 py-3"
                    placeholder="admin@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input pl-11 py-3"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <p className="text-center mt-8 text-xs text-slate-500">
              FarmFresh Admin Dashboard v1.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
