'use client'

import { useEffect, useState } from 'react'
import {
  measureWebVitals,
  getPerformanceScore,
  PerformanceMonitor as PerfMonitor,
  getMemoryUsage,
  getNetworkInfo,
  type PerformanceMetrics
} from '@/lib/performance'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Activity,
  Gauge,
  Network,
  HardDrive,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react'

interface PerformanceMonitorProps {
  enableRealTimeMonitoring?: boolean
  showDetails?: boolean
  className?: string
}

export function PerformanceMonitor({
  enableRealTimeMonitoring = false,
  showDetails = false,
  className = ''
}: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<Partial<PerformanceMetrics>>({})
  const [score, setScore] = useState<ReturnType<typeof getPerformanceScore> | null>(null)
  const [memoryUsage, setMemoryUsage] = useState<ReturnType<typeof getMemoryUsage>>(null)
  const [networkInfo, setNetworkInfo] = useState<ReturnType<typeof getNetworkInfo>>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [monitor, setMonitor] = useState<PerfMonitor | null>(null)

  const measurePerformance = async () => {
    setIsLoading(true)
    try {
      const webVitals = await measureWebVitals()
      setMetrics(webVitals)
      setScore(getPerformanceScore(webVitals))
      setMemoryUsage(getMemoryUsage())
      setNetworkInfo(getNetworkInfo())
    } catch (error) {
      console.error('Failed to measure performance:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Initial measurement
    measurePerformance()

    // Set up real-time monitoring if enabled
    if (enableRealTimeMonitoring) {
      const perfMonitor = new PerfMonitor()
      setMonitor(perfMonitor)

      return () => {
        perfMonitor.disconnect()
      }
    }
  }, [enableRealTimeMonitoring])

  const getScoreColor = (rating: string) => {
    switch (rating) {
      case 'good':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'needs-improvement':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'poor':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getScoreIcon = (rating: string) => {
    switch (rating) {
      case 'good':
        return <CheckCircle className="w-4 h-4" />
      case 'needs-improvement':
        return <AlertTriangle className="w-4 h-4" />
      case 'poor':
        return <XCircle className="w-4 h-4" />
      default:
        return <Gauge className="w-4 h-4" />
    }
  }

  const formatMetricValue = (key: string, value: number) => {
    switch (key) {
      case 'LCP':
      case 'FCP':
      case 'FID':
      case 'TTFB':
        return `${value.toFixed(2)}s`
      case 'CLS':
        return value.toFixed(3)
      default:
        return value.toString()
    }
  }

  if (!showDetails && (!score || Object.keys(metrics).length === 0)) {
    return null
  }

  const compactView = (
    <div className={`flex items-center gap-2 ${className}`}>
      {score && (
        <Badge
          variant="outline"
          className={`flex items-center gap-1 ${getScoreColor(score.rating)}`}
        >
          {getScoreIcon(score.rating)}
          <span className="text-xs font-medium">
            Performance: {score.score.toFixed(0)}
          </span>
        </Badge>
      )}
    </div>
  )

  const detailedView = (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Performance Metrics
            </CardTitle>
            <CardDescription>
              Core Web Vitals and performance monitoring
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={measurePerformance}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="vitals" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="vitals">Web Vitals</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          <TabsContent value="vitals" className="space-y-4">
            {score && (
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-3">
                  {getScoreIcon(score.rating)}
                  <div>
                    <h3 className="font-medium">Overall Score</h3>
                    <p className="text-sm text-muted-foreground">
                      Based on Core Web Vitals
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{score.score.toFixed(0)}</div>
                  <Badge
                    variant="outline"
                    className={getScoreColor(score.rating)}
                  >
                    {score.rating.replace('-', ' ')}
                  </Badge>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(score?.details || {}).map(([key, detail]) => (
                <div key={key} className="p-3 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{key}</h4>
                    <Badge
                      variant="outline"
                      className={`text-xs ${getScoreColor(detail.rating)}`}
                    >
                      {detail.rating}
                    </Badge>
                  </div>
                  <div className="text-lg font-bold">
                    {formatMetricValue(key, detail.value)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Good: &lt; {formatMetricValue(key, detail.threshold.good)}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="resources" className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Resource loading and optimization metrics
            </div>
            {/* Add resource metrics here */}
            <div className="p-4 rounded-lg border text-center text-muted-foreground">
              Resource analysis available in production build
            </div>
          </TabsContent>

          <TabsContent value="system" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {memoryUsage && (
                <div className="p-3 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <HardDrive className="w-4 h-4" />
                    <h4 className="font-medium text-sm">Memory Usage</h4>
                  </div>
                  <div className="text-lg font-bold">
                    {memoryUsage.percentage.toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {(memoryUsage.used / 1024 / 1024).toFixed(1)} MB / {(memoryUsage.total / 1024 / 1024).toFixed(1)} MB
                  </div>
                </div>
              )}

              {networkInfo && (
                <div className="p-3 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <Network className="w-4 h-4" />
                    <h4 className="font-medium text-sm">Network</h4>
                  </div>
                  <div className="text-lg font-bold">
                    {networkInfo.effectiveType}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {networkInfo.downlink} Mbps • {networkInfo.rtt}ms RTT
                    {networkInfo.saveData && ' • Save Data'}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )

  return showDetails ? detailedView : compactView
}

export default PerformanceMonitor