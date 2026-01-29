import { createFileRoute, Link } from '@tanstack/react-router';
import { useForm } from '@tanstack/react-form';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { HardHat, Loader2, MailCheck, ShieldCheck } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/auth/forgot-password')({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [resetToken, setResetToken] = useState<string>('');
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [requestMessage, setRequestMessage] = useState<string | null>(null);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const requestMutation = trpc.auth.requestPasswordReset.useMutation({
    onSuccess: (data) => {
      setRequestSuccess(true);
      setRequestMessage(
        'If an account exists, a reset link has been generated. For demo purposes, the token is shown below.'
      );
      if (data.resetToken) {
        setResetToken(data.resetToken);
      }
    },
  });

  const resetMutation = trpc.auth.resetPassword.useMutation({
    onSuccess: () => {
      setResetMessage('Password updated. You can now sign in with the new password.');
    },
  });

  const requestForm = useForm({
    defaultValues: { email: '' },
    onSubmit: async ({ value }) => {
      setRequestMessage(null);
      requestMutation.mutate(value);
    },
  });

  const resetForm = useForm({
    defaultValues: { token: '', password: '' },
    onSubmit: async ({ value }) => {
      setResetMessage(null);
      resetMutation.mutate(value);
    },
  });

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="fixed inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative"
      >
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
            <HardHat className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-xl">Villa Homes</span>
        </Link>

        <div className="bg-card rounded-xl border border-border p-8 space-y-8">
          <div>
            <h1 className="text-2xl font-bold mb-2">Reset your password</h1>
            <p className="text-muted-foreground">
              Enter your work email and we’ll generate a reset token for your account.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              requestForm.handleSubmit();
            }}
            className="space-y-4"
          >
            <requestForm.Field
              name="email"
              children={(field) => (
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Work email
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@builder.com"
                    className="input"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                  {field.state.meta.errors?.[0] && (
                    <p className="text-destructive text-sm mt-1">
                      {typeof field.state.meta.errors[0] === 'string'
                        ? field.state.meta.errors[0]
                        : field.state.meta?.errors?.[0] || 'Invalid email'}
                    </p>
                  )}
                </div>
              )}
            />

            <button
              type="submit"
              disabled={requestMutation.isPending}
              className={cn(
                'btn-primary w-full flex items-center justify-center gap-2',
                requestMutation.isPending && 'opacity-70 cursor-not-allowed'
              )}
            >
              {requestMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : (
                'Generate Reset Token'
              )}
            </button>
          </form>

          {requestSuccess && (
            <div className="bg-primary/10 border border-primary/20 text-primary rounded-lg p-3 text-sm flex gap-2">
              <MailCheck className="w-4 h-4 mt-0.5" />
              <div>
                <p className="font-medium">Reset token generated</p>
                <p className="text-primary/80">{requestMessage}</p>
              </div>
            </div>
          )}

          <div className="border-t border-border pt-6 space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="w-4 h-4" />
              Use the token below to set a new password
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                resetForm.handleSubmit();
              }}
              className="space-y-4"
            >
              <resetForm.Field
                name="token"
                children={(field) => (
                  <div>
                    <label htmlFor="token" className="block text-sm font-medium mb-2">
                      Reset token
                    </label>
                    <input
                      id="token"
                      type="text"
                      placeholder="Paste reset token"
                      className="input"
                      value={resetToken || field.state.value}
                      onChange={(e) => {
                        setResetToken(e.target.value);
                        field.handleChange(e.target.value);
                      }}
                      onBlur={field.handleBlur}
                    />
                    {field.state.meta.errors?.[0] && (
                      <p className="text-destructive text-sm mt-1">
                        {typeof field.state.meta.errors[0] === 'string'
                          ? field.state.meta.errors[0]
                          : field.state.meta?.errors?.[0] || 'Invalid token'}
                      </p>
                    )}
                  </div>
                )}
              />

              <resetForm.Field
                name="password"
                children={(field) => (
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium mb-2">
                      New password
                    </label>
                    <input
                      id="password"
                      type="password"
                      placeholder="New secure password"
                      className="input"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                    {field.state.meta.errors?.[0] && (
                      <p className="text-destructive text-sm mt-1">
                        {typeof field.state.meta.errors[0] === 'string'
                          ? field.state.meta.errors[0]
                          : field.state.meta?.errors?.[0] || 'Invalid password'}
                      </p>
                    )}
                  </div>
                )}
              />

              <button
                type="submit"
                disabled={resetMutation.isPending}
                className={cn(
                  'btn-secondary w-full flex items-center justify-center gap-2',
                  resetMutation.isPending && 'opacity-70 cursor-not-allowed'
                )}
              >
                {resetMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Set New Password'
                )}
              </button>
            </form>

            {resetMessage && (
              <div className="text-sm text-success">{resetMessage}</div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
