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
  HardHat,
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
                <HardHat className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg">Villa Homes</span>
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
                Trusted by high-growth builders nationwide
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeInUp}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6"
            >
              Build Smarter Homes with{' '}
              <span className="gradient-text">Construction Intelligence</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={fadeInUp}
              className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8"
            >
              Schedule projects, coordinate trades, track budgets, and keep homeowners
              informed — all in one platform built for modern home builders.
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
                14-day builder trial
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
                      { label: 'Active Builds', value: '12', icon: Building2, color: 'text-primary' },
                      { label: 'Crew Members', value: '24', icon: Users, color: 'text-secondary' },
                      { label: 'Contract Value', value: '$8.4M', icon: CreditCard, color: 'text-success' },
                      { label: 'Inspections', value: '7 Due', icon: Calendar, color: 'text-warning' },
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
                      <div className="text-sm font-medium mb-4">Phase Progress</div>
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
                          'Framing completed — Belmont Ridge Lot 12',
                          'Homeowner approval received — Ashton Model',
                          'Change order #1042 approved ($14,500)',
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
              Everything You Need to Run the Jobsite
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Construction-first workflows built for project managers, supers, and owners
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Users,
                title: 'Homeowner Experience',
                description: 'Keep homeowners informed with portals, selections, and approval workflows built for builders.',
              },
              {
                icon: BarChart3,
                title: 'Phase-Based Scheduling',
                description: 'Track every phase from pre-construction to warranty with live progress insights.',
              },
              {
                icon: CreditCard,
                title: 'Budgets & Change Orders',
                description: 'Monitor contract value, manage change orders, and keep margins protected.',
              },
              {
                icon: Shield,
                title: 'Role-Based Controls',
                description: 'Give owners, supers, office staff, and clients exactly the access they need.',
              },
              {
                icon: Calendar,
                title: 'Trade Coordination',
                description: 'Assign subcontractors, track inspections, and prevent scheduling collisions.',
              },
              {
                icon: Globe,
                title: 'Field-Ready Updates',
                description: 'Capture daily logs, photos, and communications in one intelligent hub.',
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
              Trusted by Leading Builders
            </h2>
            <p className="text-lg text-muted-foreground">
              The construction teams moving fastest rely on Villa Homes
            </p>
          </motion.div>

          {/* Company Logos */}
          <div className="flex flex-wrap justify-center items-center gap-8 mb-16 opacity-50">
            {['Summit Homes', 'Hearthstone Builders', 'Ridgeview Construction', 'Evergreen Design-Build', 'Ironwood Residential'].map((company) => (
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
                quote: 'We can see every build phase and risk in one view. It changed how we run our jobsites.',
                author: 'Sarah Caldwell',
                role: 'COO, Summit Homes',
                rating: 5,
              },
              {
                quote: 'Homeowner communication is finally organized. Our NPS scores jumped in 60 days.',
                author: 'Marcus Johnson',
                role: 'Owner, Hearthstone Builders',
                rating: 5,
              },
              {
                quote: 'We reduced change order delays and protected margin with the built-in approvals.',
                author: 'Emily Rodriguez',
                role: 'VP Operations, Ridgeview Construction',
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
              Get Started in Days, Not Months
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Launch quickly with your teams, trades, and active projects
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Set up your builder profile',
                description: 'Configure your company details, branding, and project templates.',
              },
              {
                step: '2',
                title: 'Import active builds',
                description: 'Bring in homeowners, schedules, and budgets to get real-time insights.',
              },
              {
                step: '3',
                title: 'Run the jobsite',
                description: 'Coordinate trades, manage inspections, and keep homeowners updated.',
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
                Ready to Transform Your Construction Operations?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join builders using Villa Homes to deliver on schedule, protect margins, and delight homeowners.
              </p>
              <Link to="/auth/register" className="btn-primary text-lg !py-4 !px-8 glow">
                Start Your Builder Trial — No Credit Card Needed
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
                a: 'The 14-day builder trial includes full access to scheduling, homeowner portals, and analytics.',
              },
              {
                q: 'How does pricing work?',
                a: 'Pricing scales with your team size and active projects. Plans start at $49/mo per builder team.',
              },
              {
                q: 'Can I import my existing homeowners and schedules?',
                a: 'Yes. Import from CSV or connect your existing spreadsheets to bring active jobs live.',
              },
              {
                q: 'Is my data secure?',
                a: 'Absolutely. We use bank-level encryption with daily backups and audit-ready access controls.',
              },
              {
                q: 'Do you offer customer support?',
                a: 'All plans include builder-focused support. Pro and Enterprise include priority response times.',
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
                <HardHat className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold">Villa Homes</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="/privacy" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="/terms" className="hover:text-foreground transition-colors">Terms</a>
              <a href="mailto:support@villahomes.ai" className="hover:text-foreground transition-colors">Contact</a>
            </div>
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Villa Homes Construction Intelligence Platform.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
