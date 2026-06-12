import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Package, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { authApi } from '@/api/auth';
import { useAuth } from '@/context/AuthContext';
import { getErrorMessage } from '@/lib/utils';
import { cn } from '@/lib/utils';

const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type LoginData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const [showPw, setShowPw] = useState(false);
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginData>({
    resolver: zodResolver(loginSchema) as any,
    defaultValues: { email: '', password: '' },
  });

  const onLogin = async (data: LoginData) => {
    setServerError('');
    try {
      const res = await authApi.login(data);
      login(res.access_token, res.user);
    } catch (err) {
      setServerError(getErrorMessage(err));
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        <div className="flex items-center gap-2.5 mb-8 justify-center">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm">
            <Package className="w-4 h-4 text-white" />
          </div>
          <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">StockFlow</p>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm p-6">
          <div className="mb-5">
            <h1 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">Sign in</h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit(onLogin)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                {...register('email')}
                className={cn(
                  'w-full h-9 rounded-md border bg-white px-3 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-1 transition-colors',
                  'border-neutral-300 focus:border-indigo-500 focus:ring-indigo-500',
                  'dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-indigo-400',
                  errors.email && 'border-red-500 focus:ring-red-500'
                )}
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...register('password')}
                  className={cn(
                    'w-full h-9 rounded-md border bg-white px-3 pr-9 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-1 transition-colors',
                    'border-neutral-300 focus:border-indigo-500 focus:ring-indigo-500',
                    'dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-indigo-400',
                    errors.password && 'border-red-500 focus:ring-red-500'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>

            {serverError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
                <p className="text-sm text-red-700 dark:text-red-400">{serverError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-9 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight className="w-3.5 h-3.5" /></>
              )}
            </button>

            <p className="text-xs text-center text-neutral-400 dark:text-neutral-500">
              Demo: <span className="font-mono">admin@stockflow.io</span> / <span className="font-mono">Admin@123456</span>
            </p>
          </form>
        </div>

        <p className="text-center text-xs text-neutral-400 mt-6">© 2026 StockFlow. All rights reserved.</p>
      </div>
    </div>
  );
}
