'use client';

import React from 'react';
import Link from 'next/link';
import { Check, Star, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface PricingSectionProps {
  className?: string;
}

const plans = [
  {
    name: 'Starter',
    description: 'Perfect for personal projects and small applications',
    price: 'Free',
    period: 'forever',
    features: [
      'Up to 3 projects',
      'Basic authentication',
      'Community support',
      'Standard templates',
      'Basic analytics',
      '1GB storage'
    ],
    cta: 'Get Started',
    href: '/register',
    popular: false
  },
  {
    name: 'Pro',
    description: 'Ideal for growing businesses and professional use',
    price: '$29',
    period: 'per month',
    features: [
      'Unlimited projects',
      'Advanced authentication',
      'Priority support',
      'Premium templates',
      'Advanced analytics',
      '100GB storage',
      'Custom domains',
      'Team collaboration',
      'API access'
    ],
    cta: 'Start Free Trial',
    href: '/register?plan=pro',
    popular: true
  },
  {
    name: 'Enterprise',
    description: 'For large organizations with specific requirements',
    price: 'Custom',
    period: 'contact us',
    features: [
      'Everything in Pro',
      'Dedicated support',
      'Custom integrations',
      'Advanced security',
      'SLA guarantee',
      'Unlimited storage',
      'White-label solutions',
      'On-premise deployment',
      'Custom training'
    ],
    cta: 'Contact Sales',
    href: '/contact',
    popular: false
  }
];

export function PricingSection({ className }: PricingSectionProps) {
  return (
    <section className={cn('py-16 sm:py-24 bg-muted/30', className)}>
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            Simple, transparent{' '}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              pricing
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
            Choose the plan that fits your needs. Start free and upgrade as you grow. 
            No hidden fees, no surprises.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <Card key={index} className={cn(
              'relative overflow-hidden transition-all duration-300 hover:shadow-xl',
              plan.popular
                ? 'border-primary shadow-lg scale-105 bg-background'
                : 'hover:shadow-lg bg-background/60 backdrop-blur-sm'
            )}>
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-center py-2 text-sm font-medium">
                  <Star className="inline h-4 w-4 mr-1" />
                  Most Popular
                </div>
              )}
              
              <CardHeader className={cn('text-center', plan.popular && 'pt-12')}>
                <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                <CardDescription className="text-base mb-4">
                  {plan.description}
                </CardDescription>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && (
                    <span className="text-muted-foreground">/{plan.period}</span>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check className={cn(
                        'h-5 w-5 mt-0.5 flex-shrink-0',
                        plan.popular ? 'text-primary' : 'text-muted-foreground'
                      )} />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <CardFooter>
                <Button asChild className={cn(
                  'w-full',
                  plan.popular
                    ? 'bg-primary hover:bg-primary/90'
                    : 'variant-outline'
                )} variant={plan.popular ? 'default' : 'outline'}>
                  <Link href={plan.href}>
                    {plan.popular && <Zap className="mr-2 h-4 w-4" />}
                    {plan.cta}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        {/* FAQ Section */}
        <div className="mt-16 sm:mt-24">
          <h3 className="text-2xl sm:text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="space-y-4">
              <h4 className="font-semibold">Can I change plans later?</h4>
              <p className="text-muted-foreground">
                Yes, you can upgrade or downgrade your plan at any time. 
                Changes take effect immediately and are prorated.
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold">Is there a free trial?</h4>
              <p className="text-muted-foreground">
                Yes, all paid plans come with a 14-day free trial. 
                No credit card required to start.
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold">What payment methods do you accept?</h4>
              <p className="text-muted-foreground">
                We accept all major credit cards, PayPal, and bank transfers 
                for enterprise customers.
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold">Can I cancel anytime?</h4>
              <p className="text-muted-foreground">
                Absolutely. You can cancel your subscription at any time with 
                no penalties or cancellation fees.
              </p>
            </div>
          </div>
        </div>
        
        {/* Money back guarantee */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-sm font-medium">
            <Check className="h-4 w-4" />
            <span>30-day money-back guarantee</span>
          </div>
        </div>
      </div>
    </section>
  );
}