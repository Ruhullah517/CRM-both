import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import RemindersWidget from '../components/RemindersWidget';
import RecentActivityWidget from '../components/RecentActivityWidget';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import {
  CalendarDaysIcon,
  BriefcaseIcon,
  UserGroupIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { mockDashboard } from "../utils/mockData";

const summary = [
  { label: 'Upcoming Training Events', value: mockDashboard.upcomingTrainings.length, icon: CalendarDaysIcon, color: 'bg-green-100', iconColor: 'text-green-700' },
  { label: 'Active Support Cases', value: mockDashboard.activeCases, icon: UserGroupIcon, color: 'bg-blue-100', iconColor: 'text-blue-700' },
  { label: 'Sales Pipeline', value: mockDashboard.salesPipeline.reduce((a, b) => a + b.count, 0), icon: BriefcaseIcon, color: 'bg-yellow-100', iconColor: 'text-yellow-700' },
  { label: 'Contracts in Progress', value: mockDashboard.contractProgress.length, icon: DocumentTextIcon, color: 'bg-purple-100', iconColor: 'text-purple-700' },
];

const COLORS = ['#22c55e', '#eab308', '#3b82f6', '#a21caf'];

export default function Dashboard() {
  const { userInfo } = useAuth();
  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-left">Dashboard</h1>
      <div className="mb-8 text-lg text-left">Welcome, <span className="font-semibold">{userInfo?.name}</span> ({userInfo?.role})</div>
      {/* Summary Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {summary.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className={`flex-1 min-w-[180px] rounded-lg shadow p-6 flex items-center gap-4 ${s.color}`}>
              <div className={`rounded-full p-2 ${s.iconColor} bg-white shadow`}>
                <Icon className="w-7 h-7" />
              </div>
              <div>
                <div className="text-2xl font-bold mb-1">{s.value}</div>
                <div className="text-gray-700 font-semibold text-sm">{s.label}</div>
              </div>
            </div>
          );
        })}
      </div>
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Reminders & Activity */}
        <div className="col-span-1 flex flex-col gap-8">
          <RemindersWidget />
          <RecentActivityWidget />
        </div>
        {/* Right: Charts & Calendar */}
        <div className="col-span-2 flex flex-col gap-8">
          {/* Sales Pipeline Chart */}
          <div className="bg-white rounded shadow p-6 flex flex-col items-center">
            <h2 className="text-xl font-bold mb-4 self-start">Sales Pipeline Overview</h2>
            <div className="relative flex items-center justify-center" style={{ width: 220, height: 220 }}>
              <ResponsiveContainer width={220} height={220}>
                <PieChart>
                  <Pie
                    data={mockDashboard.salesPipeline}
                    dataKey="count"
                    nameKey="stage"
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    startAngle={210}
                    endAngle={-30}
                    paddingAngle={4}
                  >
                    <Cell fill="#2EAB2C" /> {/* Lead - green */}
                    <Cell fill="#eab308" /> {/* Contacted - yellow */}
                    <Cell fill="#3b82f6" /> {/* Closed - blue */}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              {/* Center Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-extrabold text-gray-900">80%+</span>
                <span className="text-lg text-gray-500 font-semibold">Leads</span>
              </div>
            </div>
            {/* Custom Legend */}
            <div className="flex gap-8 mt-6">
              <div className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 rounded-full" style={{ background: "#2EAB2C" }}></span>
                <span className="text-sm font-semibold text-gray-700">Lead</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 rounded-full" style={{ background: "#eab308" }}></span>
                <span className="text-sm font-semibold text-gray-700">Contacted</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 rounded-full" style={{ background: "#3b82f6" }}></span>
                <span className="text-sm font-semibold text-gray-700">Closed</span>
              </div>
            </div>
          </div>
          {/* Contract Progress Table */}
          <div className="bg-white rounded shadow p-6">
            <h2 className="text-xl font-bold mb-4">Contract Progress</h2>
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="py-2">Contract</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {mockDashboard.contractProgress.map((c, i) => (
                  <tr key={i} className="border-t">
                    <td className="py-2 font-semibold">{c.name}</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${c.status === 'Signed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{c.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Upcoming Trainings Calendar/List */}
          <div className="bg-white rounded shadow p-6">
            <h2 className="text-xl font-bold mb-4">Upcoming Training Events</h2>
            <ul>
              {mockDashboard.upcomingTrainings.map((event, i) => (
                <li key={i} className="mb-2 flex items-center">
                  <span className="mr-3 text-green-700">📅</span>
                  <span className="font-semibold mr-2">{event.date}</span>
                  <span>{event.title}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
