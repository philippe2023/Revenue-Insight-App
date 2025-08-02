import { cn } from "@/lib/utils"

interface LoadingSkeletonProps {
  className?: string
  children?: React.ReactNode
}

export function LoadingSkeleton({ className, children }: LoadingSkeletonProps) {
  return (
    <div className={cn("loading-skeleton", className)}>
      {children}
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 space-y-4">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-lg loading-skeleton"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded loading-skeleton"></div>
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4 loading-skeleton"></div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded loading-skeleton"></div>
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-5/6 loading-skeleton"></div>
      </div>
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
          <div className="w-4 h-4 bg-slate-200 dark:bg-slate-700 rounded loading-skeleton"></div>
          <div className="flex-1 h-4 bg-slate-200 dark:bg-slate-700 rounded loading-skeleton"></div>
          <div className="w-20 h-4 bg-slate-200 dark:bg-slate-700 rounded loading-skeleton"></div>
          <div className="w-16 h-4 bg-slate-200 dark:bg-slate-700 rounded loading-skeleton"></div>
        </div>
      ))}
    </div>
  )
}

export function ChartSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-32 loading-skeleton"></div>
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-20 loading-skeleton"></div>
        </div>
        <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded loading-skeleton"></div>
      </div>
    </div>
  )
}
