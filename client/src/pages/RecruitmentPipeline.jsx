import React, { useEffect, useState } from 'react';
import { getEnquiries } from '../services/enquiries';
import {
  getStageEntries, 
  updateEnquiryStage, 
  addStageEntry, 
  uploadStageEntryFile,
  assignMentorAssessor,
  updateEnquiryStatus,
  setStageDeadline,
  completeStageDeadline
} from '../services/recruitment';
import { exportEnquiries } from '../services/exports';
import {
  UserCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const stages = ['Enquiry', 'Application', 'Assessment', 'Mentoring', 'Approval'];
const stageColors = {
  Enquiry: 'bg-gray-50',
  Application: 'bg-yellow-50',
  Assessment: 'bg-blue-50',
  Mentoring: 'bg-purple-50',
  Approval: 'bg-green-50',
};

const initialCandidates = [];

export default function RecruitmentPipeline() {
  const [candidates, setCandidates] = useState(initialCandidates);
  const [showDetail, setShowDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeline, setTimeline] = useState([]);
  const [entryLoading, setEntryLoading] = useState(false);
  const [entryForm, setEntryForm] = useState({ meetingType: 'Telephone', meetingDate: '', notes: '' });
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [entryReminder, setEntryReminder] = useState({ enabled: false, dueAt: '' });
  const [assignForm, setAssignForm] = useState({ mentorId: '', assessorId: '', mentorNotes: '', assessorNotes: '' });
  const [statusForm, setStatusForm] = useState({ status: 'Active', reason: '', pausedUntil: '' });
  const [deadlineForm, setDeadlineForm] = useState({ dueAt: '', createReminder: false });
  const [miniSaving, setMiniSaving] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await getEnquiries();
        const mapped = (data || []).map(e => ({
          id: e._id || e.id,
          name: e.full_name || e.name || 'Unknown',
          stage: e.pipelineStage || 'Enquiry',
          mentor: e.assignedMentorName || '',
        }));
        setCandidates(mapped);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function moveCandidate(id, direction) {
    const current = candidates.find(c => c.id === id);
    if (!current) return;
    const currentIdx = stages.indexOf(current.stage);
    let newIdx = currentIdx + direction;
    if (newIdx < 0) newIdx = 0;
    if (newIdx >= stages.length) newIdx = stages.length - 1;
    const nextStage = stages[newIdx];
    await updateEnquiryStage(id, nextStage);
    setCandidates(cands => cands.map(c => (c.id === id ? { ...c, stage: nextStage } : c)));
  }

  async function openDetail(candidate) {
    setShowDetail(candidate);
    try {
      const data = await getStageEntries(candidate.id);
      setTimeline(data?.entries || []);
    } catch {
      setTimeline([]);
    }
  }
  function closeDetail() {
    setShowDetail(null);
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-center sm:text-left">Recruitment Pipeline</h1>
        <button
          onClick={()=>exportEnquiries()}
          className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200"
        >
          Export CSV
        </button>
      </div>

      {/* Responsive horizontal scroll for mobile */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map(stage => (
          <div
            key={stage}
            className={`flex-1 min-w-[150px] flex flex-col max-h-[80vh] overflow-y-auto border border-gray-200 rounded-lg shadow bg-white ${stageColors[stage]}`}
          >
            <h2 className="text-base font-bold mb-3 text-center py-2 border-b border-gray-100 uppercase tracking-wide text-green-800">
              {stage}
            </h2>
            <div className="flex flex-col gap-3 px-2 pb-3">
              {candidates.filter(c => c.stage === stage).map(c => {
                const currentIdx = stages.indexOf(c.stage);
                return (
                  <div
                    key={c.id}
                    className="bg-white rounded shadow p-2 flex flex-col items-center border-t-4 border-[#2EAB2C] min-h-[90px] cursor-pointer hover:bg-green-50 transition"
                    onClick={() => openDetail(c)}
                  >
                    <span className="inline-block w-8 h-8 rounded-full bg-green-200 flex items-center justify-center text-[#2EAB2C] font-bold mb-1 text-base">
                      {c.name[0]}
                    </span>
                    <div className="font-semibold mb-0.5 text-sm text-center">{c.name}</div>
                    {c.mentor && (
                      <div className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                        <UserCircleIcon className="w-4 h-4 text-blue-700 bg-blue-100 rounded-full p-0.5" />
                        {c.mentor}
                      </div>
                    )}
                    <div className="flex gap-1 mt-1 flex-col sm:flex-row items-center">
                      <button
                        aria-label="Move Left"
                        className="px-2 py-1 bg-gray-100 rounded text-xs font-semibold hover:bg-gray-200 disabled:opacity-50"
                        onClick={e => {
                          e.stopPropagation();
                          moveCandidate(c.id, -1);
                        }}
                        disabled={currentIdx === 0}
                      >
                        <ArrowLeftIcon className="w-4 h-4" />
                      </button>
                      <button
                        aria-label="Move Right"
                        className="px-2 py-1 bg-[#2EAB2C] text-white rounded text-xs font-semibold hover:bg-green-700 disabled:opacity-50"
                        onClick={e => {
                          e.stopPropagation();
                          moveCandidate(c.id, 1);
                        }}
                        disabled={currentIdx === stages.length - 1}
                      >
                        <ArrowRightIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-gray-500 text-sm text-center">
        Use the arrows to move candidates between stages.
      </div>

      {/* Modal */}
      {showDetail && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded shadow-lg p-6 w-[90%] max-w-sm max-h-[90vh] overflow-y-auto relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center"
              onClick={closeDetail}
              aria-label="Close"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
            <div className="flex flex-col items-center mb-4">
              <span className="inline-block w-14 h-14 rounded-full bg-green-200 flex items-center justify-center text-green-800 font-bold text-2xl mb-2">
                {showDetail.name[0]}
              </span>
              <h2 className="text-lg font-bold mb-1">{showDetail.name}</h2>
              <div className="text-xs text-gray-500 mb-2">ID: {showDetail.id}</div>
            </div>
            <div className="mb-2">
              <span className="font-semibold">Stage:</span>{' '}
              <span className="ml-1 px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800">
                {showDetail.stage}
              </span>
            </div>
            <div className="mb-3">
              <span className="font-semibold">Mentor:</span>{' '}
              <span className="ml-1">{showDetail.mentor || <span className="text-gray-400">None</span>}</span>
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-1 gap-3 mb-4">
              {/* Assign mentor/assessor */}
              <div className="border rounded p-3">
                <div className="font-semibold text-sm mb-2">Assign mentor/assessor</div>
                <div className="grid grid-cols-1 gap-2">
                  <input className="border rounded px-2 py-1 text-sm" placeholder="Mentor ID" value={assignForm.mentorId} onChange={(e)=>setAssignForm(f=>({...f, mentorId: e.target.value}))} />
                  <input className="border rounded px-2 py-1 text-sm" placeholder="Assessor ID" value={assignForm.assessorId} onChange={(e)=>setAssignForm(f=>({...f, assessorId: e.target.value}))} />
                  <input className="border rounded px-2 py-1 text-sm" placeholder="Mentor notes (optional)" value={assignForm.mentorNotes} onChange={(e)=>setAssignForm(f=>({...f, mentorNotes: e.target.value}))} />
                  <input className="border rounded px-2 py-1 text-sm" placeholder="Assessor notes (optional)" value={assignForm.assessorNotes} onChange={(e)=>setAssignForm(f=>({...f, assessorNotes: e.target.value}))} />
                  <div className="flex justify-end">
                    <button
                      className="px-3 py-1.5 bg-gray-100 rounded text-sm hover:bg-gray-200"
                      disabled={miniSaving}
                      onClick={async ()=>{
                        if (!showDetail) return;
                        setMiniSaving(true);
                        try {
                          await assignMentorAssessor(showDetail.id, assignForm);
                          alert('Assignment saved');
                        } finally { setMiniSaving(false); }
                      }}
                    >
                      {miniSaving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Update lifecycle status */}
              <div className="border rounded p-3">
                <div className="font-semibold text-sm mb-2">Update status</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <select className="border rounded px-2 py-1 text-sm" value={statusForm.status} onChange={(e)=>setStatusForm(f=>({...f, status: e.target.value}))}>
                    <option>New</option>
                    <option>Active</option>
                    <option>Paused</option>
                    <option>Completed</option>
                    <option>Withdrawn</option>
                  </select>
                  <input className="border rounded px-2 py-1 text-sm" placeholder="Reason (optional)" value={statusForm.reason} onChange={(e)=>setStatusForm(f=>({...f, reason: e.target.value}))} />
                  <input type="date" className="border rounded px-2 py-1 text-sm" disabled={statusForm.status !== 'Paused'} value={statusForm.pausedUntil} onChange={(e)=>setStatusForm(f=>({...f, pausedUntil: e.target.value}))} />
                </div>
                <div className="flex justify-end mt-2">
                  <button
                    className="px-3 py-1.5 bg-gray-100 rounded text-sm hover:bg-gray-200"
                    disabled={miniSaving}
                    onClick={async ()=>{
                      if (!showDetail) return;
                      setMiniSaving(true);
                      try {
                        await updateEnquiryStatus(showDetail.id, {
                          status: statusForm.status,
                          reason: statusForm.reason || undefined,
                          pausedUntil: statusForm.pausedUntil || undefined,
                        });
                        alert('Status updated');
                      } finally { setMiniSaving(false); }
                    }}
                  >
                    {miniSaving ? 'Saving...' : 'Update'}
                  </button>
                </div>
              </div>

              {/* Set stage deadline */}
              <div className="border rounded p-3">
                <div className="font-semibold text-sm mb-2">Set deadline for this stage</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <input type="datetime-local" className="border rounded px-2 py-1 text-sm" value={deadlineForm.dueAt} onChange={(e)=>setDeadlineForm(f=>({...f, dueAt: e.target.value}))} />
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={deadlineForm.createReminder} onChange={(e)=>setDeadlineForm(f=>({...f, createReminder: e.target.checked}))} /> Create reminder</label>
                </div>
                <div className="flex justify-end mt-2">
                  <button
                    className="px-3 py-1.5 bg-gray-100 rounded text-sm hover:bg-gray-200"
                    disabled={miniSaving}
                    onClick={async ()=>{
                      if (!showDetail || !deadlineForm.dueAt) return alert('Select a due date');
                      setMiniSaving(true);
                      try {
                        await setStageDeadline(showDetail.id, {
                          stage: showDetail.stage,
                          dueAt: new Date(deadlineForm.dueAt),
                          reminder: deadlineForm.createReminder ? { assignedTo: undefined } : undefined,
                        });
                        alert('Deadline set');
                      } finally { setMiniSaving(false); }
                    }}
                  >
                    {miniSaving ? 'Saving...' : 'Set deadline'}
                  </button>
                </div>
              </div>
            </div>

            <div className="mb-3">
              <div className="font-semibold mb-1">Timeline</div>
              <div className="space-y-2">
                {timeline.length === 0 && (
                  <div className="text-xs text-gray-400">No entries yet</div>
                )}
                {timeline.map((t, idx) => (
                  <div key={idx} className="border rounded p-2">
                    <div className="text-xs text-gray-600">{t.stage} • {t.meetingType || 'N/A'}</div>
                    {t.meetingDate && (
                      <div className="text-xs text-gray-500">{new Date(t.meetingDate).toLocaleString()}</div>
                    )}
                    {t.notes && <div className="text-sm mt-1">{t.notes}</div>}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t">
              <div className="font-semibold mb-2">Add stage entry</div>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!showDetail) return;
                  setEntryLoading(true);
                  try {
                    await addStageEntry(showDetail.id, {
                      stage: showDetail.stage,
                      meetingType: entryForm.meetingType,
                      meetingDate: entryForm.meetingDate ? new Date(entryForm.meetingDate) : undefined,
                      notes: entryForm.notes,
                      files: uploadedFiles,
                      reminder: entryReminder.enabled && entryReminder.dueAt ? { dueAt: new Date(entryReminder.dueAt) } : undefined,
                    });
                    const data = await getStageEntries(showDetail.id);
                    setTimeline(data?.entries || []);
                    setEntryForm({ meetingType: 'Telephone', meetingDate: '', notes: '' });
                    setUploadedFiles([]);
                    setEntryReminder({ enabled: false, dueAt: '' });
                  } finally {
                    setEntryLoading(false);
                  }
                }}
                className="space-y-2"
              >
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Stage</label>
                  <input
                    className="w-full border rounded px-2 py-1 text-sm bg-gray-50"
                    value={showDetail.stage}
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Meeting type</label>
                  <select
                    className="w-full border rounded px-2 py-1 text-sm"
                    value={entryForm.meetingType}
                    onChange={(e)=>setEntryForm(f=>({...f, meetingType: e.target.value}))}
                  >
                    <option>Telephone</option>
                    <option>Online</option>
                    <option>Home Visit</option>
                    <option>Face to Face</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Meeting date</label>
                  <input
                    type="datetime-local"
                    className="w-full border rounded px-2 py-1 text-sm"
                    value={entryForm.meetingDate}
                    onChange={(e)=>setEntryForm(f=>({...f, meetingDate: e.target.value}))}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Notes</label>
                  <textarea
                    className="w-full border rounded px-2 py-1 text-sm"
                    rows={3}
                    value={entryForm.notes}
                    onChange={(e)=>setEntryForm(f=>({...f, notes: e.target.value}))}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={entryReminder.enabled} onChange={(e)=>setEntryReminder(r=>({...r, enabled: e.target.checked}))} /> Create reminder</label>
                  <div className="md:col-span-2">
                    <input type="datetime-local" disabled={!entryReminder.enabled} className="w-full border rounded px-2 py-1 text-sm" value={entryReminder.dueAt} onChange={(e)=>setEntryReminder(r=>({...r, dueAt: e.target.value}))} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Attachments</label>
                  <input
                    type="file"
                    onChange={async (e)=>{
                      const file = e.target.files && e.target.files[0];
                      if (!file || !showDetail) return;
                      setEntryLoading(true);
                      try {
                        const meta = await uploadStageEntryFile(showDetail.id, file);
                        setUploadedFiles(list=>[...list, meta]);
                      } finally {
                        setEntryLoading(false);
                      }
                    }}
                  />
                  {uploadedFiles.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {uploadedFiles.map((f, i)=>(
                        <div key={i} className="text-xs text-gray-600 truncate">{f.name || f.url}</div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-[#2EAB2C] text-white rounded text-sm disabled:opacity-50"
                    disabled={entryLoading}
                  >
                    {entryLoading ? 'Saving...' : 'Add entry'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
