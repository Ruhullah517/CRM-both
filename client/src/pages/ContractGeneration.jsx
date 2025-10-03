import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  DocumentTextIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { getContractTemplates, createContractTemplate, updateContractTemplate, deleteContractTemplate } from '../services/contractTemplates';
import { getContracts, generateContract, downloadContract, deleteContract } from '../services/contracts';

const ContractGeneration = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('templates');
  
  // Templates state
  const [templates, setTemplates] = useState([]);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [templateForm, setTemplateForm] = useState({
    name: '',
    type: 'freelancer',
    content: ''
  });
  
  // Contracts state
  const [contracts, setContracts] = useState([]);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [contractForm, setContractForm] = useState({
    name: '',
    roleType: 'freelancer',
    filledData: {}
  });
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [templatesData, contractsData] = await Promise.all([
        getContractTemplates(),
        getContracts()
      ]);
      setTemplates(templatesData);
      setContracts(contractsData);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Error loading data: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    setLoading(true);
    try {
      const result = await createContractTemplate(templateForm);
      setTemplates([...templates, result]);
      setShowTemplateModal(false);
      setTemplateForm({ name: '', type: 'freelancer', content: '' });
      alert('Template created successfully!');
    } catch (error) {
      console.error('Error creating template:', error);
      alert('Error creating template: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTemplate = async () => {
    setLoading(true);
    try {
      const result = await updateContractTemplate(editingTemplate._id, templateForm);
      setTemplates(templates.map(t => t._id === editingTemplate._id ? result : t));
      setShowTemplateModal(false);
      setEditingTemplate(null);
      setTemplateForm({ name: '', type: 'freelancer', content: '' });
      alert('Template updated successfully!');
    } catch (error) {
      console.error('Error updating template:', error);
      alert('Error updating template: ' + (error.response?.data?.message || error.message));
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

  const handleGenerateContract = async () => {
    if (!selectedTemplate) {
      alert('Please select a template');
      return;
    }
    
    setLoading(true);
    try {
      const contractData = {
        ...contractForm,
        templateId: selectedTemplate,
        generatedBy: user._id
      };
      
      const result = await generateContract(contractData);
      setContracts([result, ...contracts]);
      setShowGenerateModal(false);
      setSelectedTemplate('');
      setContractForm({ name: '', roleType: 'freelancer', filledData: {} });
      alert('Contract generated successfully!');
    } catch (error) {
      console.error('Error generating contract:', error);
      alert('Error generating contract: ' + (error.response?.data?.message || error.message));
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

  const handleEditTemplate = (template) => {
    setEditingTemplate(template);
    setTemplateForm({
      name: template.name,
      type: template.type,
      content: template.content
    });
    setShowTemplateModal(true);
  };

  const handleAddTemplate = () => {
    setEditingTemplate(null);
    setTemplateForm({ name: '', type: 'freelancer', content: '' });
    setShowTemplateModal(true);
  };

  const handleAddContract = () => {
    setSelectedTemplate('');
    setContractForm({ name: '', roleType: 'freelancer', filledData: {} });
    setShowGenerateModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'signed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'declined': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || template.type === filterType;
    return matchesSearch && matchesType;
  });

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || contract.roleType === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Contract Generation</h1>
        <p className="text-gray-600">Manage contract templates and generate contracts</p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('templates')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'templates'
                ? 'border-[#2EAB2C] text-[#2EAB2C]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <DocumentTextIcon className="h-5 w-5 inline mr-2" />
            Templates
          </button>
          <button
            onClick={() => setActiveTab('contracts')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'contracts'
                ? 'border-[#2EAB2C] text-[#2EAB2C]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <DocumentTextIcon className="h-5 w-5 inline mr-2" />
            Contracts
          </button>
        </nav>
      </div>

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div>
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2EAB2C] focus:border-transparent"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2EAB2C] focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="freelancer">Freelancer</option>
                <option value="mentor">Mentor</option>
                <option value="delivery">Delivery</option>
                <option value="company">Company</option>
              </select>
            </div>
            <button
              onClick={handleAddTemplate}
              className="bg-[#2EAB2C] text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              Add Template
            </button>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map(template => (
              <div key={template._id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full mt-1">
                      {template.type}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditTemplate(template)}
                      className="text-gray-400 hover:text-blue-600"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTemplate(template._id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {template.content.substring(0, 150)}...
                </p>
                <div className="text-xs text-gray-500">
                  Placeholders: {template.placeholders?.length || 0}
                </div>
              </div>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
              <p className="text-gray-500">Create your first contract template to get started.</p>
            </div>
          )}
        </div>
      )}

      {/* Contracts Tab */}
      {activeTab === 'contracts' && (
        <div>
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search contracts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2EAB2C] focus:border-transparent"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2EAB2C] focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="freelancer">Freelancer</option>
                <option value="mentor">Mentor</option>
                <option value="delivery">Delivery</option>
                <option value="company">Company</option>
              </select>
            </div>
            <button
              onClick={handleAddContract}
              className="bg-[#2EAB2C] text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              Generate Contract
            </button>
          </div>

          {/* Contracts Table */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
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
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredContracts.map(contract => (
                  <tr key={contract._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{contract.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {contract.roleType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(contract.status)}`}>
                        {contract.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(contract.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleDownloadContract(contract._id)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Download"
                        >
                          <ArrowDownTrayIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteContract(contract._id)}
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

          {filteredContracts.length === 0 && (
            <div className="text-center py-12">
              <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No contracts found</h3>
              <p className="text-gray-500">Generate your first contract to get started.</p>
            </div>
          )}
        </div>
      )}

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">
                {editingTemplate ? 'Edit Template' : 'Create Template'}
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Template Name *
                    </label>
                    <input
                      type="text"
                      value={templateForm.name}
                      onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2EAB2C]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contract Type *
                    </label>
                    <select
                      value={templateForm.type}
                      onChange={(e) => setTemplateForm({ ...templateForm, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2EAB2C]"
                    >
                      <option value="freelancer">Freelancer</option>
                      <option value="mentor">Mentor</option>
                      <option value="delivery">Delivery</option>
                      <option value="company">Company</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Template Content *
                  </label>
                  <textarea
                    value={templateForm.content}
                    onChange={(e) => setTemplateForm({ ...templateForm, content: e.target.value })}
                    rows={12}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2EAB2C]"
                    placeholder="Enter your contract template content. Use placeholders like {{name}}, {{email}}, {{company}}, etc."
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Use placeholders like {{name}}, {{email}}, {{company}}, {{date}}, {{amount}} for dynamic content.
                  </p>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}
                  disabled={loading || !templateForm.name || !templateForm.content}
                  className="px-4 py-2 bg-[#2EAB2C] text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : (editingTemplate ? 'Update Template' : 'Create Template')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generate Contract Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Generate Contract</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Template *
                  </label>
                  <select
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2EAB2C]"
                  >
                    <option value="">Choose a template...</option>
                    {templates.map(template => (
                      <option key={template._id} value={template._id}>
                        {template.name} ({template.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contract Name *
                    </label>
                    <input
                      type="text"
                      value={contractForm.name}
                      onChange={(e) => setContractForm({ ...contractForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2EAB2C]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contract Type *
                    </label>
                    <select
                      value={contractForm.roleType}
                      onChange={(e) => setContractForm({ ...contractForm, roleType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2EAB2C]"
                    >
                      <option value="freelancer">Freelancer</option>
                      <option value="mentor">Mentor</option>
                      <option value="delivery">Delivery</option>
                      <option value="company">Company</option>
                    </select>
                  </div>
                </div>

                {selectedTemplate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fill Template Data
                    </label>
                    <div className="space-y-2">
                      {templates.find(t => t._id === selectedTemplate)?.placeholders?.map(placeholder => (
                        <input
                          key={placeholder}
                          type="text"
                          placeholder={`${placeholder} (e.g., John Doe)`}
                          value={contractForm.filledData[placeholder] || ''}
                          onChange={(e) => setContractForm({
                            ...contractForm,
                            filledData: {
                              ...contractForm.filledData,
                              [placeholder]: e.target.value
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2EAB2C]"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <button
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerateContract}
                  disabled={loading || !selectedTemplate || !contractForm.name}
                  className="px-4 py-2 bg-[#2EAB2C] text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Generating...' : 'Generate Contract'}
                </button>
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

export default ContractGeneration;
