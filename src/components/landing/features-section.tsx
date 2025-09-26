'use client';

import React from 'react';
import {
  Code2,
  Database,
  Lock,
  Smartphone,
  Zap,
  Users,
  BarChart3,
  Palette,
  Cloud
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface FeaturesSectionProps {
  className?: string;
}

const features = [
  {
    icon: Code2,
    title: 'Modern Tech Stack',
    description: 'Built with Next.js 14, React 18, TypeScript, and Tailwind CSS for the best developer experience.',
    color: 'text-blue-500'
  },
  {
    icon: Database,
    title: 'AWS Amplify Gen 2',
    description: 'Serverless backend with GraphQL API, real-time subscriptions, and managed infrastructure.',
    color: 'text-orange-500'
  },
  {
    icon: Lock,
    title: 'Enterprise Security',
    description: 'Built-in authentication, authorization, and data protection with AWS Cognito and best practices.',
    color: 'text-green-500'
  },
  {
    icon: Smartphone,
    title: 'Mobile Responsive',
    description: 'Beautiful, accessible UI that works perfectly on desktop, tablet, and mobile devices.',
    color: 'text-purple-500'
  },
  {
    icon: Zap,
    title: 'Lightning Performance',
    description: 'Optimized for speed with server-side rendering, code splitting, and intelligent caching.',
    color: 'text-yellow-500'
  },
  {
    icon: Users,
    title: 'User Management',
    description: 'Complete user authentication flow with registration, login, password reset, and profile management.',
    color: 'text-indigo-500'
  },
  {
    icon: BarChart3,
    title: 'Real-time Analytics',
    description: 'Track user activities and application metrics with real-time updates and subscriptions.',
    color: 'text-red-500'
  },
  {
    icon: Palette,
    title: 'Beautiful Design',
    description: 'Stunning UI components built with shadcn/ui and Radix primitives for consistent design.',
    color: 'text-pink-500'
  },
  {
    icon: Cloud,
    title: 'Scalable Infrastructure',
    description: 'Auto-scaling serverless architecture that grows with your application and user base.',
    color: 'text-cyan-500'
  }
];

export function FeaturesSection({ className }: FeaturesSectionProps) {
  return (
    <section className={cn('py-16 sm:py-24', className)}>
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            Everything you need to build{' '}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              amazing apps
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
            MicroSaaS provides a complete foundation with modern technologies, 
            best practices, and production-ready features out of the box.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-0 bg-background/60 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className={cn(
                    'w-12 h-12 rounded-lg bg-background/80 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300',
                    'ring-1 ring-border/50'
                  )}>
                    <Icon className={cn('h-6 w-6', feature.color)} />
                  </div>
                  <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        {/* Additional info section */}
        <div className="mt-16 sm:mt-24">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl p-8 sm:p-12">
            <div className="max-w-3xl mx-auto text-center">
              <h3 className="text-2xl sm:text-3xl font-bold mb-4">
                Built for developers, by developers
              </h3>
              <p className="text-lg text-muted-foreground mb-8">
                We understand the challenges of building modern web applications. 
                That's why MicroSaaS includes everything you need to go from idea to production quickly and efficiently.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">10x</div>
                  <div className="text-sm text-muted-foreground">Faster Development</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">99.9%</div>
                  <div className="text-sm text-muted-foreground">Uptime Guarantee</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">∞</div>
                  <div className="text-sm text-muted-foreground">Scalability</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}