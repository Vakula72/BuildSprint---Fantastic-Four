import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const errorMessage =
    params?.error === 'CredentialsSignin'
      ? 'Invalid email or password.'
      : params?.error
      ? 'An error occurred. Please try again.'
      : null;

  async function loginAction(formData: FormData) {
    'use server';
    try {
      await signIn('credentials', {
        email: formData.get('email'),
        password: formData.get('password'),
        redirectTo: '/',
      });
    } catch (error) {
      if (error instanceof AuthError) {
        redirect(`/login?error=${error.type}`);
      }
      throw error; // re-throw NEXT_REDIRECT so Next.js handles the navigation
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>
        <h2 className="text-center text-3xl font-bold tracking-tight text-white">
          Job Hunt Copilot
        </h2>
        <p className="mt-2 text-center text-sm text-blue-200">
          Sign in or{' '}
          <Link href="/signup" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors">
            create a free account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900/80 backdrop-blur-sm py-8 px-4 shadow-2xl border border-slate-700/50 sm:rounded-3xl sm:px-10">
          <form className="space-y-5" action={loginAction}>
            {errorMessage && (
              <div className="bg-red-500/10 border border-red-500/40 rounded-xl p-3 text-red-400 text-sm text-center">
                {errorMessage}
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                className="block w-full rounded-xl border border-slate-700 bg-slate-800/60 px-3.5 py-2.5 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm transition-colors"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
                className="block w-full rounded-xl border border-slate-700 bg-slate-800/60 px-3.5 py-2.5 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm transition-colors"
              />
            </div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-xl bg-blue-600 py-2.5 px-4 text-sm font-semibold text-white shadow-md hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all"
            >
              Sign in
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-700/50 text-center">
            <p className="text-xs text-slate-500">
              Demo credentials: <span className="text-slate-400 font-mono">demo@copilot.dev</span> / <span className="text-slate-400 font-mono">Demo1234!</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
