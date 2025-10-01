import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  EnvelopeIcon,
  UserGroupIcon,
  TagIcon,
  ChartBarIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PaperAirplaneIcon,
  DocumentTextIcon,
  BoltIcon,
  PhoneIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { getAllContacts, createContact, updateContact, bulkUpdateContacts, getContactStats } from '../services/contacts';
import { getEmailTemplates, sendBulkEmail } from '../services/emailTemplates';
import { sendEmailToContactsByTags, getEmailHistory, getEmailStats } from '../services/emails';

const SalesCommunication = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [emailTemplates, setEmailTemplates] = useState([]);
  const [contactStats, setContactStats] = useState(null);
  const [emailStats, setEmailStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterSource, setFilterSource] = useState('all');
  
  // Email sending state
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  
  // Contact modal state
  const [showContactModal, setShowContactModal] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    contactType: 'prospect',
    leadSource: 'website',
    tags: [],
    interestAreas: [],
    notes: '',
    organizationName: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [contacts, searchTerm, filterTag, filterType, filterSource]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [contactsData, templatesData, statsData, emailStatsData] = await Promise.all([
        getAllContacts(),
        getEmailTemplates(),
        getContactStats(),
        getEmailStats()
      ]);
      
      setContacts(contactsData || []);
      setEmailTemplates(templatesData || []);
      setContactStats(statsData);
      setEmailStats(emailStatsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...contacts];
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(contact =>
        contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.organizationName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Tag filter
    if (filterTag !== 'all') {
      filtered = filtered.filter(contact =>
        contact.tags?.includes(filterTag)
      );
    }
    
    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(contact =>
        contact.contactType === filterType
      );
    }
    
    // Source filter
    if (filterSource !== 'all') {
      filtered = filtered.filter(contact =>
        contact.leadSource === filterSource
      );
    }
    
    setFilteredContacts(filtered);
  };

  const handleSelectContact = (contactId) => {
    setSelectedContacts(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleSelectAll = () => {
    if (selectedContacts.length === filteredContacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(filteredContacts.map(c => c._id));
    }
  };

  const handleBulkTag = async (tag) => {
    if (selectedContacts.length === 0) {
      alert('Please select contacts first');
      return;
    }
    
    setLoading(true);
    try {
      const updateData = {
        $addToSet: { tags: tag }
      };
      
      await bulkUpdateContacts({ contactIds: selectedContacts, updateData });
      await loadData();
      setSelectedContacts([]);
      alert(`Tagged ${selectedContacts.length} contacts with "${tag}"`);
    } catch (error) {
      console.error('Error tagging contacts:', error);
      alert('Error tagging contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleSendBulkEmail = async () => {
    if (selectedContacts.length === 0) {
      alert('Please select contacts first');
      return;
    }
    
    if (!selectedTemplate) {
      alert('Please select an email template');
      return;
    }
    
    setSendingEmail(true);
    try {
      const recipients = contacts
        .filter(c => selectedContacts.includes(c._id))
        .map(c => ({
          email: c.email,
          data: {
            name: c.name,
            organization: c.organizationName || ''
          }
        }));
      
      await sendBulkEmail(selectedTemplate, recipients, emailSubject || null, emailBody || null);
      
      alert(`Email sent to ${recipients.length} contacts!`);
      setShowEmailModal(false);
      setSelectedContacts([]);
      setSelectedTemplate('');
      setEmailSubject('');
      setEmailBody('');
    } catch (error) {
      console.error('Error sending emails:', error);
      alert('Error sending emails: ' + (error.response?.data?.message || error.message));
    } finally {
      setSendingEmail(false);
    }
  };

  const handleSendEmailByTags = async (tags) => {
    if (!selectedTemplate) {
      alert('Please select an email template');
      return;
    }
    
    setSendingEmail(true);
    try {
      await sendEmailToContactsByTags(selectedTemplate, tags, emailSubject || null, emailBody || null);
      
      alert(`Emails sent successfully to contacts with tags: ${tags.join(', ')}`);
      setShowEmailModal(false);
      setSelectedTemplate('');
      setEmailSubject('');
      setEmailBody('');
    } catch (error) {
      console.error('Error sending emails:', error);
      alert('Error sending emails: ' + (error.response?.data?.message || error.message));
    } finally {
      setSendingEmail(false);
    }
  };

  const handleAddContact = () => {
    setEditingContact(null);
    setContactForm({
      name: '',
      email: '',
      phone: '',
      contactType: 'prospect',
      leadSource: 'manual',
      tags: [],
      interestAreas: [],
      notes: '',
      organizationName: ''
    });
    setShowContactModal(true);
  };

  const handleEditContact = (contact) => {
    setEditingContact(contact);
    setContactForm({
      name: contact.name || '',
      email: contact.email || '',
      phone: contact.phone || '',
      contactType: contact.contactType || 'prospect',
      leadSource: contact.leadSource || 'manual',
      tags: contact.tags || [],
      interestAreas: contact.interestAreas || [],
      notes: contact.notes || '',
      organizationName: contact.organizationName || ''
    });
    setShowContactModal(true);
  };

  const handleSaveContact = async () => {
    setLoading(true);
    try {
      if (editingContact) {
        await updateContact(editingContact._id, contactForm);
      } else {
        await createContact(contactForm);
      }
      
      // Clear filters to show the newly created/edited contact
      setSearchTerm('');
      setFilterTag('all');
      setFilterType('all');
      setFilterSource('all');
      
      await loadData();
      setShowContactModal(false);
      alert(`Contact ${editingContact ? 'updated' : 'created'} successfully!`);
    } catch (error) {
      console.error('Error saving contact:', error);
      alert('Error saving contact: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const getLeadScoreColor = (score) => {
    if (score >= 70) return 'text-green-600 font-bold';
    if (score >= 40) return 'text-yellow-600 font-semibold';
    return 'text-gray-500';
  };

  // Get all unique tags from contacts
  const allTags = [...new Set(contacts.flatMap(c => c.tags || []))];
  const allSources = [...new Set(contacts.map(c => c.leadSource).filter(Boolean))];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Sales & Communication</h1>
        <p className="text-gray-600">
          Manage contacts, send emails, and track engagement
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Contacts</p>
              <p className="text-2xl font-bold text-gray-800">{contactStats?.totalContacts || 0}</p>
            </div>
            <UserGroupIcon className="h-12 w-12 text-[#2EAB2C]" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Active Leads</p>
              <p className="text-2xl font-bold text-gray-800">{contactStats?.activeContacts || 0}</p>
            </div>
            <ChartBarIcon className="h-12 w-12 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Emails Sent</p>
              <p className="text-2xl font-bold text-gray-800">{emailStats?.totalSent || 0}</p>
            </div>
            <EnvelopeIcon className="h-12 w-12 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Follow-ups Needed</p>
              <p className="text-2xl font-bold text-gray-800">{contactStats?.contactsNeedingFollowUp || 0}</p>
            </div>
            <BoltIcon className="h-12 w-12 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'overview'
                  ? 'border-b-2 border-[#2EAB2C] text-[#2EAB2C]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <UserGroupIcon className="h-5 w-5 inline mr-2" />
              Contacts
            </button>
            <button
              onClick={() => setActiveTab('email')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'email'
                  ? 'border-b-2 border-[#2EAB2C] text-[#2EAB2C]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <EnvelopeIcon className="h-5 w-5 inline mr-2" />
              Send Email
            </button>
          </nav>
        </div>
      </div>

      {/* Contacts Tab */}
      {activeTab === 'overview' && (
        <div className="bg-white rounded-lg shadow p-6">
          {/* Filters and Actions */}
          <div className="mb-6 space-y-4">
            {/* Search and Add */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search contacts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2EAB2C] focus:border-transparent"
                />
              </div>
              <button
                onClick={handleAddContact}
                className="px-4 py-2 bg-[#2EAB2C] text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <PlusIcon className="h-5 w-5" />
                Add Contact
              </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Tag</label>
                <select
                  value={filterTag}
                  onChange={(e) => setFilterTag(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2EAB2C]"
                >
                  <option value="all">All Tags</option>
                  {allTags.map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2EAB2C]"
                >
                  <option value="all">All Types</option>
                  <option value="prospect">Prospect</option>
                  <option value="customer">Customer</option>
                  <option value="partner">Partner</option>
                  <option value="freelancer">Freelancer</option>
                  <option value="trainer">Trainer</option>
                  <option value="mentor">Mentor</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Source</label>
                <select
                  value={filterSource}
                  onChange={(e) => setFilterSource(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2EAB2C]"
                >
                  <option value="all">All Sources</option>
                  {allSources.map(source => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedContacts.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 mb-3">
                  <strong>{selectedContacts.length}</strong> contact(s) selected
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleBulkTag('training_interest')}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                  >
                    Tag: Training
                  </button>
                  <button
                    onClick={() => handleBulkTag('mentoring_interest')}
                    className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm"
                  >
                    Tag: Mentoring
                  </button>
                  <button
                    onClick={() => handleBulkTag('hot_lead')}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                  >
                    Tag: Hot Lead
                  </button>
                  <button
                    onClick={() => setShowEmailModal(true)}
                    className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm flex items-center gap-1"
                  >
                    <PaperAirplaneIcon className="h-4 w-4" />
                    Send Email
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Contacts Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedContacts.length === filteredContacts.length && filteredContacts.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-[#2EAB2C] focus:ring-[#2EAB2C]"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email / Phone
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tags
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lead Score
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredContacts.map(contact => (
                  <tr key={contact._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedContacts.includes(contact._id)}
                        onChange={() => handleSelectContact(contact._id)}
                        className="rounded border-gray-300 text-[#2EAB2C] focus:ring-[#2EAB2C]"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{contact.name}</div>
                          {contact.organizationName && (
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <BuildingOfficeIcon className="h-3 w-3" />
                              {contact.organizationName}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900">{contact.email}</div>
                      {contact.phone && (
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <PhoneIcon className="h-3 w-3" />
                          {contact.phone}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {contact.contactType}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {contact.leadSource || 'N/A'}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(contact.tags || []).slice(0, 3).map(tag => (
                          <span
                            key={tag}
                            className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800"
                          >
                            {tag}
                          </span>
                        ))}
                        {(contact.tags || []).length > 3 && (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            +{(contact.tags || []).length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-sm ${getLeadScoreColor(contact.leadScore || 0)}`}>
                        {contact.leadScore || 0}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <button
                        onClick={() => handleEditContact(contact)}
                        className="text-[#2EAB2C] hover:text-green-700 font-medium"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredContacts.length === 0 && (
            <div className="text-center py-12">
              <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No contacts found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || filterTag !== 'all' || filterType !== 'all' || filterSource !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Get started by adding a new contact'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Email Tab */}
      {activeTab === 'email' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Send Email Campaign</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Template
              </label>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2EAB2C]"
              >
                <option value="">Choose a template...</option>
                {emailTemplates.map(template => (
                  <option key={template._id} value={template._id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject Override (optional)
              </label>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Leave empty to use template subject"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2EAB2C]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-3">Send to Selected Contacts</h3>
                <p className="text-sm text-blue-700 mb-4">
                  Go to the Contacts tab, select contacts, and click "Send Email"
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-3">Send by Tags</h3>
                <div className="space-y-2">
                  {allTags.slice(0, 5).map(tag => (
                    <button
                      key={tag}
                      onClick={() => handleSendEmailByTags([tag])}
                      disabled={!selectedTemplate || sendingEmail}
                      className="block w-full px-3 py-2 bg-white border border-green-300 rounded text-left hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      Send to: <strong>{tag}</strong>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">
                {editingContact ? 'Edit Contact' : 'Add New Contact'}
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2EAB2C]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2EAB2C]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2EAB2C]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Organization
                    </label>
                    <input
                      type="text"
                      value={contactForm.organizationName}
                      onChange={(e) => setContactForm({ ...contactForm, organizationName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2EAB2C]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Type
                    </label>
                    <select
                      value={contactForm.contactType}
                      onChange={(e) => setContactForm({ ...contactForm, contactType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2EAB2C]"
                    >
                      <option value="prospect">Prospect</option>
                      <option value="customer">Customer</option>
                      <option value="partner">Partner</option>
                      <option value="freelancer">Freelancer</option>
                      <option value="trainer">Trainer</option>
                      <option value="mentor">Mentor</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lead Source
                    </label>
                    <select
                      value={contactForm.leadSource}
                      onChange={(e) => setContactForm({ ...contactForm, leadSource: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2EAB2C]"
                    >
                      <option value="website">Website</option>
                      <option value="referral">Referral</option>
                      <option value="social_media">Social Media</option>
                      <option value="event">Event</option>
                      <option value="manual">Manual Entry</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={contactForm.notes}
                    onChange={(e) => setContactForm({ ...contactForm, notes: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2EAB2C]"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <button
                    onClick={() => setShowContactModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveContact}
                    disabled={loading || !contactForm.name || !contactForm.email}
                    className="px-4 py-2 bg-[#2EAB2C] text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Saving...' : 'Save Contact'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Send Bulk Email</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Template
                  </label>
                  <select
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2EAB2C]"
                  >
                    <option value="">Choose a template...</option>
                    {emailTemplates.map(template => (
                      <option key={template._id} value={template._id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject Override (optional)
                  </label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Leave empty to use template subject"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2EAB2C]"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
                  <strong>{selectedContacts.length}</strong> contact(s) will receive this email
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <button
                    onClick={() => {
                      setShowEmailModal(false);
                      setSelectedTemplate('');
                      setEmailSubject('');
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendBulkEmail}
                    disabled={sendingEmail || !selectedTemplate}
                    className="px-4 py-2 bg-[#2EAB2C] text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {sendingEmail ? (
                      <>Sending...</>
                    ) : (
                      <>
                        <PaperAirplaneIcon className="h-5 w-5" />
                        Send Email
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2EAB2C] mx-auto"></div>
            <p className="mt-4 text-gray-700">Loading...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesCommunication;

