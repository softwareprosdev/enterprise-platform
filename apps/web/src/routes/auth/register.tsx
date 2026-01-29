import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useForm } from '@tanstack/react-form';
import { motion } from 'framer-motion';
import { HardHat, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { slugify } from '@enterprise/shared';
import { trpc } from '@/lib/trpc';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/auth/register')({
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: () => {
      // Navigate to onboarding
      navigate({ to: '/onboarding' });
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      tenantName: '',
      tenantSlug: '',
    },
    onSubmit: async ({ value }) => {
      setError(null);
      registerMutation.mutate(value);
    },
  });

  // Auto-generate slug from company name
  const handleCompanyNameChange = (value: string) => {
    form.setFieldValue('tenantName', value);
    form.setFieldValue('tenantSlug', slugify(value));
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
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
          <h1 className="text-2xl font-bold text-center mb-2">Start your builder trial</h1>
          <p className="text-muted-foreground text-center mb-8">
            14 days free, built for construction teams
          </p>

          {/* Features list */}
          <div className="flex items-center justify-center gap-6 mb-8 text-sm">
            {['Homeowner portal', 'Phase scheduling', 'Change orders'].map((feature) => (
              <div key={feature} className="flex items-center gap-1 text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-success" />
                {feature}
              </div>
            ))}
          </div>

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
            {/* Name field */}
            <form.Field
              name="name"
              children={(field) => (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    Your name
                  </label>
                  <input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    className="input"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                  {field.state.meta.errors?.[0] && (
                    <p className="text-destructive text-sm mt-1">
                      {typeof field.state.meta.errors[0] === 'string' ? field.state.meta.errors[0] : field.state.meta?.errors?.[0] || 'Invalid value'}
                    </p>
                  )}
                </div>
              )}
            />

            {/* Email field */}
            <form.Field
              name="email"
              children={(field) => (
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Work email
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
                      {typeof field.state.meta.errors[0] === 'string' ? field.state.meta.errors[0] : field.state.meta?.errors?.[0] || 'Invalid value'}
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
                  <label htmlFor="password" className="block text-sm font-medium mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min. 8 characters"
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
                      {typeof field.state.meta.errors[0] === 'string' ? field.state.meta.errors[0] : field.state.meta?.errors?.[0] || 'Invalid value'}
                    </p>
                  )}
                </div>
              )}
            />

            {/* Company name field */}
            <form.Field
              name="tenantName"
              children={(field) => (
                <div>
                  <label htmlFor="tenantName" className="block text-sm font-medium mb-2">
                    Company name
                  </label>
                  <input
                    id="tenantName"
                    type="text"
                    placeholder="Acme Inc."
                    className="input"
                    value={field.state.value}
                    onChange={(e) => handleCompanyNameChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                  {field.state.meta.errors?.[0] && (
                    <p className="text-destructive text-sm mt-1">
                      {typeof field.state.meta.errors[0] === 'string' ? field.state.meta.errors[0] : field.state.meta?.errors?.[0] || 'Invalid value'}
                    </p>
                  )}
                </div>
              )}
            />

            {/* Workspace URL field */}
            <form.Field
              name="tenantSlug"
              children={(field) => (
                <div>
                  <label htmlFor="tenantSlug" className="block text-sm font-medium mb-2">
                    Workspace URL
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-border bg-muted text-muted-foreground text-sm">
                      enterprise.app/
                    </span>
                    <input
                      id="tenantSlug"
                      type="text"
                      placeholder="acme"
                      className="input rounded-l-none"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      onBlur={field.handleBlur}
                    />
                  </div>
                  {field.state.meta.errors?.[0] && (
                    <p className="text-destructive text-sm mt-1">
                      {typeof field.state.meta.errors[0] === 'string' ? field.state.meta.errors[0] : field.state.meta?.errors?.[0] || 'Invalid value'}
                    </p>
                  )}
                </div>
              )}
            />

            {/* Submit button */}
            <button
              type="submit"
              disabled={registerMutation.isPending}
              className={cn(
                'btn-primary w-full flex items-center justify-center gap-2 mt-6',
                registerMutation.isPending && 'opacity-70 cursor-not-allowed'
              )}
            >
              {registerMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Terms */}
          <p className="text-center text-xs text-muted-foreground mt-4">
            By signing up, you agree to our{' '}
            <a href="/terms" className="text-primary hover:underline">Terms</a> and{' '}
            <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
          </p>

          {/* Sign in link */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{' '}
            <Link to="/auth/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
