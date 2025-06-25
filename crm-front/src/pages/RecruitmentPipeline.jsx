import React, { useState } from 'react';
import {
  UserCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const stages = ['Inquiry', 'Application', 'Assessment', 'Mentoring', 'Final Approval'];
const stageColors = {
  Inquiry: 'bg-gray-50',
  Application: 'bg-yellow-50',
  Assessment: 'bg-blue-50',
  Mentoring: 'bg-purple-50',
  'Final Approval': 'bg-green-50',
};

const initialCandidates = [
  { id: 1, name: 'Alice Johnson', stage: 'Assessment', mentor: 'John Doe' },
  { id: 2, name: 'Bob Smith', stage: 'Application', mentor: 'Jane Lee' },
  { id: 3, name: 'Carol Lee', stage: 'Inquiry', mentor: '' },
  { id: 4, name: 'David Brown', stage: 'Mentoring', mentor: 'Sarah Brown' },
  { id: 5, name: 'Eva Green', stage: 'Final Approval', mentor: 'John Doe' },
];

export default function RecruitmentPipeline() {
  const [candidates, setCandidates] = useState(initialCandidates);
  const [showDetail, setShowDetail] = useState(null);

  function moveCandidate(id, direction) {
    setCandidates(cands =>
      cands.map(c => {
        if (c.id !== id) return c;
        const currentIdx = stages.indexOf(c.stage);
        let newIdx = currentIdx + direction;
        if (newIdx < 0) newIdx = 0;
        if (newIdx >= stages.length) newIdx = stages.length - 1;
        return { ...c, stage: stages[newIdx] };
      })
    );
  }

  function openDetail(candidate) {
    setShowDetail(candidate);
  }
  function closeDetail() {
    setShowDetail(null);
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6 text-center sm:text-left">Recruitment Pipeline</h1>

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
            <div className="mb-2">
              <span className="font-semibold">Mentor:</span>{' '}
              <span className="ml-1">{showDetail.mentor || <span className="text-gray-400">None</span>}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
