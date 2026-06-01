import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HardDrive, Eye, EyeOff } from 'lucide-react';
import { signup as signupApi } from '../api/auth.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setFieldErrors((fe) => ({ ...fe, [e.target.name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});
    try {
      const res = await signupApi(form);
      const { token, user } = res.data.data;
      login(token, user);
      toast.success(`Welcome to NestDrive, ${user.name}!`);
      navigate('/drive');
    } catch (err) {
      if (err.response?.data?.errors) {
        const errs = {};
        err.response.data.errors.forEach(({ field, message }) => {
          errs[field] = message;
        });
        setFieldErrors(errs);
      } else {
        toast.error(err.response?.data?.message || 'Signup failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sidebar flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <HardDrive className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-800">NestDrive</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-border shadow-sm p-8">
          <h1 className="text-xl font-semibold text-slate-800 mb-1">Create account</h1>
          <p className="text-slate-500 text-sm mb-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full name</label>
              <input
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                required
                autoFocus
                placeholder="Jane Doe"
                className={`w-full px-3 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm ${
                  fieldErrors.name ? 'border-red-400' : 'border-border'
                }`}
              />
              {fieldErrors.name && <p className="mt-1 text-xs text-red-500">{fieldErrors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                className={`w-full px-3 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm ${
                  fieldErrors.email ? 'border-red-400' : 'border-border'
                }`}
              />
              {fieldErrors.email && <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="Min 8 chars, 1 uppercase, 1 number"
                  className={`w-full px-3 py-2.5 pr-10 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm ${
                    fieldErrors.password ? 'border-red-400' : 'border-border'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && <p className="mt-1 text-xs text-red-500">{fieldErrors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
