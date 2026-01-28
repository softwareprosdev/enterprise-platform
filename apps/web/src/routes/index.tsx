import { createFileRoute, Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  Zap,
  Shield,
  Users,
  BarChart3,
  Calendar,
  CreditCard,
  ChevronDown,
  Star,
  Building2,
  Globe,
  Code2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/')({
  component: LandingPage,
});

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header - Minimal navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="section">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Code2 className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg">Enterprise</span>
            </Link>

            {/* CTA */}
            <div className="flex items-center gap-4">
              <Link to="/auth/login" className="btn-ghost text-sm">
                Sign In
              </Link>
              <Link to="/auth/register" className="btn-primary text-sm !py-2 !px-4">
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Above the fold */}
      <section className="pt-32 pb-20 px-4">
        <div className="section">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            {/* Badge */}
            <motion.div variants={fadeInUp} className="mb-6">
              <span className="badge badge-primary text-sm px-4 py-1.5">
                <Zap className="w-3.5 h-3.5 mr-1.5" />
                Trusted by 500+ agencies worldwide
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeInUp}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6"
            >
              Manage Your Software Agency{' '}
              <span className="gradient-text">Like a Pro</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={fadeInUp}
              className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8"
            >
              Client onboarding, project management, billing, and team collaboration —
              all in one beautiful platform built for modern software agencies.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            >
              <Link to="/auth/register" className="btn-primary text-lg !py-4 !px-8 glow">
                Start Your Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <a href="#demo" className="btn-secondary text-lg !py-4 !px-8">
                Watch Demo
              </a>
            </motion.div>

            {/* Social proof */}
            <motion.div
              variants={fadeInUp}
              className="flex items-center justify-center gap-8 text-sm text-muted-foreground"
            >
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-success" />
                No credit card required
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-success" />
                14-day free trial
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-success" />
                Cancel anytime
              </div>
            </motion.div>
          </motion.div>

          {/* Hero Image/Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-16 relative"
          >
            <div className="absolute inset-0 bg-gradient-radial from-primary/20 via-transparent to-transparent blur-3xl" />
            <div className="relative rounded-xl border border-border overflow-hidden shadow-2xl gradient-border">
              <div className="bg-card p-1">
                {/* Mock Dashboard UI */}
                <div className="bg-background rounded-lg overflow-hidden">
                  {/* Dashboard header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-destructive" />
                      <div className="w-3 h-3 rounded-full bg-warning" />
                      <div className="w-3 h-3 rounded-full bg-success" />
                    </div>
                    <div className="text-sm text-muted-foreground">Dashboard</div>
                    <div className="w-20" />
                  </div>

                  {/* Dashboard content */}
                  <div className="p-6 grid grid-cols-4 gap-4">
                    {/* Stats cards */}
                    {[
                      { label: 'Active Projects', value: '12', icon: BarChart3, color: 'text-primary' },
                      { label: 'Team Members', value: '24', icon: Users, color: 'text-secondary' },
                      { label: 'Revenue', value: '$84.2K', icon: CreditCard, color: 'text-success' },
                      { label: 'Tasks Due', value: '38', icon: Calendar, color: 'text-warning' },
                    ].map((stat, i) => (
                      <div key={i} className="bg-card rounded-lg p-4 border border-border">
                        <div className="flex items-center justify-between mb-2">
                          <stat.icon className={cn('w-5 h-5', stat.color)} />
                          <span className="text-xs text-muted-foreground">+12%</span>
                        </div>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <div className="text-xs text-muted-foreground">{stat.label}</div>
                      </div>
                    ))}

                    {/* Chart placeholder */}
                    <div className="col-span-2 bg-card rounded-lg p-4 border border-border">
                      <div className="text-sm font-medium mb-4">Revenue Overview</div>
                      <div className="h-32 flex items-end gap-2">
                        {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                          <div
                            key={i}
                            className="flex-1 bg-gradient-primary rounded-t opacity-80"
                            style={{ height: `${h}%` }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Recent activity */}
                    <div className="col-span-2 bg-card rounded-lg p-4 border border-border">
                      <div className="text-sm font-medium mb-4">Recent Activity</div>
                      <div className="space-y-3">
                        {[
                          'Project "E-commerce Platform" completed',
                          'New client "TechCorp" onboarded',
                          'Invoice #1042 paid ($4,500)',
                        ].map((item, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 rounded-full bg-success" />
                            <span className="text-muted-foreground">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4" id="features">
        <div className="section">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything You Need to Scale
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed specifically for software development agencies
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Users,
                title: 'Client Management',
                description: 'Track leads, manage onboarding, and maintain lasting client relationships with our intuitive CRM.',
              },
              {
                icon: BarChart3,
                title: 'Project Tracking',
                description: 'Plan projects, set milestones, track tasks, and deliver on time with visual dashboards.',
              },
              {
                icon: CreditCard,
                title: 'Invoicing & Billing',
                description: 'Automated invoicing, milestone payments, and subscription management with Stripe.',
              },
              {
                icon: Shield,
                title: 'Role-Based Access',
                description: 'Multi-tenant workspace with granular permissions for owners, admins, and team members.',
              },
              {
                icon: Calendar,
                title: 'Resource Planning',
                description: 'Allocate team members, track availability, and prevent overbooking.',
              },
              {
                icon: Globe,
                title: 'Client Portal',
                description: 'Branded portal for clients to view progress, approve deliverables, and communicate.',
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-xl p-6 border border-border card-hover"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof / Testimonials */}
      <section className="py-20 px-4 bg-card/50">
        <div className="section">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Trusted by Leading Agencies
            </h2>
            <p className="text-lg text-muted-foreground">
              See what our customers have to say
            </p>
          </motion.div>

          {/* Company Logos */}
          <div className="flex flex-wrap justify-center items-center gap-8 mb-16 opacity-50">
            {['TechCorp', 'InnovateLab', 'DevStudio', 'CodeWorks', 'PixelPerfect'].map((company) => (
              <div key={company} className="flex items-center gap-2">
                <Building2 className="w-6 h-6" />
                <span className="font-semibold">{company}</span>
              </div>
            ))}
          </div>

          {/* Testimonials */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: "This platform transformed how we manage client projects. We've cut our admin time in half.",
                author: 'Sarah Chen',
                role: 'Founder, TechCorp Agency',
                rating: 5,
              },
              {
                quote: "The onboarding workflow is incredible. Clients love the professional experience.",
                author: 'Marcus Johnson',
                role: 'CEO, DevStudio',
                rating: 5,
              },
              {
                quote: "Finally, a tool built by developers for developers. The milestone billing saves us hours.",
                author: 'Emily Rodriguez',
                role: 'Managing Partner, CodeWorks',
                rating: 5,
              },
            ].map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-xl p-6 border border-border"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-warning text-warning" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">"{testimonial.quote}"</p>
                <div>
                  <div className="font-semibold">{testimonial.author}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4" id="how-it-works">
        <div className="section">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Get Started in Minutes
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Simple setup, powerful results
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Sign up in seconds',
                description: 'Create your workspace and invite your team. No credit card required.',
              },
              {
                step: '2',
                title: 'Add your clients',
                description: 'Import existing clients or start fresh with our guided onboarding.',
              },
              {
                step: '3',
                title: 'Manage & grow',
                description: 'Track projects, send invoices, and scale your agency with confidence.',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-primary text-white font-bold text-xl flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Secondary CTA */}
      <section className="py-20 px-4">
        <div className="section">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-card rounded-2xl p-8 sm:p-12 text-center border border-border relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent" />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Ready to Transform Your Agency?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join hundreds of agencies already using Enterprise to streamline their operations.
              </p>
              <Link to="/auth/register" className="btn-primary text-lg !py-4 !px-8 glow">
                Start Your Free Trial — No Credit Card Needed
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-card/30" id="faq">
        <div className="section max-w-3xl">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
          </motion.div>

          <div className="space-y-4">
            {[
              {
                q: 'What is included in the free trial?',
                a: 'The 14-day free trial includes full access to all Pro features. No credit card required to start.',
              },
              {
                q: 'How does pricing work?',
                a: 'We offer transparent, per-seat pricing. Choose from Free, Starter ($49/mo), Pro ($149/mo), or Enterprise plans.',
              },
              {
                q: 'Can I import my existing clients and projects?',
                a: 'Yes! We support CSV import and have integrations with popular tools like Notion, Asana, and Jira.',
              },
              {
                q: 'Is my data secure?',
                a: 'Absolutely. We use bank-level encryption, SOC 2 compliance, and your data is backed up daily.',
              },
              {
                q: 'Do you offer customer support?',
                a: 'All plans include email support. Pro and Enterprise plans get priority support with <4hr response times.',
              },
            ].map((faq, i) => (
              <motion.details
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group bg-card rounded-lg border border-border overflow-hidden"
              >
                <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-card-hover transition-colors">
                  <span className="font-medium">{faq.q}</span>
                  <ChevronDown className="w-5 h-5 text-muted-foreground group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-4 pb-4 text-muted-foreground">{faq.a}</div>
              </motion.details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border">
        <div className="section">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Code2 className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold">Enterprise</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="/privacy" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="/terms" className="hover:text-foreground transition-colors">Terms</a>
              <a href="mailto:support@softwarepros.dev" className="hover:text-foreground transition-colors">Contact</a>
            </div>
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} SoftwarePros. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
