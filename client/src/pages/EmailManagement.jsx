import React, { useState, useEffect } from 'react';
import { 
  EnvelopeIcon, 
  DocumentTextIcon, 
  UserGroupIcon, 
  TagIcon,
  ChartBarIcon,
  EyeIcon,
  PaperAirplaneIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { sendBulkEmail, sendIndividualEmail, sendEmailToContactsByTags, getEmailHistory, getEmailStats, previewEmail } from '../services/emails';
import { getAllContacts, getContactsByTags, getContactStats } from '../services/contacts';
import { getAllEmailTemplates } from '../services/emailTemplates';

const EmailManagement = () => {
  const [activeTab, setActiveTab] = useState('send');
  const [templates, setTemplates] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [contactStats, setContactStats] = useState(null);
  const [emailStats, setEmailStats] = useState(null);
  const [emailHistory, setEmailHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  // Send email states
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [emailType, setEmailType] = useState('individual');
  const [recipients, setRecipients] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [subjectOverride, setSubjectOverride] = useState('');
  const [bodyOverride, setBodyOverride] = useState('');
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [templatesData, contactsData, statsData, emailStatsData, historyData] = await Promise.all([
        getAllEmailTemplates(),
        getAllContacts(),
        getContactStats(),
        getEmailStats(),
        getEmailHistory(1, 20)
      ]);
      
      setTemplates(templatesData);
      setContacts(contactsData);
      setContactStats(statsData);
      setEmailStats(emailStatsData);
      setEmailHistory(historyData.emails || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!selectedTemplate) {
      alert('Please select a template');
      return;
    }

    setLoading(true);
    try {
      let result;
      
      if (emailType === 'individual') {
        if (recipients.length === 0) {
          alert('Please add at least one recipient');
          return;
        }
        result = await sendBulkEmail(selectedTemplate, recipients, subjectOverride || null, bodyOverride || null);
      } else if (emailType === 'tags') {
        if (selectedTags.length === 0) {
          alert('Please select at least one tag');
          return;
        }
        result = await sendEmailToContactsByTags(selectedTemplate, selectedTags, subjectOverride || null, bodyOverride || null);
      }
      
      alert(`Email sent successfully! ${result.results?.length || 0} emails processed.`);
      loadData(); // Refresh data
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Error sending email: ' + error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewEmail = async () => {
    if (!selectedTemplate) {
      alert('Please select a template');
      return;
    }

    try {
      const preview = await previewEmail(selectedTemplate, {
        name: 'John Doe',
        email: 'john@example.com',
        organization: 'Example Organization'
      });
      setPreviewData(preview);
      setPreviewMode(true);
    } catch (error) {
      console.error('Error previewing email:', error);
      alert('Error previewing email: ' + error.response?.data?.message || error.message);
    }
  };

  const addRecipient = () => {
    const email = prompt('Enter email address:');
    const name = prompt('Enter name (optional):');
    if (email) {
      setRecipients([...recipients, { email, name: name || email }]);
    }
  };

  const removeRecipient = (index) => {
    setRecipients(recipients.filter((_, i) => i !== index));
  };

  const toggleTag = (tag) => {
    setSelectedTags(selectedTags.includes(tag) 
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag]
    );
  };

  const getUniqueTags = () => {
    const allTags = contacts.flatMap(contact => contact.tags || []);
    return [...new Set(allTags)];
  };

  const tabs = [
    { id: 'send', name: 'Send Emails', icon: PaperAirplaneIcon },
    { id: 'history', name: 'Email History', icon: ClockIcon },
    { id: 'stats', name: 'Statistics', icon: ChartBarIcon },
  ];

  if (loading && !emailStats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Email Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Send bulk emails, manage templates, and track email performance
          </p>
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
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Send Emails Tab */}
          {activeTab === 'send' && (
            <div className="space-y-6">
              {/* Template Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Template
                </label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a template</option>
                  {templates.map((template) => (
                    <option key={template._id} value={template._id}>
                      {template.name} ({template.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Email Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Type
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="individual"
                      checked={emailType === 'individual'}
                      onChange={(e) => setEmailType(e.target.value)}
                      className="mr-2"
                    />
                    Individual Recipients
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="tags"
                      checked={emailType === 'tags'}
                      onChange={(e) => setEmailType(e.target.value)}
                      className="mr-2"
                    />
                    By Tags
                  </label>
                </div>
              </div>

              {/* Recipients or Tags */}
              {emailType === 'individual' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recipients
                  </label>
                  <div className="space-y-2">
                    {recipients.map((recipient, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span>{recipient.name} ({recipient.email})</span>
                        <button
                          onClick={() => removeRecipient(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={addRecipient}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      + Add Recipient
                    </button>
                  </div>
                </div>
              )}

              {emailType === 'tags' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {getUniqueTags().map((tag) => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1 rounded-full text-sm ${
                          selectedTags.includes(tag)
                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                            : 'bg-gray-100 text-gray-800 border border-gray-300'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                  {selectedTags.length > 0 && (
                    <p className="mt-2 text-sm text-gray-600">
                      Selected: {selectedTags.join(', ')}
                    </p>
                  )}
                </div>
              )}

              {/* Subject Override */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject Override (optional)
                </label>
                <input
                  type="text"
                  value={subjectOverride}
                  onChange={(e) => setSubjectOverride(e.target.value)}
                  placeholder="Override template subject"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Body Override */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Body Override (optional)
                </label>
                <textarea
                  value={bodyOverride}
                  onChange={(e) => setBodyOverride(e.target.value)}
                  placeholder="Override template body"
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Actions */}
              <div className="flex space-x-4">
                <button
                  onClick={handlePreviewEmail}
                  className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  <EyeIcon className="h-5 w-5 mr-2" />
                  Preview
                </button>
                <button
                  onClick={handleSendEmail}
                  disabled={loading}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  <PaperAirplaneIcon className="h-5 w-5 mr-2" />
                  {loading ? 'Sending...' : 'Send Email'}
                </button>
              </div>
            </div>
          )}

          {/* Email History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Recent Email History</h3>
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
                        Template
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sent At
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {emailHistory.map((email) => (
                      <tr key={email._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {email.recipient}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {email.subject}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {email.template?.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            email.status === 'sent' 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {email.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {email.sentAt ? new Date(email.sentAt).toLocaleDateString() : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Statistics Tab */}
          {activeTab === 'stats' && emailStats && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Email Statistics</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{emailStats.totalEmails}</div>
                  <div className="text-sm text-blue-800">Total Emails</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{emailStats.sentEmails}</div>
                  <div className="text-sm text-green-800">Sent Successfully</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{emailStats.failedEmails}</div>
                  <div className="text-sm text-red-800">Failed</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{emailStats.successRate}%</div>
                  <div className="text-sm text-purple-800">Success Rate</div>
                </div>
              </div>

              {contactStats && (
                <div className="mt-8">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Contact Statistics</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-gray-600">{contactStats.totalContacts}</div>
                      <div className="text-sm text-gray-800">Total Contacts</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{contactStats.activeContacts}</div>
                      <div className="text-sm text-green-800">Active Contacts</div>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">{contactStats.contactsNeedingFollowUp}</div>
                      <div className="text-sm text-yellow-800">Need Follow-up</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Email Preview Modal */}
      {previewMode && previewData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Email Preview</h3>
              <button
                onClick={() => setPreviewMode(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Subject:</label>
                <div className="mt-1 p-3 bg-gray-50 rounded border">
                  {previewData.subject}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Body:</label>
                <div 
                  className="mt-1 p-3 bg-gray-50 rounded border"
                  dangerouslySetInnerHTML={{ __html: previewData.body }}
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setPreviewMode(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailManagement;
