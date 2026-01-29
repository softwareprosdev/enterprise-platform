import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';
import { HardHat, ArrowRight, CheckCircle2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/onboarding')({
  component: OnboardingPage,
});

function OnboardingPage() {
  const navigate = useNavigate();
  const { data, isLoading } = trpc.onboarding.getState.useQuery();
  const { data: plans } = trpc.billing.getPlans.useQuery();
  const updateCompany = trpc.onboarding.updateCompany.useMutation();
  const updateTeam = trpc.onboarding.updateTeam.useMutation();
  const updateBranding = trpc.onboarding.updateBranding.useMutation();
  const updateIntegrations = trpc.onboarding.updateIntegrations.useMutation();
  const updateBilling = trpc.onboarding.updateBilling.useMutation();
  const skipToComplete = trpc.onboarding.skipToStep.useMutation();

  const steps = useMemo(() => data?.steps ?? ['company', 'team', 'branding', 'integrations', 'billing', 'complete'], [data]);
  const [currentStep, setCurrentStep] = useState<string>('company');

  const [company, setCompany] = useState({
    name: '',
    address: '',
    phone: '',
    licenseNumber: '',
  });
  const [invite, setInvite] = useState<{ email: string; role: 'project_manager' | 'office_staff' | 'field_staff' }>({ email: '', role: 'project_manager' });
  const [branding, setBranding] = useState({ logo: '', brandColor: '#1e3a5f' });
  const [integrations, setIntegrations] = useState<string[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>('');

  useEffect(() => {
    if (data?.currentStep) {
      setCurrentStep(data.currentStep);
    }
    if (data?.data?.company) {
      const companyData = data.data.company as Partial<typeof company>;
      setCompany((prev) => ({ ...prev, ...companyData }));
    }
    if (data?.data?.branding) {
      const brandingData = data.data.branding as Partial<typeof branding>;
      setBranding((prev) => ({ ...prev, ...brandingData }));
    }
    if (data?.data?.integrations) {
      setIntegrations(data.data.integrations as string[]);
    }
    if (data?.data?.billing) {
      const billingData = data.data.billing as { planId?: string };
      if (billingData.planId) {
        setSelectedPlan(billingData.planId);
      }
    }
  }, [data]);

  const stepIndex = steps.indexOf(currentStep);
  const validSteps = ['company', 'team', 'branding', 'integrations', 'billing', 'complete'];
  const goToNext = (next: string) => {
    if (validSteps.includes(next)) {
      setCurrentStep(next);
    }
  };

  const integrationOptions = ['Buildertrend', 'Procore', 'QuickBooks', 'DocuSign', 'Twilio'];

  const handleComplete = async () => {
    await skipToComplete.mutateAsync({});
    navigate({ to: '/dashboard' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading onboarding...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="section max-w-5xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
            <HardHat className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Welcome to Villa Homes</h1>
            <p className="text-muted-foreground">Let’s set up your construction workspace.</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-[260px_1fr] gap-8">
          <div className="bg-card border border-border rounded-xl p-6 h-fit">
            <h2 className="font-semibold mb-4">Onboarding Steps</h2>
            <ol className="space-y-3">
              {steps.map((step, index) => (
                <li key={step} className="flex items-center gap-3 text-sm">
                  <div
                    className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                      index < stepIndex && 'bg-success text-white',
                      index === stepIndex && 'bg-primary text-white',
                      index > stepIndex && 'bg-muted text-muted-foreground'
                    )}
                  >
                    {index < stepIndex ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
                  </div>
                  <span className="capitalize">{step.replace('_', ' ')}</span>
                </li>
              ))}
            </ol>
            <button
              className="mt-6 text-xs text-muted-foreground hover:text-foreground"
              onClick={handleComplete}
            >
              Skip onboarding
            </button>
          </div>

          <div className="bg-card border border-border rounded-xl p-8">
            {currentStep === 'company' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold">Company details</h2>
                  <p className="text-muted-foreground">Tell us about your construction business.</p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Company name</label>
                    <input
                      className="input"
                      value={company.name}
                      onChange={(e) => setCompany({ ...company, name: e.target.value })}
                      placeholder="Villa Homes Construction"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone</label>
                    <input
                      className="input"
                      value={company.phone}
                      onChange={(e) => setCompany({ ...company, phone: e.target.value })}
                      placeholder="(956) 555-0199"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Address</label>
                    <input
                      className="input"
                      value={company.address}
                      onChange={(e) => setCompany({ ...company, address: e.target.value })}
                      placeholder="1120 W Jefferson St, Brownsville, TX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">License #</label>
                    <input
                      className="input"
                      value={company.licenseNumber}
                      onChange={(e) => setCompany({ ...company, licenseNumber: e.target.value })}
                      placeholder="TX-HB-45219"
                    />
                  </div>
                </div>
                <button
                  className="btn-primary flex items-center gap-2"
                  onClick={async () => {
                    const result = await updateCompany.mutateAsync(company);
                    goToNext(result.nextStep);
                  }}
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {currentStep === 'team' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold">Invite your team</h2>
                  <p className="text-muted-foreground">Add project managers, office staff, or field supervisors.</p>
                </div>
                <div className="grid md:grid-cols-[1fr_180px] gap-4">
                  <input
                    className="input"
                    value={invite.email}
                    onChange={(e) => setInvite({ ...invite, email: e.target.value })}
                    placeholder="name@builder.com"
                  />
                  <select
                    className="input"
                    value={invite.role}
                    onChange={(e) => setInvite({ ...invite, role: e.target.value as 'project_manager' | 'office_staff' | 'field_staff' })}
                  >
                    <option value="project_manager">Project Manager</option>
                    <option value="office_staff">Office Staff</option>
                    <option value="field_staff">Field Staff</option>
                  </select>
                </div>
                <button
                  className="btn-primary"
                  onClick={async () => {
                    const invites = invite.email ? [{ email: invite.email, role: invite.role as 'project_manager' | 'office_staff' | 'field_staff' }] : [];
                    const result = await updateTeam.mutateAsync({ invites });
                    if (result.nextStep) goToNext(result.nextStep);
                  }}
                >
                  Continue
                </button>
              </div>
            )}

            {currentStep === 'branding' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold">Branding</h2>
                  <p className="text-muted-foreground">Customize the look of your homeowner portal.</p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Logo URL</label>
                    <input
                      className="input"
                      value={branding.logo}
                      onChange={(e) => setBranding({ ...branding, logo: e.target.value })}
                      placeholder="https://villahomes.ai/logo.png"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Brand color</label>
                    <input
                      className="input"
                      type="color"
                      value={branding.brandColor}
                      onChange={(e) => setBranding({ ...branding, brandColor: e.target.value })}
                    />
                  </div>
                </div>
                <button
                  className="btn-primary"
                  onClick={async () => {
                    const result = await updateBranding.mutateAsync(branding);
                    goToNext(result.nextStep);
                  }}
                >
                  Continue
                </button>
              </div>
            )}

            {currentStep === 'integrations' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold">Integrations</h2>
                  <p className="text-muted-foreground">Connect the tools your teams already use.</p>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  {integrationOptions.map((integration) => (
                    <label key={integration} className="flex items-center gap-3 p-3 border border-border rounded-lg">
                      <input
                        type="checkbox"
                        checked={integrations.includes(integration)}
                        onChange={(e) => {
                          setIntegrations((prev) =>
                            e.target.checked
                              ? [...prev, integration]
                              : prev.filter((item) => item !== integration)
                          );
                        }}
                      />
                      <span>{integration}</span>
                    </label>
                  ))}
                </div>
                <button
                  className="btn-primary"
                  onClick={async () => {
                    const result = await updateIntegrations.mutateAsync({ integrations });
                    goToNext(result.nextStep);
                  }}
                >
                  Continue
                </button>
              </div>
            )}

            {currentStep === 'billing' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold">Select a plan</h2>
                  <p className="text-muted-foreground">Choose the plan that fits your build volume.</p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {plans?.map((plan) => (
                    <button
                      key={plan.id}
                      className={cn(
                        'border rounded-lg p-4 text-left',
                        selectedPlan === plan.id ? 'border-primary bg-primary/5' : 'border-border'
                      )}
                      onClick={() => setSelectedPlan(plan.id)}
                    >
                      <div className="font-semibold">{plan.name}</div>
                      <div className="text-sm text-muted-foreground">${plan.price}/{plan.interval}</div>
                    </button>
                  ))}
                </div>
                <button
                  className="btn-primary"
                  onClick={async () => {
                    const planId = selectedPlan || plans?.[0]?.id;
                    if (!planId) return;
                    const result = await updateBilling.mutateAsync({ planId });
                    goToNext(result.nextStep);
                  }}
                >
                  Finish setup
                </button>
              </div>
            )}

            {currentStep === 'complete' && (
              <div className="space-y-6 text-center">
                <CheckCircle2 className="w-12 h-12 text-success mx-auto" />
                <div>
                  <h2 className="text-2xl font-semibold">You're ready to build</h2>
                  <p className="text-muted-foreground">Your Villa Homes workspace is ready.</p>
                </div>
                <Link to="/dashboard" className="btn-primary inline-flex items-center gap-2">
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
