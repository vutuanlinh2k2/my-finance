import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import type { TimeRange } from '@/lib/dashboard/types'
import {
  DashboardSummaryCards,
  NetWorthHistoryChart,
  NetWorthPieChart,
} from '@/components/dashboard'
import {
  getMockNetWorthHistory,
  mockDashboardTotals,
  mockNetWorthSegments,
} from '@/lib/dashboard/mock-data'

export const Route = createFileRoute('/_authenticated/')({
  component: DashboardPage,
})

function DashboardPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('1m')

  // Get mock data based on selected time range
  const historyData = getMockNetWorthHistory(timeRange)

  return (
    <div className="flex flex-col gap-6">
      {/* Page Title */}
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Summary Cards */}
      <DashboardSummaryCards totals={mockDashboardTotals} />

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Pie Chart - 1/3 width on large screens */}
        <div className="flex h-[400px] flex-col rounded-lg border border-border bg-sidebar p-4">
          <h3 className="mb-4 text-sm font-medium text-muted-foreground">
            Net Worth Breakdown
          </h3>
          <div className="flex flex-1 items-center justify-center">
            <NetWorthPieChart
              segments={mockNetWorthSegments}
              totalNetWorth={mockDashboardTotals.netWorth}
            />
          </div>
        </div>

        {/* History Chart - 2/3 width on large screens */}
        <div className="h-[400px] lg:col-span-2">
          <NetWorthHistoryChart
            data={historyData}
            onTimeRangeChange={setTimeRange}
          />
        </div>
      </div>
    </div>
  )
}
