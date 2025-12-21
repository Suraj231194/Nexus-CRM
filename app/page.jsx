"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Zap,
  BarChart3,
  Users,
  Layers,
  ArrowRight,
  Star,
  Check,
  Menu,
  Shield,
  Globe,
  TrendingUp,
  BrainCircuit,
  LayoutDashboard
} from "lucide-react";

const Index = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary/20">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/20">
              <Zap className="h-5 w-5 text-primary-foreground fill-current" />
            </div>
            <span className="text-xl font-bold tracking-tight">RevenueOS</span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link href="#features" className="hover:text-foreground transition-colors">Features</Link>
            <Link href="#testimonials" className="hover:text-foreground transition-colors">Testimonials</Link>
            <Link href="#pricing" className="hover:text-foreground transition-colors">Pricing</Link>
            <Link href="#faq" className="hover:text-foreground transition-colors">FAQ</Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden sm:block">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">Log in</Button>
            </Link>
            <Link href="/signup">
              <Button className="shadow-lg shadow-primary/20">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-24 pb-32 overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-primary/20 blur-[120px] rounded-full opacity-30 pointer-events-none" />

          <div className="container flex flex-col items-center text-center space-y-8">
            <Badge variant="outline" className="px-4 py-1.5 rounded-full border-primary/20 bg-primary/5 text-primary animate-fade-in">
              <span className="mr-2 text-primary">✨</span> New: AI-Powered Sales Forecasting
            </Badge>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight max-w-4xl animate-slide-in">
              Supercharge Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-pink-500">Revenue Engine</span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl animate-slide-in delay-100">
              The all-in-one CRM platform designed for high-growth teams. Close deals 2x faster, automate busywork, and forecast with AI-driven precision.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 animate-slide-in delay-200">
              <Link href="/signup">
                <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all">
                  Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-2 hover:bg-muted/50">
                  View Live Demo
                </Button>
              </Link>
            </div>

            {/* Dashboard Preview */}
            <div className="relative mt-16 w-full max-w-6xl mx-auto rounded-xl border bg-background/50 backdrop-blur shadow-2xl overflow-hidden animate-scale-in delay-300">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-purple-500/5" />
              <div className="p-2 bg-muted/20 border-b flex items-center gap-2">
                <div className="flex gap-1.5 ml-2">
                  <div className="w-3 h-3 rounded-full bg-red-400/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                  <div className="w-3 h-3 rounded-full bg-green-400/80" />
                </div>
                <div className="flex-1 text-center text-xs text-muted-foreground font-mono">dashboard.revenueos.io</div>
              </div>

              {/* Mock Dashboard UI */}
              <div className="p-6 md:p-8 grid grid-cols-12 gap-6 h-[400px] md:h-[600px] overflow-hidden bg-background">
                {/* Sidebar */}
                <div className="hidden md:block col-span-2 space-y-4 border-r pr-6">
                  <div className="h-8 w-3/4 bg-muted rounded animate-pulse" />
                  <div className="space-y-2 pt-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="h-8 flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                        <div className="w-4 h-4 rounded bg-muted-foreground/20" />
                        <div className="w-2/3 h-3 rounded bg-muted-foreground/10" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Main Content */}
                <div className="col-span-12 md:col-span-10 space-y-6">
                  <div className="flex justify-between items-center">
                    <div className="h-8 w-1/3 bg-muted rounded animate-pulse" />
                    <div className="flex gap-2">
                      <div className="h-8 w-24 bg-primary/10 rounded" />
                      <div className="h-8 w-24 bg-muted rounded" />
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-24 rounded-xl border bg-card p-4 shadow-sm hover:shadow-md transition-all">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 mb-3" />
                        <div className="h-4 w-1/2 bg-muted rounded mb-2" />
                        <div className="h-6 w-3/4 bg-primary/5 rounded" />
                      </div>
                    ))}
                  </div>

                  {/* Chart Area */}
                  <div className="grid grid-cols-3 gap-6 h-full">
                    <div className="col-span-2 h-64 rounded-xl border bg-card p-6 shadow-sm">
                      <div className="flex justify-between mb-6">
                        <div className="h-5 w-32 bg-muted rounded" />
                      </div>
                      <div className="h-40 flex items-end gap-2 px-2">
                        {[40, 60, 45, 70, 50, 80, 65, 85, 90, 75, 95].map((h, i) => (
                          <div key={i} className="flex-1 bg-primary/80 rounded-t-sm hover:bg-primary transition-colors" style={{ height: `${h}%` }} />
                        ))}
                      </div>
                    </div>
                    <div className="col-span-1 h-64 rounded-xl border bg-card p-6 shadow-sm">
                      <div className="h-5 w-24 bg-muted rounded mb-4" />
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-muted" />
                            <div className="space-y-1 flex-1">
                              <div className="h-3 w-3/4 bg-muted rounded" />
                              <div className="h-2 w-1/2 bg-muted/50 rounded" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-12 border-y bg-muted/20">
          <div className="container">
            <p className="text-center text-sm font-semibold text-muted-foreground mb-8 uppercase tracking-wider">Trusted by high-growth teams at</p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
              {['Acme Corp', 'GlobalTech', 'Nebula', 'Sisyphus', 'Layers', 'Circooles'].map((company) => (
                <div key={company} className="flex items-center gap-2 text-xl font-bold">
                  <Globe className="h-5 w-5" /> {company}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 container">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold">Everything you need to grow</h2>
            <p className="text-xl text-muted-foreground">Stop juggling multiple tools. RevenueOS combines the power of a CRM, Sales Engagement, and Analytics into one seamless platform.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <LayoutDashboard className="h-6 w-6 text-primary" />,
                title: "Unified Pipeline",
                desc: "Visualize your entire sales process in one place. Drag and drop deals, set automated triggers, and never let a lead slip through the cracks."
              },
              {
                icon: <TrendingUp className="h-6 w-6 text-purple-500" />,
                title: "Advanced Analytics",
                desc: "Get real-time insights into your revenue performance. Track conversion rates, team velocity, and forecast accuracy with zero setup."
              },
              {
                icon: <BrainCircuit className="h-6 w-6 text-pink-500" />,
                title: "AI Automation",
                desc: "Let AI handle the busywork. Automated data entry, smart follow-ups, and lead scoring so your team can focus on closing."
              }
            ].map((feature, i) => (
              <Card key={i} className="border-2 hover:border-primary/50 transition-all hover:-translate-y-1 duration-300">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-background border shadow-sm flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.desc}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Detailed Feature: Pipeline */}
        <section className="py-24 bg-muted/30">
          <div className="container grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge>Pipeline Management</Badge>
              <h2 className="text-3xl md:text-4xl font-bold">Manage sales like a pro, not a spreadsheet.</h2>
              <p className="text-lg text-muted-foreground">
                Say goodbye to clunky spreadsheets and outdated CRMs. Our intuitive kanban board makes managing deals effortless and actually enjoyable.
              </p>
              <ul className="space-y-4 pt-4">
                {[
                  "Drag-and-drop interface",
                  "Customizable stages",
                  "Automated probability calculation",
                  "Instant deal warnings"
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                      <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Button size="lg" className="mt-4">Explore Pipeline <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </div>

            <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl border bg-background group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              {/* Abstract Representation of Pipeline */}
              <div className="w-full h-full p-6 flex gap-4 bg-muted/10">
                <div className="flex-1 rounded-lg bg-background border border-dashed flex flex-col gap-3 p-3">
                  <div className="h-4 w-24 bg-muted rounded" />
                  <div className="h-20 rounded bg-white shadow-sm border p-3 cursor-grab hover:rotate-1 transition-transform">
                    <span className="block h-3 w-16 bg-primary/20 rounded mb-2" />
                    <span className="block h-2 w-full bg-muted/20 rounded" />
                  </div>
                  <div className="h-20 rounded bg-white shadow-sm border p-3 opacity-50"></div>
                </div>
                <div className="flex-1 rounded-lg bg-background border flex flex-col gap-3 p-3 pt-12">
                  <div className="h-24 rounded bg-white shadow-md border-l-4 border-l-primary p-3 scale-105 shadow-lg">
                    <span className="block h-3 w-20 bg-primary rounded mb-2" />
                    <span className="block h-2 w-full bg-muted/20 rounded" />
                    <div className="mt-4 flex gap-2">
                      <span className="h-5 w-5 rounded-full bg-blue-100" />
                      <span className="h-5 w-5 rounded-full bg-purple-100" />
                    </div>
                  </div>
                </div>
                <div className="flex-1 rounded-lg bg-background border border-dashed flex flex-col gap-3 p-3">
                  <div className="h-4 w-24 bg-muted rounded" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Detailed Feature: Analytics */}
        <section className="py-24 container grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1 relative aspect-square md:aspect-video rounded-xl overflow-hidden shadow-2xl border bg-background p-8">
            <div className="h-full flex flex-col">
              <div className="flex justify-between items-center mb-8">
                <h3 className="font-bold text-xl">Revenue Forecast</h3>
                <Badge variant="secondary">+24% vs last month</Badge>
              </div>
              <div className="flex-1 flex items-end gap-2 px-4 pb-4">
                {[30, 45, 35, 60, 50, 75, 65, 90, 85].map((h, i) => (
                  <div key={i} className="flex-1 bg-gradient-to-t from-primary/60 to-primary rounded-t-md hover:opacity-80 transition-opacity" style={{ height: `${h}%` }} />
                ))}
              </div>
              <div className="grid grid-cols-9 gap-2 text-xs text-muted-foreground text-center pt-2 border-t">
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'].map(m => <div key={m}>{m}</div>)}
              </div>
            </div>
          </div>

          <div className="order-1 md:order-2 space-y-6">
            <Badge variant="secondary" className="text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300">Real-time Analytics</Badge>
            <h2 className="text-3xl md:text-4xl font-bold">Data-driven decisions, simplified.</h2>
            <p className="text-lg text-muted-foreground">
              Stop guessing. Get instant visibility into your sales funnel, team performance, and revenue projections with our beautiful, real-time dashboards.
            </p>
            <div className="grid grid-cols-2 gap-6 pt-4">
              <div className="space-y-2">
                <h4 className="font-bold text-xl text-primary">99.9%</h4>
                <p className="text-sm text-muted-foreground">Forecast Accuracy</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-xl text-primary">2.5x</h4>
                <p className="text-sm text-muted-foreground">Revenue Growth</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="py-24 bg-muted/30">
          <div className="container text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">Loved by sales teams everywhere</h2>
          </div>
          <div className="container grid md:grid-cols-3 gap-8">
            {[
              {
                q: "RevenueOS completely transformed how we manage leads. We've seen a 40% increase in closed deals within the first quarter.",
                a: "Sarah Chen",
                r: "VP of Sales at TechFlow"
              },
              {
                q: "The AI forecasting is uncannily accurate. It saved us hundreds of hours of manual reporting and meetings.",
                a: "Marcus Rodriguez",
                r: "CRO at ScaleUp"
              },
              {
                q: "Finally, a CRM that my team actually wants to use. Validated UI/UX and zero friction. Absolutely worth every penny.",
                a: "Emily Watson",
                r: "Founder at GrowthLabs"
              }
            ].map((t, i) => (
              <Card key={i} className="bg-background border-none shadow-lg">
                <CardHeader>
                  <div className="flex gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map(s => <Star key={s} className="h-4 w-4 text-yellow-500 fill-current" />)}
                  </div>
                  <CardDescription className="text-foreground text-lg italic">"{t.q}"</CardDescription>
                </CardHeader>
                <CardFooter className="flex items-center gap-4">
                  <Avatar>
                    <AvatarFallback className="bg-primary/10 text-primary">{t.a[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">{t.a}</div>
                    <div className="text-xs text-muted-foreground">{t.r}</div>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-24 container">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold">Simple, transparent pricing</h2>
            <p className="text-xl text-muted-foreground">Choose the plan that's right for your growth stage.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: "Starter",
                price: "$0",
                desc: "Perfect for solopreneurs.",
                feats: ["Up to 1,000 Contacts", "Basic Pipeline", "Email Integration", "Mobile App"],
                cta: "Start for Free"
              },
              {
                name: "Growth",
                price: "$49",
                desc: "For fast-growing teams.",
                feats: ["Unlimited Contacts", "Advanced Analytics", "Sales Automation", "Custom Roles"],
                cta: "Start Free Trial",
                pop: true
              },
              {
                name: "Enterprise",
                price: "Custom",
                desc: "For large organizations.",
                feats: ["Dedicated Support", "API Access", "SSO & Security", "Custom Onboarding"],
                cta: "Contact Sales"
              }
            ].map((plan, i) => (
              <Card key={i} className={`flex flex-col ${plan.pop ? 'border-primary shadow-2xl scale-105 z-10' : 'border shadow-md'}`}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    {plan.name}
                    {plan.pop && <Badge>Most Popular</Badge>}
                  </CardTitle>
                  <CardDescription>{plan.desc}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">/mo</span>
                  </div>
                  <ul className="space-y-3">
                    {plan.feats.map(f => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" variant={plan.pop ? "default" : "outline"}>{plan.cta}</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-24 container max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Is there a free trial?</AccordionTrigger>
              <AccordionContent>
                Yes! We offer a 14-day free trial on the Growth plan, and we also have a forever-free Starter plan for individuals.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Can I import data from other CRMs?</AccordionTrigger>
              <AccordionContent>
                Absolutely. We have one-click importers for Salesforce, HubSpot, Pipedrive, and Excel/CSV files.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Is my data secure?</AccordionTrigger>
              <AccordionContent>
                Security is our top priority. We are SOC2 Type II compliant, use bank-grade encryption, and perform regular security audits.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* CTA */}
        <section className="py-24 container">
          <div className="relative rounded-3xl bg-primary px-6 py-16 md:px-16 md:py-24 overflow-hidden text-center text-primary-foreground">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff2a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff2a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />
            <h2 className="relative text-3xl md:text-5xl font-bold mb-6">Ready to supercharge your revenue?</h2>
            <p className="relative text-xl md:text-2xl text-primary-foreground/80 max-w-2xl mx-auto mb-10">
              Join 10,000+ sales teams who are closing more deals with RevenueOS.
            </p>
            <div className="relative flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/signup">
                <Button size="lg" variant="secondary" className="h-14 px-8 text-lg font-bold">Start Free Trial</Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">Talk to Sales</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/20">
        <div className="container py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Zap className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">RevenueOS</span>
            </div>
            <p className="text-sm text-muted-foreground">
              The modern CRM for modern revenue teams. Built for speed, designed for growth.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-foreground">Features</Link></li>
              <li><Link href="#" className="hover:text-foreground">Pricing</Link></li>
              <li><Link href="#" className="hover:text-foreground">Integrations</Link></li>
              <li><Link href="#" className="hover:text-foreground">Changelog</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-foreground">About</Link></li>
              <li><Link href="#" className="hover:text-foreground">Careers</Link></li>
              <li><Link href="#" className="hover:text-foreground">Blog</Link></li>
              <li><Link href="#" className="hover:text-foreground">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-foreground">Privacy</Link></li>
              <li><Link href="#" className="hover:text-foreground">Terms</Link></li>
              <li><Link href="#" className="hover:text-foreground">Security</Link></li>
            </ul>
          </div>
        </div>
        <div className="container py-6 border-t text-sm text-center text-muted-foreground">
          © 2024 RevenueOS Inc. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Index;
