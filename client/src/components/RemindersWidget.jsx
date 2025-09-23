import React, { useEffect, useState } from 'react';
import { listReminders, completeReminder } from '../services/reminders';

const typeColors = {
  Candidate: 'bg-blue-100 text-blue-800',
  Case: 'bg-green-100 text-green-800',
};

export default function RemindersWidget() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await listReminders({ status: 'pending' });
        setReminders(data || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="bg-white rounded shadow p-3 mb-8">
      <h2 className="text-xl font-bold mb-4 text-left">Upcoming Reminders</h2>
      {loading && <div className="text-xs text-gray-500">Loading...</div>}
      <ul className="space-y-2">
        {reminders.map((r, i) => (
          <li
            key={i}
            className="flex items-center gap-3 p-1 rounded hover:bg-green-50 transition min-h-[48px] overflow-hidden"
          >
            <span className={`px-2 py-1 rounded text-xs font-semibold ${typeColors[r.entityType === 'enquiry' ? 'Candidate' : 'Case']} whitespace-nowrap`}>
              {r.entityType === 'enquiry' ? 'Candidate' : 'Case'}
            </span>
            <span className="font-semibold text-xs text-gray-800 flex-1 w-0 truncate text-left">{r.title}</span>
            <span className="text-gray-500 text-xs flex-1 w-0 truncate text-left">{r.description || ''}</span>
            <span className="ml-auto bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 whitespace-nowrap">
              <span>⏰</span> {new Date(r.dueAt).toLocaleString()}
            </span>
            <button
              className="ml-2 text-xs bg-green-600 text-white px-2 py-1 rounded"
              onClick={async ()=>{
                await completeReminder(r._id);
                setReminders(list => list.filter(x => x._id !== r._id));
              }}
            >Done</button>
          </li>
        ))}
      </ul>
    </div>
  );
} 