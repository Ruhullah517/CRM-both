import React, { useEffect, useState } from 'react';
import {
  getCasesStatus,
  getCaseTypeDistribution,
  getCaseloadByWorker
} from '../services/reports';
import { exportTrainingEvents, exportTrainingBookings, exportPaymentHistory } from '../services/exports';

export default function Reports() {
  const [status, setStatus] = useState({ opened: [], closed: [] });
  const [types, setTypes] = useState([]);
  const [caseload, setCaseload] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [s, t, c] = await Promise.all([
          getCasesStatus(),
          getCaseTypeDistribution(),
          getCaseloadByWorker()
        ]);
        setStatus(s);
        setTypes(t);
        setCaseload(c);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <div className="flex gap-2">
            <button onClick={exportTrainingEvents} className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded text-sm">Export Training Events</button>
            <button onClick={() => exportTrainingBookings()} className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded text-sm">Export Training Bookings</button>
            <button onClick={exportPaymentHistory} className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded text-sm">Export Payments</button>
          </div>
        </div>
      </div>

      {/* Cases Status */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-3">Cases Opened vs Closed (by day)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-medium mb-2">Opened</div>
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {status.opened.map((d) => (
                <div key={`o-${d.date}`} className="flex justify-between text-sm">
                  <span>{d.date}</span>
                  <span className="font-semibold">{d.count}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium mb-2">Closed</div>
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {status.closed.map((d) => (
                <div key={`c-${d.date}`} className="flex justify-between text-sm">
                  <span>{d.date}</span>
                  <span className="font-semibold">{d.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Case Type Distribution */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-3">Case Type Distribution</h2>
        <div className="space-y-1 max-h-60 overflow-y-auto">
          {types.map((t) => (
            <div key={t.caseType} className="flex justify-between text-sm">
              <span>{t.caseType}</span>
              <span className="font-semibold">{t.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Caseload by Worker */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-3">Caseload by Worker</h2>
        <div className="space-y-1 max-h-60 overflow-y-auto">
          {caseload.map((cw) => (
            <div key={`${cw.userId}-${cw.isLead}`} className="flex justify-between text-sm">
              <span>{cw.name} {cw.isLead ? '(Lead)' : ''}</span>
              <span className="font-semibold">{cw.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


