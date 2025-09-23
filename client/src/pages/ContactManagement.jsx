import React, { useState, useEffect } from 'react';
import { 
  UserGroupIcon, 
  TagIcon, 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { 
  getAllContacts, 
  createContact, 
  updateContact, 
  deleteContact,
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
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    contactType: 'prospect',
    status: 'active',
    tags: [],
    notes: ''
  });

  useEffect(() => {
    loadContacts();
    loadStats();
  }, []);

  useEffect(() => {
    filterContacts();
  }, [contacts, searchTerm]);

  const loadContacts = async () => {
    setLoading(true);
    try {
      const contactsData = await getAllContacts();
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
    if (searchTerm) {
      filtered = filtered.filter(contact =>
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email?.toLowerCase().includes(searchTerm.toLowerCase())
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
      alert('Error saving contact: ' + (error.response?.data?.message || error.message));
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
        alert('Error deleting contact: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleEdit = (contact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name || '',
      email: contact.email || '',
      phone: contact.phone || '',
      contactType: contact.contactType || 'prospect',
      status: contact.status || 'active',
      tags: contact.tags || [],
      notes: contact.notes || ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      contactType: 'prospect',
      status: 'active',
      tags: [],
      notes: ''
    });
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
      alert('Error updating contacts: ' + (error.response?.data?.message || error.message));
    }
  };

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
                Manage your contacts and track interactions
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

        {/* Search */}
        <div className="px-6 py-4 border-b border-gray-200">
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
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
                <>
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
                </>
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
                  Status
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
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {contact.contactType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      contact.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {contact.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
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
                ×
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
    </div>
  );
};

export default ContactManagement;
