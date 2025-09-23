import React, { useState, useEffect } from 'react';
import { ExclamationTriangleIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { getExpiringCompliance } from '../services/freelancers';

const ComplianceAlertsWidget = () => {
  const [expiringDocs, setExpiringDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExpiringCompliance();
  }, []);

  const fetchExpiringCompliance = async () => {
    try {
      const data = await getExpiringCompliance(30); // Next 30 days
      setExpiringDocs(data);
    } catch (error) {
      console.error('Failed to fetch expiring compliance:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance Alerts</h3>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const urgentDocs = expiringDocs.filter(doc => doc.daysUntilExpiry <= 7);
  const warningDocs = expiringDocs.filter(doc => doc.daysUntilExpiry > 7 && doc.daysUntilExpiry <= 30);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Compliance Alerts</h3>
        <DocumentTextIcon className="h-6 w-6 text-gray-400" />
      </div>

      {expiringDocs.length === 0 ? (
        <p className="text-gray-500 text-sm">No compliance documents expiring in the next 30 days.</p>
      ) : (
        <div className="space-y-4">
          {/* Urgent alerts (7 days or less) */}
          {urgentDocs.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-red-600 mb-2 flex items-center">
                <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                Urgent ({urgentDocs.length})
              </h4>
              <div className="space-y-2">
                {urgentDocs.slice(0, 3).map((doc, index) => (
                  <div key={index} className="bg-red-50 border border-red-200 rounded p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-red-800">{doc.documentName}</p>
                        <p className="text-xs text-red-600">{doc.freelancerName}</p>
                        <p className="text-xs text-red-600">{doc.documentType}</p>
                      </div>
                      <span className="text-xs font-semibold text-red-800 bg-red-200 px-2 py-1 rounded">
                        {doc.daysUntilExpiry} days
                      </span>
                    </div>
                  </div>
                ))}
                {urgentDocs.length > 3 && (
                  <p className="text-xs text-red-600">+{urgentDocs.length - 3} more urgent</p>
                )}
              </div>
            </div>
          )}

          {/* Warning alerts (8-30 days) */}
          {warningDocs.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-yellow-600 mb-2">Warnings ({warningDocs.length})</h4>
              <div className="space-y-2">
                {warningDocs.slice(0, 2).map((doc, index) => (
                  <div key={index} className="bg-yellow-50 border border-yellow-200 rounded p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-yellow-800">{doc.documentName}</p>
                        <p className="text-xs text-yellow-600">{doc.freelancerName}</p>
                        <p className="text-xs text-yellow-600">{doc.documentType}</p>
                      </div>
                      <span className="text-xs font-semibold text-yellow-800 bg-yellow-200 px-2 py-1 rounded">
                        {doc.daysUntilExpiry} days
                      </span>
                    </div>
                  </div>
                ))}
                {warningDocs.length > 2 && (
                  <p className="text-xs text-yellow-600">+{warningDocs.length - 2} more warnings</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ComplianceAlertsWidget;
