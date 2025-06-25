import React from 'react';
import { ClockIcon } from '@heroicons/react/24/outline';

const activities = [
  { type: 'Candidate', action: 'Added', name: 'Alice Johnson', date: '2024-06-20' },
  { type: 'Case', action: 'Updated', name: 'Support for Foster Carer', date: '2024-06-19' },
  { type: 'Contract', action: 'Signed', name: 'Trainer Agreement', date: '2024-06-18' },
  { type: 'Contact', action: 'Added', name: 'Foster Care Partner', date: '2024-06-17' },
  { type: 'Freelancer', action: 'Edited', name: 'Anna White', date: '2024-06-16' },
];

const typeColors = {
  Candidate: 'bg-blue-100 text-blue-800',
  Case: 'bg-green-100 text-green-800',
  Contract: 'bg-purple-100 text-purple-800',
  Contact: 'bg-yellow-100 text-yellow-800',
  Freelancer: 'bg-gray-100 text-gray-800',
};

export default function RecentActivityWidget() {
  return (
    <div className="bg-white rounded shadow p-3 mb-8">
      <h2 className="text-xl font-bold mb-4 text-left">Recent Activity</h2>
      <ul className="space-y-2">
        {activities.map((a, i) => (
          <li key={i} className="flex items-center gap-3 p-1 rounded hover:bg-green-50 transition min-h-[48px] overflow-hidden">
            <span className={`px-2 py-1 rounded text-xs font-semibold ${typeColors[a.type]} whitespace-nowrap`}>{a.type}</span>
            <span className="font-semibold text-xs text-gray-800 flex-1 w-0 truncate text-left">{a.name}</span>
            <span className="text-gray-500 text-xs flex-1 w-0 truncate text-right">{a.action}</span>
            <span className="ml-auto text-xs text-gray-400 flex items-center gap-1 whitespace-nowrap">
              <ClockIcon className="w-4 h-4" /> {a.date}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
} 