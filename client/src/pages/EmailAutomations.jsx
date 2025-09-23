import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  PlayIcon,
  PauseIcon,
  EyeIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import {
  getAllAutomations,
  createAutomation,
  updateAutomation,
  deleteAutomation,
  toggleAutomation,
  getAutomationLogs,
  testAutomation
} from '../services/emailAutomations';
import { getEmailTemplates } from '../services/emailTemplates';
import { getAllContacts } from '../services/contacts';

const EmailAutomations = () => {
  const [automations, setAutomations] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState(null);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [selectedAutomation, setSelectedAutomation] = useState(null);
  const [logs, setLogs] = useState([]);
  const [testEmail, setTestEmail] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    triggerType: 'contact_created',
    triggerConditions: {
      field: '',
      operator: 'equals',
      value: '',
      additionalConditions: []
    },
    emailTemplate: '',
    recipientType: 'contact',
    recipientConfig: {
      contactField: 'email',
      userRole: 'admin',
      customEmails: [],
      tagFilters: [],
      typeFilters: []
    },
    delay: {
      type: 'immediate',
      value: 0
    },
    isActive: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [automationsData, templatesData, contactsData] = await Promise.all([
        getAllAutomations(),
        getEmailTemplates(),
        getAllContacts()
      ]);
      setAutomations(automationsData);
      setTemplates(templatesData);
      setContacts(contactsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingAutomation) {
        await updateAutomation(editingAutomation._id, formData);
      } else {
        await createAutomation(formData);
      }
      setShowModal(false);
      setEditingAutomation(null);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving automation:', error);
      alert('Error saving automation: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this automation?')) {
      try {
        await deleteAutomation(id);
        loadData();
      } catch (error) {
        console.error('Error deleting automation:', error);
        alert('Error deleting automation: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  const handleToggle = async (id) => {
    try {
      await toggleAutomation(id);
      loadData();
    } catch (error) {
      console.error('Error toggling automation:', error);
      alert('Error toggling automation: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleEdit = (automation) => {
    setEditingAutomation(automation);
    setFormData({
      name: automation.name || '',
      description: automation.description || '',
      triggerType: automation.triggerType || 'contact_created',
      triggerConditions: automation.triggerConditions || {
        field: '',
        operator: 'equals',
        value: '',
        additionalConditions: []
      },
      emailTemplate: automation.emailTemplate?._id || '',
      recipientType: automation.recipientType || 'contact',
      recipientConfig: automation.recipientConfig || {
        contactField: 'email',
        userRole: 'admin',
        customEmails: [],
        tagFilters: [],
        typeFilters: []
      },
      delay: automation.delay || {
        type: 'immediate',
        value: 0
      },
      isActive: automation.isActive !== false
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      triggerType: 'contact_created',
      triggerConditions: {
        field: '',
        operator: 'equals',
        value: '',
        additionalConditions: []
      },
      emailTemplate: '',
      recipientType: 'contact',
      recipientConfig: {
        contactField: 'email',
        userRole: 'admin',
        customEmails: [],
        tagFilters: [],
        typeFilters: []
      },
      delay: {
        type: 'immediate',
        value: 0
      },
      isActive: true
    });
  };

  const handleViewLogs = async (automation) => {
    setSelectedAutomation(automation);
    try {
      const logsData = await getAutomationLogs(automation._id);
      setLogs(logsData.logs);
      setShowLogsModal(true);
    } catch (error) {
      console.error('Error loading logs:', error);
      alert('Error loading logs: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleTest = async (automation) => {
    const email = prompt('Enter test email address:');
    if (email) {
      try {
        await testAutomation(automation._id, email);
        alert('Test email sent successfully!');
      } catch (error) {
        console.error('Error sending test email:', error);
        alert('Error sending test email: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  const getTriggerTypeLabel = (type) => {
    const labels = {
      contact_created: 'Contact Created',
      contact_updated: 'Contact Updated',
      enquiry_submitted: 'Enquiry Submitted',
      case_created: 'Case Created',
      case_updated: 'Case Updated',
      training_booking: 'Training Booking',
      invoice_sent: 'Invoice Sent',
      invoice_overdue: 'Invoice Overdue',
      reminder_due: 'Reminder Due',
      custom: 'Custom Trigger'
    };
    return labels[type] || type;
  };

  const getRecipientTypeLabel = (type) => {
    const labels = {
      contact: 'Contact',
      user: 'User',
      custom: 'Custom Emails',
      all_contacts: 'All Contacts',
      contacts_by_tag: 'Contacts by Tag',
      contacts_by_type: 'Contacts by Type'
    };
    return labels[type] || type;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'delivered':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'opened':
        return <EyeIcon className="h-4 w-4 text-blue-500" />;
      case 'clicked':
        return <CheckCircleIcon className="h-4 w-4 text-blue-500" />;
      case 'bounced':
        return <XCircleIcon className="h-4 w-4 text-red-500" />;
      case 'failed':
        return <XCircleIcon className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <ClockIcon className="h-4 w-4 text-yellow-500" />;
      default:
        return <ExclamationTriangleIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading && !automations.length) {
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
              <h1 className="text-2xl font-bold text-gray-900">Email Automations</h1>
              <p className="mt-1 text-sm text-gray-600">
                Create and manage automated email workflows
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Automation
            </button>
          </div>
        </div>
      </div>

      {/* Automations List */}
      <div className="bg-white shadow rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trigger
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recipients
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Template
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stats
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {automations.map((automation) => (
                <tr key={automation._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{automation.name}</div>
                      {automation.description && (
                        <div className="text-sm text-gray-500">{automation.description}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {getTriggerTypeLabel(automation.triggerType)}
                    </div>
                    {automation.delay.type !== 'immediate' && (
                      <div className="text-sm text-gray-500">
                        Delay: {automation.delay.value} {automation.delay.type}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getRecipientTypeLabel(automation.recipientType)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {automation.emailTemplate?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      automation.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {automation.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>Triggered: {automation.triggerCount} times</div>
                    {automation.lastTriggered && (
                      <div>Last: {new Date(automation.lastTriggered).toLocaleDateString()}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewLogs(automation)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Logs"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleTest(automation)}
                        className="text-green-600 hover:text-green-900"
                        title="Test Automation"
                      >
                        <PlayIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(automation)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Edit"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleToggle(automation._id)}
                        className={automation.isActive ? "text-yellow-600 hover:text-yellow-900" : "text-green-600 hover:text-green-900"}
                        title={automation.isActive ? "Pause" : "Activate"}
                      >
                        {automation.isActive ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => handleDelete(automation._id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Automation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingAutomation ? 'Edit Automation' : 'Create New Automation'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingAutomation(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Trigger Type *</label>
                  <select
                    value={formData.triggerType}
                    onChange={(e) => setFormData({ ...formData, triggerType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="contact_created">Contact Created</option>
                    <option value="contact_updated">Contact Updated</option>
                    <option value="enquiry_submitted">Enquiry Submitted</option>
                    <option value="case_created">Case Created</option>
                    <option value="case_updated">Case Updated</option>
                    <option value="training_booking">Training Booking</option>
                    <option value="invoice_sent">Invoice Sent</option>
                    <option value="invoice_overdue">Invoice Overdue</option>
                    <option value="reminder_due">Reminder Due</option>
                    <option value="custom">Custom Trigger</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email Template *</label>
                  <select
                    value={formData.emailTemplate}
                    onChange={(e) => setFormData({ ...formData, emailTemplate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Template</option>
                    {templates.map(template => (
                      <option key={template._id} value={template._id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Recipient Type *</label>
                  <select
                    value={formData.recipientType}
                    onChange={(e) => setFormData({ ...formData, recipientType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="contact">Contact</option>
                    <option value="user">User</option>
                    <option value="custom">Custom Emails</option>
                    <option value="all_contacts">All Contacts</option>
                    <option value="contacts_by_tag">Contacts by Tag</option>
                    <option value="contacts_by_type">Contacts by Type</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Delay Type</label>
                  <select
                    value={formData.delay.type}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      delay: { ...formData.delay, type: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="immediate">Immediate</option>
                    <option value="minutes">Minutes</option>
                    <option value="hours">Hours</option>
                    <option value="days">Days</option>
                    <option value="weeks">Weeks</option>
                  </select>
                </div>
                {formData.delay.type !== 'immediate' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Delay Value</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.delay.value}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        delay: { ...formData.delay, value: parseInt(e.target.value) || 0 }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                  Active
                </label>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingAutomation(null);
                    resetForm();
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
                  {loading ? 'Saving...' : editingAutomation ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Logs Modal */}
      {showLogsModal && selectedAutomation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Automation Logs - {selectedAutomation.name}
              </h3>
              <button
                onClick={() => {
                  setShowLogsModal(false);
                  setSelectedAutomation(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recipient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Scheduled
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sent
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logs.map((log) => (
                    <tr key={log._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{log.recipientName}</div>
                          <div className="text-sm text-gray-500">{log.recipientEmail}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.emailSubject}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(log.emailStatus)}
                          <span className="ml-2 text-sm text-gray-900 capitalize">
                            {log.emailStatus}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(log.scheduledFor).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.sentAt ? new Date(log.sentAt).toLocaleString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailAutomations;
