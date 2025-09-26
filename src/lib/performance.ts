import dynamic from 'next/dynamic'
import type { ComponentType } from 'react'

/**
 * Core Web Vitals thresholds based on Google's recommendations
 */
export const PERFORMANCE_THRESHOLDS = {
  LCP: { good: 2500, needsImprovement: 4000 }, // Largest Contentful Paint (ms)
  FID: { good: 100, needsImprovement: 300 },   // First Input Delay (ms)
  CLS: { good: 0.1, needsImprovement: 0.25 },  // Cumulative Layout Shift
  FCP: { good: 1800, needsImprovement: 3000 }, // First Contentful Paint (ms)
  TTFB: { good: 800, needsImprovement: 1800 }  // Time to First Byte (ms)
} as const

/**
 * Performance metric score calculation
 */
export function calculateScore(metric: keyof typeof PERFORMANCE_THRESHOLDS, value: number): 'good' | 'needsImprovement' | 'poor' {
  const threshold = PERFORMANCE_THRESHOLDS[metric]
  if (value <= threshold.good) return 'good'
  if (value <= threshold.needsImprovement) return 'needsImprovement'
  return 'poor'
}

/**
 * Dynamic import with loading component and performance optimizations
 */
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: {
    loading?: ComponentType
    ssr?: boolean
    suspense?: boolean
  } = {}
) {
  const { loading: LoadingComponent, ssr = false, suspense = false } = options

  return dynamic(importFn, {
    loading: LoadingComponent ? () => LoadingComponent({}) : undefined,
    ssr,
    suspense
  })
}

/**
 * Measure Core Web Vitals
 */
export function measureCoreWebVitals() {
  const metrics = {
    lcp: 0,
    fid: 0,
    cls: 0,
    fcp: 0,
    ttfb: 0
  }

  // Measure TTFB
  if ('navigation' in performance) {
    const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    metrics.ttfb = navEntry.responseStart - navEntry.requestStart
  }

  // Measure FCP
  if ('getEntriesByName' in performance) {
    const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0]
    if (fcpEntry) {
      metrics.fcp = fcpEntry.startTime
    }
  }

  return metrics
}

/**
 * Get overall performance score
 */
export function getPerformanceScore(metrics: Record<string, number>): number {
  const scores = Object.entries(metrics).map(([key, value]) => {
    if (key.toUpperCase() in PERFORMANCE_THRESHOLDS) {
      const score = calculateScore(key.toUpperCase() as keyof typeof PERFORMANCE_THRESHOLDS, value)
      return score === 'good' ? 100 : score === 'needsImprovement' ? 75 : 50
    }
    return 100
  })

  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
}

/**
 * Memory usage monitoring
 */
export function getMemoryUsage() {
  if ('memory' in performance) {
    const memory = (performance as any).memory
    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit
    }
  }
  return null
}

/**
 * Network information
 */
export function getNetworkInfo() {
  if ('connection' in navigator) {
    const connection = (navigator as any).connection
    return {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData
    }
  }
  return null
}

/**
 * Image optimization helper
 */
export function getOptimizedImageProps(src: string, alt: string, width?: number, height?: number) {
  return {
    src,
    alt,
    width,
    height,
    loading: 'lazy' as const,
    style: {
      width: width ? `${width}px` : 'auto',
      height: height ? `${height}px` : 'auto'
    }
  }
}

/**
 * Preload resource helper
 */
export function preloadResource(href: string, as: string, type?: string) {
  const link = document.createElement('link')
  link.rel = 'preload'
  link.href = href
  link.as = as
  if (type) link.type = type
  document.head.appendChild(link)
}