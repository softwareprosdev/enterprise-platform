import { createFileRoute } from '@tanstack/react-router';
import {
  CreditCard,
  Check,
  Zap,
  Building2,
  Users,
  FolderKanban,
  Download,
  Calendar,
  ArrowRight,
  Shield,
  Star,
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { cn, formatCurrency, formatDate } from '@/lib/utils';

export const Route = createFileRoute('/dashboard/billing/')({
  component: BillingPage,
});

function BillingPage() {
  const { data: tenant } = trpc.tenants.current.useQuery();

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: 99,
      description: 'Perfect for small builders',
      features: [
        '10 active projects',
        '5 team members',
        'Basic analytics',
        'Email support',
        'Client portal (basic)',
      ],
      limits: { projects: 10, users: 5 },
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 299,
      description: 'For growing construction companies',
      popular: true,
      features: [
        '50 active projects',
        '25 team members',
        'Advanced analytics',
        'Priority support',
        'Client portal (full)',
        'API access',
        'Custom branding',
      ],
      limits: { projects: 50, users: 25 },
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 599,
      description: 'For large operations',
      features: [
        'Unlimited projects',
        'Unlimited team members',
        'AI-powered insights',
        '24/7 dedicated support',
        'White-label portal',
        'Custom integrations',
        'Dedicated CSM',
        'SLA guarantee',
      ],
      limits: { projects: -1, users: -1 },
    },
  ];

  const currentPlan = tenant?.plan || 'professional';

  const invoices = [
    { id: 1, date: new Date('2025-01-01'), amount: 299, status: 'paid' },
    { id: 2, date: new Date('2024-12-01'), amount: 299, status: 'paid' },
    { id: 3, date: new Date('2024-11-01'), amount: 299, status: 'paid' },
    { id: 4, date: new Date('2024-10-01'), amount: 299, status: 'paid' },
    { id: 5, date: new Date('2024-09-01'), amount: 299, status: 'paid' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Billing & Subscription</h1>
        <p className="text-muted-foreground">Manage your subscription and payment methods</p>
      </div>

      {/* Current Plan Summary */}
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-xl border border-primary/20 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-secondary" />
              <span className="text-sm font-medium text-secondary">Current Plan</span>
            </div>
            <h2 className="text-2xl font-bold capitalize">{currentPlan}</h2>
            <p className="text-muted-foreground">
              Your next billing date is <strong>February 1, 2025</strong>
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">
              $299<span className="text-lg font-normal text-muted-foreground">/mo</span>
            </div>
            <p className="text-sm text-muted-foreground">Billed monthly</p>
          </div>
        </div>

        {/* Usage Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
          <div>
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <FolderKanban className="w-4 h-4" />
              <span className="text-sm">Projects</span>
            </div>
            <div className="text-xl font-semibold">54 / 50</div>
            <div className="w-full h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
              <div className="h-full bg-secondary rounded-full" style={{ width: '100%' }} />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users className="w-4 h-4" />
              <span className="text-sm">Team Members</span>
            </div>
            <div className="text-xl font-semibold">15 / 25</div>
            <div className="w-full h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: '60%' }} />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Building2 className="w-4 h-4" />
              <span className="text-sm">Homeowners</span>
            </div>
            <div className="text-xl font-semibold">50</div>
            <div className="text-xs text-muted-foreground">Unlimited</div>
          </div>
          <div>
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Shield className="w-4 h-4" />
              <span className="text-sm">Storage</span>
            </div>
            <div className="text-xl font-semibold">12.4 GB</div>
            <div className="w-full h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
              <div className="h-full bg-green-500 rounded-full" style={{ width: '25%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Plans */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                'relative bg-card rounded-xl border p-6 transition-all',
                plan.popular ? 'border-secondary shadow-lg shadow-secondary/10' : 'border-border',
                currentPlan === plan.id && 'ring-2 ring-primary'
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-secondary text-secondary-foreground text-xs font-medium rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  Most Popular
                </div>
              )}

              <div className="mb-4">
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold">${plan.price}</span>
                <span className="text-muted-foreground">/month</span>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => console.log('Upgrade to', plan.id)}
                className={cn(
                  'w-full py-2.5 rounded-lg font-medium transition-colors',
                  currentPlan === plan.id
                    ? 'bg-primary/20 text-primary cursor-default'
                    : plan.popular
                    ? 'bg-secondary text-secondary-foreground hover:bg-secondary/90'
                    : 'bg-muted hover:bg-muted/80'
                )}
                disabled={currentPlan === plan.id}
              >
                {currentPlan === plan.id ? 'Current Plan' : 'Upgrade'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Method */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-semibold">Payment Method</h2>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-400 rounded flex items-center justify-center text-white text-xs font-bold">
                  VISA
                </div>
                <div>
                  <div className="font-medium">•••• •••• •••• 4242</div>
                  <div className="text-sm text-muted-foreground">Expires 12/26</div>
                </div>
              </div>
              <button className="text-sm text-primary hover:underline">Update</button>
            </div>

            <button className="mt-4 w-full btn-secondary flex items-center justify-center gap-2">
              <CreditCard className="w-4 h-4" />
              Add Payment Method
            </button>
          </div>
        </div>

        {/* Billing Address */}
        <div className="bg-card rounded-xl border border-border">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-semibold">Billing Address</h2>
          </div>
          <div className="p-6">
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="font-medium">Villa Homes RGV</div>
              <div className="text-sm text-muted-foreground mt-1">
                1120 W Jefferson Ave<br />
                Harlingen, TX 78550<br />
                United States
              </div>
            </div>
            <button className="mt-4 text-sm text-primary hover:underline">Edit Address</button>
          </div>
        </div>
      </div>

      {/* Invoice History */}
      <div className="bg-card rounded-xl border border-border">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-semibold">Invoice History</h2>
          <button className="btn-secondary flex items-center gap-2 text-sm">
            <Download className="w-4 h-4" />
            Download All
          </button>
        </div>
        <div className="divide-y divide-border">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <div className="font-medium">
                    Invoice #{String(invoice.id).padStart(4, '0')}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(invoice.date)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-medium">{formatCurrency(invoice.amount)}</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-500 capitalize">
                  {invoice.status}
                </span>
                <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                  <Download className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Enterprise CTA */}
      <div className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-8 text-white">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Need a Custom Solution?</h2>
            <p className="text-white/80">
              Contact our sales team for custom pricing, dedicated support, and enterprise features.
            </p>
          </div>
          <button className="btn-secondary bg-white text-primary hover:bg-white/90 flex items-center gap-2 whitespace-nowrap">
            Contact Sales
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
