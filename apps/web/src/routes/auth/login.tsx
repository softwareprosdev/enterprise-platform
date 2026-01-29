import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useForm } from '@tanstack/react-form';
import { motion } from 'framer-motion';
import { HardHat, Eye, EyeOff, Loader2, Github } from 'lucide-react';
import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/auth/login')({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      if (data.requiresMfa) {
        // Navigate to MFA verification
        navigate({ to: '/auth/mfa', search: { token: data.mfaToken || '' } });
      } else {
        // Navigate to dashboard
        navigate({ to: '/dashboard' });
      }
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      setError(null);
      loginMutation.mutate(value);
    },
  });

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
            <HardHat className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-xl">Villa Homes</span>
        </Link>

        {/* Card */}
        <div className="bg-card rounded-xl border border-border p-8">
          <h1 className="text-2xl font-bold text-center mb-2">Welcome back</h1>
          <p className="text-muted-foreground text-center mb-8">
            Sign in to your account to continue
          </p>

          {/* Error message */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-lg p-3 mb-6 text-sm">
              {error}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
            className="space-y-4"
          >
            {/* Email field */}
            <form.Field
              name="email"
              children={(field) => (
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    className="input"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                  {field.state.meta.errors?.[0] && (
                    <p className="text-destructive text-sm mt-1">
                      {typeof field.state.meta.errors[0] === 'string'
                        ? field.state.meta.errors[0]
                        : field.state.meta?.errors?.[0] || 'Invalid value'}
                    </p>
                  )}
                </div>
              )}
            />

            {/* Password field */}
            <form.Field
              name="password"
              children={(field) => (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="password" className="block text-sm font-medium">
                      Password
                    </label>
                    <Link
                      to="/auth/forgot-password"
                      className="text-sm text-primary hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="input pr-10"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {field.state.meta.errors?.[0] && (
                    <p className="text-destructive text-sm mt-1">
                      {typeof field.state.meta.errors[0] === 'string'
                        ? field.state.meta.errors[0]
                        : field.state.meta?.errors?.[0] || 'Invalid value'}
                    </p>
                  )}
                </div>
              )}
            />

            {/* Submit button */}
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className={cn(
                'btn-primary w-full flex items-center justify-center gap-2',
                loginMutation.isPending && 'opacity-70 cursor-not-allowed'
              )}
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-card text-muted-foreground">Or continue with</span>
            </div>
          </div>

          {/* OAuth buttons */}
          <button className="btn-secondary w-full flex items-center justify-center gap-2">
            <Github className="w-5 h-5" />
            GitHub
          </button>

          {/* Sign up link */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{' '}
            <Link to="/auth/register" className="text-primary hover:underline font-medium">
              Start your free trial
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
