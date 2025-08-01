import React, { useState, useEffect } from 'react';
import { getFormFSessions, saveFormFSessions } from '../services/applications';

const initialSessions = Array.from({ length: 8 }, (_, i) => ({
  session_number: i + 1,
  session: `Session ${i + 1}`,
  notes: '',
  date: '',
  completed: false,
}));

export default function FormFAssessmentTracker({ enquiryId }) {
  const [sessions, setSessions] = useState(initialSessions);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!enquiryId) return;
    setLoading(true);
    getFormFSessions(enquiryId)
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          // Merge with initialSessions to ensure all 8 sessions
          const merged = initialSessions.map((s, i) => {
            const found = data.find(d => d.session_number === s.session_number);
            return found ? { ...s, ...found } : s;
          });
          setSessions(merged);
        } else {
          setSessions(initialSessions);
        }
        setLoading(false);
      })
      .catch(() => {
        setSessions(initialSessions);
        setLoading(false);
      });
  }, [enquiryId]);

  function handleSessionChange(idx, field, val) {
    const updated = sessions.map((s, i) =>
      i === idx ? { ...s, [field]: field === 'completed' ? !s.completed : val } : s
    );
    setSessions(updated);
    setSuccess(false);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await saveFormFSessions(enquiryId, sessions);
      setSuccess(true);
    } catch (e) {
      setError('Failed to save sessions');
    }
    setSaving(false);
  }

  if (loading) return <div>Loading Form F sessions...</div>;

  return (
    <div className="bg-gray-50 p-4 rounded mb-8">
      <h2 className="text-xl font-bold mb-2">Form F Assessment Tracker</h2>
  
      {/* Table for sm and up */}
      <div className="hidden sm:block">
        <table className="min-w-full bg-white border mb-2">
          <thead>
            <tr>
              <th className="border px-2 py-1">Session</th>
              <th className="border px-2 py-1">Notes</th>
              <th className="border px-2 py-1">Date</th>
              <th className="border px-2 py-1">Completed</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s, idx) => (
              <tr key={s.session}>
                <td className="border px-2 py-1 font-semibold">{s.session}</td>
                <td className="border px-2 py-1">
                  <input
                    type="text"
                    className="w-full border rounded px-2 py-1"
                    value={s.notes}
                    onChange={e => handleSessionChange(idx, 'notes', e.target.value)}
                  />
                </td>
                <td className="border px-2 py-1">
                  <input
                    type="date"
                    className="w-full border rounded px-2 py-1"
                    value={s.date ? s.date.slice(0, 10) : ''}
                    onChange={e => handleSessionChange(idx, 'date', e.target.value)}
                  />
                </td>
                <td className="border px-2 py-1 text-center">
                  <input
                    type="checkbox"
                    checked={!!s.completed}
                    onChange={() => handleSessionChange(idx, 'completed')}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
  
      {/* Card view for mobile */}
      <div className="sm:hidden flex flex-col gap-4">
        {sessions.map((s, idx) => (
          <div key={s.session} className="bg-white rounded shadow p-3 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold">{s.session}</span>
              <label className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={!!s.completed}
                  onChange={() => handleSessionChange(idx, 'completed')}
                  className="accent-blue-600"
                />
                <span className="text-xs">Completed</span>
              </label>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Notes</label>
              <input
                type="text"
                className="w-full border rounded px-2 py-1"
                value={s.notes}
                onChange={e => handleSessionChange(idx, 'notes', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Date</label>
              <input
                type="date"
                className="w-full border rounded px-2 py-1"
                value={s.date ? s.date.slice(0, 10) : ''}
                onChange={e => handleSessionChange(idx, 'date', e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>
  
      <button
        className="bg-black text-white px-4 py-2 rounded mt-4 w-full sm:w-auto"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? 'Saving...' : 'Save Sessions'}
      </button>
      {success && <span className="ml-4 text-green-600">Saved!</span>}
      {error && <span className="ml-4 text-red-600">{error}</span>}
    </div>
  );
} 