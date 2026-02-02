import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'

interface CallActivityData {
  date: string
  calls: number
}

interface CallActivityChartProps {
  data: CallActivityData[]
}

export function CallActivityChart({ data }: CallActivityChartProps) {
  // If no data, show empty state
  if (!data || data.length === 0) {
    return (
      <div className='h-[350px] flex items-center justify-center text-muted-foreground'>
        No call activity data available
      </div>
    )
  }

  // Format data for the chart - ensure we have 7 days
  const chartData = data.slice(-7).map((item) => ({
    ...item,
    day: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
  }))

  return (
    <ResponsiveContainer width='100%' height={350}>
      <LineChart data={chartData}>
        <XAxis
          dataKey='day'
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              return (
                <div className='rounded-lg border bg-background p-2 shadow-sm'>
                  <div className='grid grid-cols-2 gap-2'>
                    <div className='flex flex-col'>
                      <span className='text-[0.70rem] uppercase text-muted-foreground'>
                        Day
                      </span>
                      <span className='font-bold text-muted-foreground'>
                        {label}
                      </span>
                    </div>
                    <div className='flex flex-col'>
                      <span className='text-[0.70rem] uppercase text-muted-foreground'>
                        Calls
                      </span>
                      <span className='font-bold'>
                        {payload[0].value}
                      </span>
                    </div>
                  </div>
                </div>
              )
            }
            return null
          }}
        />
        <Line
          type='monotone'
          dataKey='calls'
          strokeWidth={2}
          stroke='hsl(var(--primary))'
          dot={{
            fill: 'hsl(var(--primary))',
            strokeWidth: 2,
            r: 4,
          }}
          activeDot={{
            r: 6,
            fill: 'hsl(var(--primary))',
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}