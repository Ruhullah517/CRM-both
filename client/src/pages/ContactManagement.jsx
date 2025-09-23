import React, { useState, useEffect } from 'react';
import { 
  UserGroupIcon, 
  TagIcon, 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ChartBarIcon,
  ClockIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { 
  getAllContacts, 
  createContact, 
  updateContact, 
  deleteContact,
  getContactsByTags,
  getContactsByType,
  getContactsNeedingFollowUp,
  addCommunicationHistory,
  updateLeadScore,
  getContactStats,
  bulkUpdateContacts
} from '../services/contacts';
import { exportContacts } from '../services/exports';

const ContactManagement = () => {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [contactStats, setContactStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterTags, setFilterTags] = useState([]);
  const [showCommunicationModal, setShowCommunicationModal] = useState(false);
  const [selectedContactForCommunication, setSelectedContactForCommunication] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    organizationName: '',
    organizationAddress: '',
    contactType: 'prospect',
    interestAreas: [],
    leadSource: '',
    leadScore: 0,
    status: 'active',
    tags: [],
    notes: '',
    emailPreferences: {
      marketing: true,
      training: true,
      newsletters: true,
      updates: true
    },
    nextFollowUpDate: ''
  });

  // Communication form
  const [communicationData, setCommunicationData] = useState({
    type: 'email',
    summary: '',
    engagement: {
      opened: false,
      clicked: false,
      bounced: false
    }
  });

  useEffect(() => {
    loadContacts();
    loadStats();
  }, []);

  useEffect(() => {
    filterContacts();
  }, [contacts, searchTerm, filterType, filterTags, activeTab]);

  const loadContacts = async () => {
    setLoading(true);
    try {
      let contactsData;
      
      switch (activeTab) {
        case 'follow-up':
          contactsData = await getContactsNeedingFollowUp();
          break;
        case 'partners':
          contactsData = await getContactsByType('partner');
          break;
        case 'customers':
          contactsData = await getContactsByType('customer');
          break;
        case 'prospects':
          contactsData = await getContactsByType('prospect');
          break;
        default:
          contactsData = await getAllContacts();
      }
      
      setContacts(contactsData);
    } catch (error) {
      console.error('Error loading contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const stats = await getContactStats();
      setContactStats(stats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const filterContacts = () => {
    let filtered = [...contacts];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(contact =>
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.organizationName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(contact => contact.contactType === filterType);
    }

    // Tags filter
    if (filterTags.length > 0) {
      filtered = filtered.filter(contact =>
        filterTags.some(tag => contact.tags?.includes(tag))
      );
    }

    setFilteredContacts(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (editingContact) {
        await updateContact(editingContact._id, formData);
      } else {
        await createContact(formData);
      }
      
      setShowModal(false);
      setEditingContact(null);
      resetForm();
      loadContacts();
      loadStats();
    } catch (error) {
      console.error('Error saving contact:', error);
      alert('Error saving contact: ' + error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await deleteContact(id);
        loadContacts();
        loadStats();
      } catch (error) {
        console.error('Error deleting contact:', error);
        alert('Error deleting contact: ' + error.response?.data?.message || error.message);
      }
    }
  };

  const handleEdit = (contact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name || '',
      email: contact.email || '',
      phone: contact.phone || '',
      organizationName: contact.organizationName || '',
      organizationAddress: contact.organizationAddress || '',
      contactType: contact.contactType || 'prospect',
      interestAreas: contact.interestAreas || [],
      leadSource: contact.leadSource || '',
      leadScore: contact.leadScore || 0,
      status: contact.status || 'active',
      tags: contact.tags || [],
      notes: contact.notes || '',
      emailPreferences: contact.emailPreferences || {
        marketing: true,
        training: true,
        newsletters: true,
        updates: true
      },
      nextFollowUpDate: contact.nextFollowUpDate ? new Date(contact.nextFollowUpDate).toISOString().split('T')[0] : ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      organizationName: '',
      organizationAddress: '',
      contactType: 'prospect',
      interestAreas: [],
      leadSource: '',
      leadScore: 0,
      status: 'active',
      tags: [],
      notes: '',
      emailPreferences: {
        marketing: true,
        training: true,
        newsletters: true,
        updates: true
      },
      nextFollowUpDate: ''
    });
  };

  const handleAddCommunication = async (e) => {
    e.preventDefault();
    try {
      await addCommunicationHistory(
        selectedContactForCommunication._id,
        communicationData.type,
        communicationData.summary,
        communicationData.engagement
      );
      
      setShowCommunicationModal(false);
      setSelectedContactForCommunication(null);
      setCommunicationData({
        type: 'email',
        summary: '',
        engagement: { opened: false, clicked: false, bounced: false }
      });
      loadContacts();
    } catch (error) {
      console.error('Error adding communication:', error);
      alert('Error adding communication: ' + error.response?.data?.message || error.message);
    }
  };

  const handleBulkUpdate = async (updateData) => {
    if (selectedContacts.length === 0) {
      alert('Please select contacts to update');
      return;
    }

    try {
      await bulkUpdateContacts(selectedContacts, updateData);
      setSelectedContacts([]);
      loadContacts();
      loadStats();
    } catch (error) {
      console.error('Error bulk updating contacts:', error);
      alert('Error updating contacts: ' + error.response?.data?.message || error.message);
    }
  };

  const getUniqueTags = () => {
    const allTags = contacts.flatMap(contact => contact.tags || []);
    return [...new Set(allTags)];
  };

  const getUniqueInterestAreas = () => {
    const allAreas = contacts.flatMap(contact => contact.interestAreas || []);
    return [...new Set(allAreas)];
  };

  const tabs = [
    { id: 'all', name: 'All Contacts', count: contactStats?.totalContacts || 0 },
    { id: 'prospects', name: 'Prospects', count: contactStats?.byType?.find(t => t._id === 'prospect')?.count || 0 },
    { id: 'customers', name: 'Customers', count: contactStats?.byType?.find(t => t._id === 'customer')?.count || 0 },
    { id: 'partners', name: 'Partners', count: contactStats?.byType?.find(t => t._id === 'partner')?.count || 0 },
    { id: 'follow-up', name: 'Follow-up Needed', count: contactStats?.contactsNeedingFollowUp || 0 },
  ];

  if (loading && !contacts.length) {
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
              <h1 className="text-2xl font-bold text-gray-900">Contact Management</h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage your contacts, track interactions, and monitor lead progression
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Contact
            </button>
          </div>
        </div>

        {/* Stats */}
        {contactStats && (
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{contactStats.totalContacts}</div>
                <div className="text-sm text-blue-800">Total Contacts</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{contactStats.activeContacts}</div>
                <div className="text-sm text-green-800">Active</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{contactStats.contactsNeedingFollowUp}</div>
                <div className="text-sm text-yellow-800">Need Follow-up</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {contactStats.totalContacts > 0 ? Math.round((contactStats.activeContacts / contactStats.totalContacts) * 100) : 0}%
                </div>
                <div className="text-sm text-purple-800">Active Rate</div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  loadContacts();
                }}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                {tab.name} ({tab.count})
              </button>
            ))}
          </nav>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <input
                type="text"
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        </div>
      </div>

      {/* Contacts Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">
              {filteredContacts.length} Contact{filteredContacts.length !== 1 ? 's' : ''}
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={() => exportContacts()}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200"
              >
                Export CSV
              </button>
              {selectedContacts.length > 0 && (
                <button
                  onClick={() => handleBulkUpdate({ status: 'active' })}
                  className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm hover:bg-green-200"
                >
                  Mark Active
                </button>
                <button
                  onClick={() => handleBulkUpdate({ status: 'inactive' })}
                  className="px-3 py-1 bg-gray-100 text-gray-800 rounded text-sm hover:bg-gray-200"
                >
                  Mark Inactive
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedContacts.length === filteredContacts.length && filteredContacts.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedContacts(filteredContacts.map(c => c._id));
                      } else {
                        setSelectedContacts([]);
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lead Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tags
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredContacts.map((contact) => (
                <tr key={contact._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedContacts.includes(contact._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedContacts([...selectedContacts, contact._id]);
                        } else {
                          setSelectedContacts(selectedContacts.filter(id => id !== contact._id));
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{contact.name}</div>
                      <div className="text-sm text-gray-500">{contact.email}</div>
                      {contact.organizationName && (
                        <div className="text-sm text-gray-500">{contact.organizationName}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {contact.contactType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${contact.leadScore}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900">{contact.leadScore}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      contact.status === 'active' 
                        ? 'bg-green-100 text-green-800'
                        : contact.status === 'inactive'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {contact.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {contact.tags?.slice(0, 2).map((tag) => (
                        <span key={tag} className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                          {tag}
                        </span>
                      ))}
                      {contact.tags?.length > 2 && (
                        <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                          +{contact.tags.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {contact.lastContactDate 
                      ? new Date(contact.lastContactDate).toLocaleDateString()
                      : 'Never'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedContactForCommunication(contact);
                          setShowCommunicationModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                        title="Add Communication"
                      >
                        <EnvelopeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(contact)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Edit"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(contact._id)}
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

      {/* Contact Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingContact ? 'Edit Contact' : 'Add New Contact'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingContact(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact Type</label>
                  <select
                    value={formData.contactType}
                    onChange={(e) => setFormData({ ...formData, contactType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="prospect">Prospect</option>
                    <option value="customer">Customer</option>
                    <option value="partner">Partner</option>
                    <option value="freelancer">Freelancer</option>
                    <option value="trainer">Trainer</option>
                    <option value="mentor">Mentor</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Organization</label>
                  <input
                    type="text"
                    value={formData.organizationName}
                    onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Lead Source</label>
                  <input
                    type="text"
                    value={formData.leadSource}
                    onChange={(e) => setFormData({ ...formData, leadSource: e.target.value })}
                    placeholder="e.g., website, referral, event"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Lead Score (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.leadScore}
                    onChange={(e) => setFormData({ ...formData, leadScore: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="unsubscribed">Unsubscribed</option>
                    <option value="bounced">Bounced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={formData.tags.join(', ')}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map(t => t.trim()).filter(t => t) })}
                  placeholder="training, mentoring, membership"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Interest Areas (comma-separated)</label>
                <input
                  type="text"
                  value={formData.interestAreas.join(', ')}
                  onChange={(e) => setFormData({ ...formData, interestAreas: e.target.value.split(',').map(t => t.trim()).filter(t => t) })}
                  placeholder="training, mentoring, membership"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Next Follow-up Date</label>
                <input
                  type="date"
                  value={formData.nextFollowUpDate}
                  onChange={(e) => setFormData({ ...formData, nextFollowUpDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingContact(null);
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
                  {loading ? 'Saving...' : editingContact ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Communication Modal */}
      {showCommunicationModal && selectedContactForCommunication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Add Communication - {selectedContactForCommunication.name}
              </h3>
              <button
                onClick={() => {
                  setShowCommunicationModal(false);
                  setSelectedContactForCommunication(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCommunication} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  value={communicationData.type}
                  onChange={(e) => setCommunicationData({ ...communicationData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="email">Email</option>
                  <option value="call">Phone Call</option>
                  <option value="meeting">Meeting</option>
                  <option value="note">Note</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Summary</label>
                <textarea
                  required
                  value={communicationData.summary}
                  onChange={(e) => setCommunicationData({ ...communicationData, summary: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the communication..."
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCommunicationModal(false);
                    setSelectedContactForCommunication(null);
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add Communication
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactManagement;
