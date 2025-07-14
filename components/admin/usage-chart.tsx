'use client';

import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

// Mock data for demonstration
const usageData = [
  { name: 'Jan', users: 65, documents: 120, chats: 89 },
  { name: 'Feb', users: 78, documents: 145, chats: 112 },
  { name: 'Mar', users: 92, documents: 167, chats: 134 },
  { name: 'Apr', users: 108, documents: 189, chats: 156 },
  { name: 'May', users: 125, documents: 234, chats: 198 },
  { name: 'Jun', users: 142, documents: 267, chats: 223 },
  { name: 'Jul', users: 158, documents: 298, chats: 245 },
];

export function UsageChart() {
  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h3 className='text-sm font-medium'>Platform Usage Trends</h3>
        <div className='flex items-center space-x-4 text-xs'>
          <div className='flex items-center'>
            <div className='w-3 h-3 bg-blue-500 rounded-full mr-1'></div>
            <span>Users</span>
          </div>
          <div className='flex items-center'>
            <div className='w-3 h-3 bg-green-500 rounded-full mr-1'></div>
            <span>Documents</span>
          </div>
          <div className='flex items-center'>
            <div className='w-3 h-3 bg-purple-500 rounded-full mr-1'></div>
            <span>Chats</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width='100%' height={300}>
        <AreaChart data={usageData}>
          <CartesianGrid strokeDasharray='3 3' className='opacity-30' />
          <XAxis
            dataKey='name'
            axisLine={false}
            tickLine={false}
            className='text-xs'
          />
          <YAxis axisLine={false} tickLine={false} className='text-xs' />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: '12px',
            }}
          />
          <Area
            type='monotone'
            dataKey='users'
            stackId='1'
            stroke='#3b82f6'
            fill='#3b82f6'
            fillOpacity={0.1}
          />
          <Area
            type='monotone'
            dataKey='documents'
            stackId='1'
            stroke='#10b981'
            fill='#10b981'
            fillOpacity={0.1}
          />
          <Area
            type='monotone'
            dataKey='chats'
            stackId='1'
            stroke='#8b5cf6'
            fill='#8b5cf6'
            fillOpacity={0.1}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
