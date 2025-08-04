import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getCases } from '../services/cases';
import { getGeneratedContracts } from '../services/contracts';
import { getFreelancers } from '../services/freelancers';
import { getEnquiries } from '../services/enquiries';
import {
  UserGroupIcon,
  DocumentTextIcon,
  BriefcaseIcon,
  InboxIcon,
} from '@heroicons/react/24/outline';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#3b82f6', '#a21caf', '#22c55e', '#eab308'];

export default function Dashboard() {
  const { userInfo } = useAuth();
  const [cases, setCases] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [freelancers, setFreelancers] = useState([]);
  const [enquiries, setEnquiries] = useState([]);

  useEffect(() => {
    async function fetchAll() {
      const [casesData, contractsData, freelancersData, enquiriesData] = await Promise.all([
        getCases(),
        getGeneratedContracts(),
        getFreelancers(),
        getEnquiries(),
      ]);
      setCases(casesData);
      setContracts(contractsData);
      setFreelancers(freelancersData);
      setEnquiries(enquiriesData);
    }
    fetchAll();
  }, []);

  const summary = [
    { label: 'Cases', value: cases.length, icon: BriefcaseIcon, color: 'bg-blue-100', iconColor: 'text-blue-700' },
    { label: 'Contracts', value: contracts.length, icon: DocumentTextIcon, color: 'bg-purple-100', iconColor: 'text-purple-700' },
    { label: 'Freelancers', value: freelancers.length, icon: UserGroupIcon, color: 'bg-green-100', iconColor: 'text-green-700' },
    { label: 'Enquiries', value: enquiries.length, icon: InboxIcon, color: 'bg-yellow-100', iconColor: 'text-yellow-700' },
  ];

  const pieData = summary.map((s) => ({ name: s.label, value: s.value }));

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-left">Dashboard</h1>
      <div className="mb-8 text-lg text-left">
        Welcome, <span className="font-semibold">{userInfo?.name}</span> ({userInfo?.role})
      </div>
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
        {/* Left: Pie Chart */}
        <div className="col-span-1 h-90 flex flex-col items-center bg-white rounded shadow p-6">
          <h2 className="text-xl font-bold mb-4 self-start">Entity Distribution</h2>
          <ResponsiveContainer width={250} height={250}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                fill="#8884d8"
                label
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Right: Recent Lists */}
        <div className="col-span-2 flex flex-col gap-8">
          {/* Recent Cases */}
          <div className="bg-white rounded shadow p-6">
            <h2 className="text-lg font-bold mb-4">Recent Cases</h2>
            <ul className="flex flex-col gap-2">
              {cases.slice(0, 5).map((c) => (
                <li
                  key={c._id}
                  className="rounded bg-blue-50 sm:bg-transparent p-3 sm:p-0 flex flex-col sm:flex-row sm:justify-between sm:items-center"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                    <span className="font-semibold">{c.caseReferenceNumber || c._id}</span>
                    <span className="text-gray-600">{c.clientFullName}</span>
                  </div>
                  <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 w-max mt-2 sm:mt-0">
                    {c.status}
                  </span>
                </li>
              ))}
              {cases.length === 0 && <li className="text-gray-400">No cases found.</li>}
            </ul>
          </div>
          {/* Recent Contracts */}
          <div className="bg-white rounded shadow p-6">
            <h2 className="text-lg font-bold mb-4">Recent Contracts</h2>
            <ul className="flex flex-col gap-2">
              {contracts.slice(0, 5).map((c) => (
                <li
                  key={c._id}
                  className="rounded bg-purple-50 sm:bg-transparent p-3 sm:p-0 flex flex-col sm:flex-row sm:justify-between sm:items-center"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                    <span className="font-semibold">{c.name || c._id}</span>
                    <span className="text-gray-600">{c.roleType}</span>
                  </div>
                  <span className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-700 w-max mt-2 sm:mt-0">
                    {c.status}
                  </span>
                </li>
              ))}
              {contracts.length === 0 && <li className="text-gray-400">No contracts found.</li>}
            </ul>
          </div>
          {/* Recent Freelancers */}
          <div className="bg-white rounded shadow p-6">
            <h2 className="text-lg font-bold mb-4">Recent Freelancers</h2>
            <ul className="flex flex-col gap-2">
              {freelancers.slice(0, 5).map((f) => (
                <li
                  key={f._id}
                  className="rounded bg-green-50 sm:bg-transparent p-3 sm:p-0 flex flex-col sm:flex-row sm:justify-between sm:items-center"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                    <span className="font-semibold">{f.fullName}</span>
                    <span className="text-gray-600">{f.email}</span>
                  </div>
                  <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 w-max mt-2 sm:mt-0">
                    {f.role}
                  </span>
                </li>
              ))}
              {freelancers.length === 0 && <li className="text-gray-400">No freelancers found.</li>}
            </ul>
          </div>
          {/* Recent Enquiries */}
          <div className="bg-white rounded shadow p-6">
            <h2 className="text-lg font-bold mb-4">Recent Enquiries</h2>
            <ul className="flex flex-col gap-2">
              {enquiries.slice(0, 5).map((e) => (
                <li
                  key={e._id}
                  className="rounded bg-yellow-50 sm:bg-transparent p-3 sm:p-0 flex flex-col sm:flex-row sm:justify-between sm:items-center"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                    <span className="font-semibold">{e.full_name}</span>
                    <span className="text-gray-600">{e.email_address}</span>
                  </div>
                  <span className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-700 w-max mt-2 sm:mt-0">
                    {e.status}
                  </span>
                </li>
              ))}
              {enquiries.length === 0 && <li className="text-gray-400">No enquiries found.</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}