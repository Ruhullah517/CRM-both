import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getContracts, generateContract, downloadContract, deleteContract } from '../services/contracts';
import { getContractTemplates, createContractTemplate, updateContractTemplate, deleteContractTemplate } from '../services/contractTemplates';
import {
  DocumentTextIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ClipboardDocumentListIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline';
import Loader from '../components/Loader';

const statuses = ['signed', 'pending', 'cancelled'];
const statusColors = {
  signed: 'bg-green-100 text-[#2EAB2C]',
  pending: 'bg-yellow-100 text-yellow-800',
  cancelled: 'bg-red-100 text-red-800',
  draft: 'bg-gray-100 text-gray-800',
  sent: 'bg-blue-100 text-blue-800',
  delivered: 'bg-indigo-100 text-indigo-800',
  completed: 'bg-green-100 text-green-800',
  declined: 'bg-red-100 text-red-800',
  expired: 'bg-orange-100 text-orange-800',
};

// Template View Modal Component
const TemplateViewModal = ({ show, onClose, template }) => {
  if (!show || !template) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">View Template</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Template Name
              </label>
              <p className="text-sm text-gray-900">{template.name}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                {template.type}
              </span>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Template Content
              </label>
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <pre className="whitespace-pre-wrap text-sm font-mono">{template.content}</pre>
              </div>
            </div>

            {template.placeholders && template.placeholders.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Placeholders
                </label>
                <div className="flex flex-wrap gap-2">
                  {template.placeholders.map((placeholder, index) => (
                    <span
                      key={index}
                      className="inline-flex px-2 py-1 text-xs font-mono rounded-md bg-green-100 text-green-800"
                    >
                      {`{{${placeholder}}}`}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex justify-end pt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Template Modal Component
const TemplateModal = ({ show, onClose, template, onSave, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'freelancer',
    content: ''
  });

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name || '',
        type: template.type || 'freelancer',
        content: template.content || ''
      });
    } else {
      setFormData({ name: '', type: 'freelancer', content: '' });
    }
  }, [template]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">
              {template ? 'Edit Template' : 'Create Template'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Template Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="freelancer">Freelancer</option>
                <option value="company">Company</option>
                <option value="trainer">Trainer</option>
                <option value="mentor">Mentor</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Template Content
              </label>
              <div className="text-xs text-gray-500 mb-2">
                Use placeholders like {'{{'} client_name {'}}'}, {'{{'} start_date {'}}'}, {'{{'} hourly_rate {'}}'}  etc.
              </div>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={15}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 font-mono text-sm"
                placeholder="Enter your contract template content here..."
                required
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : (template ? 'Update' : 'Create')}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Generate Contract Modal Component
const GenerateModal = ({ show, onClose, templates, onGenerate, loading }) => {
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [contractForm, setContractForm] = useState({
    name: '',
    roleType: 'freelancer',
    filledData: {}
  });
  const [placeholders, setPlaceholders] = useState([]);

  useEffect(() => {
    if (selectedTemplate) {
      const template = templates.find(t => t._id === selectedTemplate);
      if (template) {
        // Extract placeholders from template content
        const matches = template.content.match(/{{\s*([\w_\d]+)\s*}}/g) || [];
        const templatePlaceholders = matches.map(m => m.replace(/{{|}}/g, '').trim());
        setPlaceholders([...new Set(templatePlaceholders)]); // Remove duplicates
        
        // Initialize filledData with empty values
        const initialData = {};
        templatePlaceholders.forEach(ph => {
          initialData[ph] = '';
        });
        setContractForm(prev => ({ 
          ...prev, 
          roleType: template.type,
          filledData: initialData 
        }));
      }
    } else {
      setPlaceholders([]);
      setContractForm(prev => ({ ...prev, filledData: {} }));
    }
  }, [selectedTemplate, templates]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onGenerate({
      ...contractForm,
      templateId: selectedTemplate
    });
  };

  const handlePlaceholderChange = (placeholder, value) => {
    setContractForm(prev => ({
      ...prev,
      filledData: {
        ...prev.filledData,
        [placeholder]: value
      }
    }));
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Generate New Contract</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contract Name
              </label>
              <input
                type="text"
                value={contractForm.name}
                onChange={(e) => setContractForm({ ...contractForm, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Template
              </label>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="">Choose a template...</option>
                {templates.map(template => (
                  <option key={template._id} value={template._id}>
                    {template.name} ({template.type})
                  </option>
                ))}
              </select>
            </div>
            
            {placeholders.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-medium text-gray-900 mb-3">Fill Contract Details</h3>
                <div className="space-y-3">
                  {placeholders.map(placeholder => (
                    <div key={placeholder}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {placeholder.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </label>
                      <input
                        type="text"
                        value={contractForm.filledData[placeholder] || ''}
                        onChange={(e) => handlePlaceholderChange(placeholder, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading || !selectedTemplate}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Generating...' : 'Generate Contract'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Main Contracts Component
const Contracts = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('contracts');
  const [loading, setLoading] = useState(false);
  
  // Contracts state
  const [contracts, setContracts] = useState([]);
  const [selectedContract, setSelectedContract] = useState(null);
  const [showContractDetail, setShowContractDetail] = useState(false);
  
  // Templates state
  const [templates, setTemplates] = useState([]);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showTemplateView, setShowTemplateView] = useState(false);
  const [viewingTemplate, setViewingTemplate] = useState(null);
  const [editingTemplate, setEditingTemplate] = useState(null);
  
  // Generate state
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  
  // Search and filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [contractsData, templatesData] = await Promise.all([
        getContracts(),
        getContractTemplates()
      ]);
      setContracts(contractsData);
      setTemplates(templatesData);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Error loading data: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Template handlers
  const handleSaveTemplate = async (templateData) => {
    setLoading(true);
    try {
      if (editingTemplate) {
        const result = await updateContractTemplate(editingTemplate._id, templateData);
        setTemplates(templates.map(t => t._id === editingTemplate._id ? result : t));
        alert('Template updated successfully!');
      } else {
        const result = await createContractTemplate(templateData);
        setTemplates([...templates, result]);
        alert('Template created successfully!');
      }
      setShowTemplateModal(false);
      setEditingTemplate(null);
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Error saving template: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (id) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    
    setLoading(true);
    try {
      await deleteContractTemplate(id);
      setTemplates(templates.filter(t => t._id !== id));
      alert('Template deleted successfully!');
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Error deleting template: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Contract handlers
  const handleGenerateContract = async (contractData) => {
    setLoading(true);
    try {
      const result = await generateContract({
        ...contractData,
        generatedBy: user._id || user.user?.id
      });
      setContracts([result, ...contracts]);
      setShowGenerateModal(false);
      alert('Contract generated successfully!');
    } catch (error) {
      console.error('Error generating contract:', error);
      alert('Error generating contract: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContract = async (id) => {
    if (!confirm('Are you sure you want to delete this contract?')) return;
    
    setLoading(true);
    try {
      await deleteContract(id);
      setContracts(contracts.filter(c => c._id !== id));
      alert('Contract deleted successfully!');
    } catch (error) {
      console.error('Error deleting contract:', error);
      alert('Error deleting contract: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadContract = async (id) => {
    try {
      await downloadContract(id);
    } catch (error) {
      console.error('Error downloading contract:', error);
      alert('Error downloading contract: ' + (error.response?.data?.message || error.message));
    }
  };

  // Filter functions
  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = (contract.name || contract._id || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || contract.roleType === filterType;
    return matchesSearch && matchesFilter;
  });

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || template.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const tabs = [
    { id: 'contracts', name: 'All Contracts', icon: DocumentTextIcon },
    { id: 'templates', name: 'Templates', icon: ClipboardDocumentListIcon },
    { id: 'generate', name: 'Generate New', icon: DocumentDuplicateIcon }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Contract Management</h1>
        <p className="text-gray-600">Manage templates, generate contracts, and track agreements</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Types</option>
              <option value="freelancer">Freelancer</option>
              <option value="company">Company</option>
              <option value="trainer">Trainer</option>
              <option value="mentor">Mentor</option>
            </select>
          </div>
          {activeTab === 'templates' && (
            <button
              onClick={() => setShowTemplateModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              New Template
            </button>
          )}
          {activeTab === 'contracts' && (
            <button
              onClick={() => setShowGenerateModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              Generate Contract
            </button>
          )}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'contracts' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contract Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredContracts.map((contract) => (
                  <tr key={contract._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {contract.name || contract._id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{contract.roleType}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        statusColors[contract.status?.toLowerCase()] || 'bg-gray-100 text-gray-800'
                      }`}>
                        {contract.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {contract.generatedBy?.name || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedContract(contract);
                            setShowContractDetail(true);
                          }}
                          className="text-green-600 hover:text-green-900"
                        >
                          <EyeIcon className="w-5 h-5" />
                        </button>
                        {contract.generatedDocUrl && (
                          <button
                            onClick={() => handleDownloadContract(contract._id)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <ArrowDownTrayIcon className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteContract(contract._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredContracts.length === 0 && (
            <div className="text-center py-12">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No contracts found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by generating your first contract.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => setShowGenerateModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                  Generate Contract
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Template Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTemplates.map((template) => (
                  <tr key={template._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {template.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {template.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(template.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setViewingTemplate(template);
                            setShowTemplateView(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Template"
                        >
                          <EyeIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingTemplate(template);
                            setShowTemplateModal(true);
                          }}
                          className="text-green-600 hover:text-green-900"
                          title="Edit Template"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteTemplate(template._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Template"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No templates found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first contract template.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => setShowTemplateModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                  New Template
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'generate' && (
        <div className="bg-white rounded-lg shadow p-8">
          <div className="text-center">
            <DocumentDuplicateIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">Generate New Contract</h3>
            <p className="mt-1 text-sm text-gray-500">
              Create a new contract from one of your templates.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowGenerateModal(true)}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                Start Generating
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <TemplateViewModal
        show={showTemplateView}
        onClose={() => {
          setShowTemplateView(false);
          setViewingTemplate(null);
        }}
        template={viewingTemplate}
      />

      <TemplateModal
        show={showTemplateModal}
        onClose={() => {
          setShowTemplateModal(false);
          setEditingTemplate(null);
        }}
        template={editingTemplate}
        onSave={handleSaveTemplate}
        loading={loading}
      />

      <GenerateModal
        show={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        templates={templates}
        onGenerate={handleGenerateContract}
        loading={loading}
      />

      {/* Contract Detail Modal */}
      {showContractDetail && selectedContract && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-4 md:top-20 mx-auto p-3 md:p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Contract Details
                </h3>
                <button
                  onClick={() => {
                    setShowContractDetail(false);
                    setSelectedContract(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Contract Name:</label>
                    <p className="text-sm text-gray-900 break-words">{selectedContract.name || selectedContract._id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Type:</label>
                    <p className="text-sm text-gray-900">{selectedContract.roleType}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Status:</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      statusColors[selectedContract.status?.toLowerCase()] || 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedContract.status}
                    </span>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Created By:</label>
                    <p className="text-sm text-gray-900">{selectedContract.generatedBy?.name || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Created Date:</label>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedContract.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Certificate Number:</label>
                    <p className="text-sm text-gray-900">{selectedContract.certificateNumber || '-'}</p>
                  </div>
                </div>

                {selectedContract.filledData && Object.keys(selectedContract.filledData).length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Contract Details:</label>
                    <div className="mt-2 bg-gray-50 p-3 rounded-md">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {Object.entries(selectedContract.filledData).map(([key, value]) => (
                          <div key={key}>
                            <span className="text-sm font-medium text-gray-600">
                              {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                            </span>
                            <span className="text-sm text-gray-900 ml-2">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {selectedContract.generatedDocUrl && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">PDF Document:</label>
                    <div className="mt-2">
                      <a
                        href={selectedContract.generatedDocUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                      >
                        <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                        View PDF
                      </a>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                {selectedContract.generatedDocUrl && (
                  <button
                    onClick={() => handleDownloadContract(selectedContract._id)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                    Download PDF
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowContractDetail(false);
                    setSelectedContract(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading && <Loader />}
    </div>
  );
};

export default Contracts;