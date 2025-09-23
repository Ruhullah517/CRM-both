import React, { useState, useEffect } from 'react';
import {
  ShieldCheckIcon,
  EyeIcon,
  DocumentArrowDownIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import {
  getContactConsent,
  recordConsent,
  getDataRetentionPolicies,
  setDataRetentionPolicy,
  getAuditLogs,
  exportUserData,
  anonymizeUserData,
  getComplianceReport,
  processDataRetention
} from '../services/gdpr';
import { getAllContacts } from '../services/contacts';

const GDPRManagement = () => {
  const [activeTab, setActiveTab] = useState('audit');
  const [auditLogs, setAuditLogs] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [retentionPolicies, setRetentionPolicies] = useState([]);
  const [complianceReport, setComplianceReport] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showAnonymizeModal, setShowAnonymizeModal] = useState(false);
  const [auditFilters, setAuditFilters] = useState({
    page: 1,
    limit: 50,
    action: '',
    entityType: '',
    riskLevel: '',
    search: ''
  });

  const [consentForm, setConsentForm] = useState({
    consentType: 'marketing',
    consentGiven: true,
    consentMethod: 'email',
    consentText: '',
    consentVersion: '1.0'
  });

  const [anonymizeForm, setAnonymizeForm] = useState({
    reason: ''
  });

  useEffect(() => {
    loadData();
  }, [activeTab, auditFilters]);

  const loadData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'audit':
          const logsData = await getAuditLogs(auditFilters);
          setAuditLogs(logsData);
          break;
        case 'consent':
          const contactsData = await getAllContacts();
          setContacts(contactsData);
          break;
        case 'retention':
          const policiesData = await getDataRetentionPolicies();
          setRetentionPolicies(policiesData);
          break;
        case 'compliance':
          const reportData = await getComplianceReport();
          setComplianceReport(reportData);
          break;
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConsentSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await recordConsent({
        contactId: selectedContact._id,
        contactEmail: selectedContact.email,
        ...consentForm
      });
      setShowConsentModal(false);
      setSelectedContact(null);
      setConsentForm({
        consentType: 'marketing',
        consentGiven: true,
        consentMethod: 'email',
        consentText: '',
        consentVersion: '1.0'
      });
      loadData();
    } catch (error) {
      console.error('Error recording consent:', error);
      alert('Error recording consent: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async (contact) => {
    try {
      const data = await exportUserData(contact._id);
      
      // Create and download JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gdpr-export-${contact.name}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setShowExportModal(false);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Error exporting data: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleAnonymizeData = async (e) => {
    e.preventDefault();
    if (!window.confirm('Are you sure you want to anonymize this contact\'s data? This action cannot be undone.')) {
      return;
    }
    
    setLoading(true);
    try {
      await anonymizeUserData(selectedContact._id, anonymizeForm.reason);
      setShowAnonymizeModal(false);
      setSelectedContact(null);
      setAnonymizeForm({ reason: '' });
      loadData();
      alert('Data anonymized successfully');
    } catch (error) {
      console.error('Error anonymizing data:', error);
      alert('Error anonymizing data: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevelColor = (level) => {
    switch (level) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'create': return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'update': return <DocumentTextIcon className="h-4 w-4 text-blue-500" />;
      case 'delete': return <TrashIcon className="h-4 w-4 text-red-500" />;
      case 'login': return <UserGroupIcon className="h-4 w-4 text-green-500" />;
      case 'logout': return <UserGroupIcon className="h-4 w-4 text-gray-500" />;
      default: return <DocumentTextIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const tabs = [
    { id: 'audit', name: 'Audit Logs', icon: EyeIcon },
    { id: 'consent', name: 'Consent Management', icon: ShieldCheckIcon },
    { id: 'retention', name: 'Data Retention', icon: ClockIcon },
    { id: 'compliance', name: 'Compliance Report', icon: ChartBarIcon }
  ];

  if (loading && !auditLogs.length && !contacts.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">GDPR Management</h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage data privacy, consent, and compliance
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Audit Logs Tab */}
      {activeTab === 'audit' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Audit Logs</h3>
              <div className="flex space-x-4">
                <select
                  value={auditFilters.action}
                  onChange={(e) => setAuditFilters({ ...auditFilters, action: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Actions</option>
                  <option value="create">Create</option>
                  <option value="update">Update</option>
                  <option value="delete">Delete</option>
                  <option value="login">Login</option>
                  <option value="logout">Logout</option>
                </select>
                <select
                  value={auditFilters.riskLevel}
                  onChange={(e) => setAuditFilters({ ...auditFilters, riskLevel: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Risk Levels</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={auditFilters.search}
                  onChange={(e) => setAuditFilters({ ...auditFilters, search: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Risk Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {auditLogs.logs?.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getActionIcon(log.action)}
                        <span className="ml-2 text-sm font-medium text-gray-900 capitalize">
                          {log.action}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{log.userEmail}</div>
                      <div className="text-sm text-gray-500">{log.userId?.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 capitalize">{log.entityType}</div>
                      {log.entityName && (
                        <div className="text-sm text-gray-500">{log.entityName}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskLevelColor(log.riskLevel)}`}>
                        {log.riskLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Consent Management Tab */}
      {activeTab === 'consent' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Consent Management</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contacts.map((contact) => (
                  <tr key={contact._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{contact.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{contact.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedContact(contact);
                            setShowConsentModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Manage Consent
                        </button>
                        <button
                          onClick={() => {
                            setSelectedContact(contact);
                            setShowExportModal(true);
                          }}
                          className="text-green-600 hover:text-green-900"
                        >
                          Export Data
                        </button>
                        <button
                          onClick={() => {
                            setSelectedContact(contact);
                            setShowAnonymizeModal(true);
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          Anonymize
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Compliance Report Tab */}
      {activeTab === 'compliance' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Compliance Report</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entity Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Retention Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Records
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expired Records
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Compliance Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {complianceReport.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                      {item.entityType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.retentionPeriod} days
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.totalRecords}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.expiredRecords}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.complianceRate}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        item.needsAction 
                          ? 'text-red-600 bg-red-100' 
                          : 'text-green-600 bg-green-100'
                      }`}>
                        {item.needsAction ? 'Action Required' : 'Compliant'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Consent Modal */}
      {showConsentModal && selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Manage Consent - {selectedContact.name}
              </h3>
              <button
                onClick={() => {
                  setShowConsentModal(false);
                  setSelectedContact(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleConsentSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Consent Type</label>
                <select
                  value={consentForm.consentType}
                  onChange={(e) => setConsentForm({ ...consentForm, consentType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="marketing">Marketing</option>
                  <option value="training_updates">Training Updates</option>
                  <option value="newsletters">Newsletters</option>
                  <option value="case_updates">Case Updates</option>
                  <option value="invoice_notifications">Invoice Notifications</option>
                  <option value="reminder_emails">Reminder Emails</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="consentGiven"
                  checked={consentForm.consentGiven}
                  onChange={(e) => setConsentForm({ ...consentForm, consentGiven: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="consentGiven" className="ml-2 block text-sm text-gray-900">
                  Consent Given
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Consent Method</label>
                <select
                  value={consentForm.consentMethod}
                  onChange={(e) => setConsentForm({ ...consentForm, consentMethod: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="email">Email</option>
                  <option value="website">Website</option>
                  <option value="phone">Phone</option>
                  <option value="in_person">In Person</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Consent Text</label>
                <textarea
                  value={consentForm.consentText}
                  onChange={(e) => setConsentForm({ ...consentForm, consentText: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter the consent text that was shown to the user..."
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowConsentModal(false);
                    setSelectedContact(null);
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Consent'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Anonymize Modal */}
      {showAnonymizeModal && selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Anonymize Data - {selectedContact.name}
              </h3>
              <button
                onClick={() => {
                  setShowAnonymizeModal(false);
                  setSelectedContact(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Warning</h3>
                  <div className="mt-2 text-sm text-red-700">
                    This action will permanently anonymize all data for this contact. This cannot be undone.
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleAnonymizeData} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Reason for Anonymization</label>
                <textarea
                  value={anonymizeForm.reason}
                  onChange={(e) => setAnonymizeForm({ ...anonymizeForm, reason: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter the reason for anonymizing this contact's data..."
                  required
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAnonymizeModal(false);
                    setSelectedContact(null);
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? 'Anonymizing...' : 'Anonymize Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GDPRManagement;
