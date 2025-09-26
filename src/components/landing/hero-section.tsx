'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Zap, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface HeroSectionProps {
  className?: string;
}

export function HeroSection({ className }: HeroSectionProps) {
  return (
    <section className={cn('relative overflow-hidden bg-gradient-to-b from-background to-muted/20', className)}>
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-black/[0.02] bg-[size:60px_60px]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-full bg-gradient-to-b from-primary/10 via-transparent to-transparent blur-3xl" />
      
      <div className="relative container mx-auto px-4 py-16 sm:py-24 lg:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            <span>Built with modern technologies</span>
          </div>
          
          {/* Heading */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              Build amazing apps with{' '}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                MicroSaaS
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              The complete solution for modern web applications. Built with Next.js, AWS Amplify Gen 2, 
              and the latest tools for rapid development and deployment.
            </p>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="min-w-[200px]">
              <Link href="/register">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="min-w-[200px]">
              <Link href="/login">
                Sign In
              </Link>
            </Button>
          </div>
          
          {/* Feature highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto pt-8">
            <Card className="border-0 bg-background/60 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <Zap className="h-6 w-6 mx-auto mb-2 text-primary" />
                <h3 className="font-medium mb-1">Lightning Fast</h3>
                <p className="text-sm text-muted-foreground">
                  Built for performance with modern React patterns
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 bg-background/60 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <Shield className="h-6 w-6 mx-auto mb-2 text-primary" />
                <h3 className="font-medium mb-1">Secure by Default</h3>
                <p className="text-sm text-muted-foreground">
                  Enterprise-grade security with AWS Amplify
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 bg-background/60 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <Sparkles className="h-6 w-6 mx-auto mb-2 text-primary" />
                <h3 className="font-medium mb-1">Developer Friendly</h3>
                <p className="text-sm text-muted-foreground">
                  TypeScript, Tailwind, and modern tooling
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Social proof */}
          <div className="pt-8 border-t border-border/50">
            <p className="text-sm text-muted-foreground mb-4">
              Trusted by developers worldwide
            </p>
            <div className="flex justify-center items-center gap-8 opacity-60">
              <div className="text-2xl font-bold">AWS</div>
              <div className="text-2xl font-bold">Next.js</div>
              <div className="text-2xl font-bold">React</div>
              <div className="text-2xl font-bold">TypeScript</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}