import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
import { useState } from 'react';
import { HardHat, Loader2, ShieldCheck } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/auth/mfa')({
  validateSearch: z.object({ token: z.string() }),
  component: MFAPage,
});

function MFAPage() {
  const navigate = useNavigate();
  const { token } = Route.useSearch();
  const [error, setError] = useState<string | null>(null);

  const verifyMutation = trpc.auth.verifyMfa.useMutation({
    onSuccess: () => {
      navigate({ to: '/dashboard' });
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const form = useForm({
    defaultValues: {
      code: '',
    },
    onSubmit: async ({ value }) => {
      setError(null);
      verifyMutation.mutate({ mfaToken: token, code: value.code });
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="fixed inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent" />
      <div className="w-full max-w-md relative">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
            <HardHat className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-xl">Villa Homes</span>
        </div>

        <div className="bg-card rounded-xl border border-border p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Verify Your Access</h1>
              <p className="text-sm text-muted-foreground">Enter the 6-digit code from your authenticator</p>
            </div>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-lg p-3 mb-4 text-sm">
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
            <form.Field
              name="code"
              children={(field) => (
                <div>
                  <label htmlFor="code" className="block text-sm font-medium mb-2">
                    Verification code
                  </label>
                  <input
                    id="code"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="123456"
                    className="input tracking-[0.3em] text-center"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    onBlur={field.handleBlur}
                  />
                  {field.state.meta.errors?.[0] && (
                    <p className="text-destructive text-sm mt-1">
                      {typeof field.state.meta.errors[0] === 'string'
                        ? field.state.meta.errors[0]
                        : field.state.meta?.errors?.[0] || 'Invalid code'}
                    </p>
                  )}
                </div>
              )}
            />

            <button
              type="submit"
              disabled={verifyMutation.isPending}
              className={cn(
                'btn-primary w-full flex items-center justify-center gap-2',
                verifyMutation.isPending && 'opacity-70 cursor-not-allowed'
              )}
            >
              {verifyMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify and Continue'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
