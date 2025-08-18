import React, { useState, useEffect } from 'react';
import { 
  DocumentTextIcon, 
  PlusIcon,
  EyeIcon,
  DocumentArrowDownIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CurrencyPoundIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import api from '../services/api';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [stats, setStats] = useState({});
  const [markingAsPaid, setMarkingAsPaid] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    client: {
      name: '',
      email: '',
      phone: '',
      organization: '',
      address: ''
    },
    items: [{ description: '', quantity: 1, unitPrice: 0, total: 0, type: 'other' }],
    subtotal: 0,
    taxRate: 0,
    taxAmount: 0,
    total: 0,
    currency: 'GBP',
    dueDate: '',
    notes: '',
    terms: ''
  });

  useEffect(() => {
    fetchInvoices();
    fetchStats();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await api.get('/invoices');
      setInvoices(response.data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      console.log('Fetching invoice stats...');
      const response = await api.get('/invoices/stats');
      console.log('Stats response:', response.data);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const createInvoice = async (e) => {
    e.preventDefault();
    try {
      console.log('Creating new invoice...');
      await api.post('/invoices', formData);
      console.log('Invoice created successfully');
      
      setShowCreateModal(false);
      setFormData({
        client: { name: '', email: '', phone: '', organization: '', address: '' },
        items: [{ description: '', quantity: 1, unitPrice: 0, total: 0, type: 'other' }],
        subtotal: 0,
        taxRate: 0,
        taxAmount: 0,
        total: 0,
        currency: 'GBP',
        dueDate: '',
        notes: '',
        terms: ''
      });
      
      // Refresh both invoices and stats
      await fetchInvoices();
      await fetchStats();
      
      console.log('Data refreshed after creating invoice');
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('Error creating invoice. Please try again.');
    }
  };

  const markAsPaid = async (invoiceId) => {
    try {
      setMarkingAsPaid(invoiceId);
      console.log('Marking invoice as paid:', invoiceId);
      await api.put(`/invoices/${invoiceId}/mark-paid`);
      console.log('Invoice marked as paid successfully');
      
      // Refresh both invoices and stats
      await fetchInvoices();
      await fetchStats();
      
      console.log('Data refreshed after marking as paid');
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
      alert('Error marking invoice as paid. Please try again.');
    } finally {
      setMarkingAsPaid(null);
    }
  };

  const exportPaymentHistory = async () => {
    try {
      const response = await api.get('/export/payment-history', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'payment-history.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting payment history:', error);
      alert('Error exporting data');
    }
  };

  const downloadInvoice = async (invoiceId) => {
    try {
      const response = await api.get(`/invoices/${invoiceId}/pdf`, {
        responseType: 'blob'
      });
      
      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoiceId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading invoice:', error);
    }
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Calculate total for this item
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
    }
    
    // Calculate subtotal
    const subtotal = newItems.reduce((sum, item) => sum + item.total, 0);
    const taxAmount = (subtotal * formData.taxRate) / 100;
    const total = subtotal + taxAmount;
    
    setFormData({
      ...formData,
      items: newItems,
      subtotal,
      taxAmount,
      total
    });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, unitPrice: 0, total: 0, type: 'other' }]
    });
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    const subtotal = newItems.reduce((sum, item) => sum + item.total, 0);
    const taxAmount = (subtotal * formData.taxRate) / 100;
    const total = subtotal + taxAmount;
    
    setFormData({
      ...formData,
      items: newItems,
      subtotal,
      taxAmount,
      total
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'draft':
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
      case 'sent':
        return <DocumentTextIcon className="h-5 w-5 text-blue-500" />;
      case 'paid':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'overdue':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'draft':
        return 'Draft';
      case 'sent':
        return 'Sent';
      case 'paid':
        return 'Paid';
      case 'overdue':
        return 'Overdue';
      default:
        return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <DocumentTextIcon className="h-8 w-8 mr-3 text-blue-500" />
              Invoices
            </h1>
            <p className="text-gray-600 mt-2">
              Manage invoices and track payments
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportPaymentHistory}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center"
            >
              <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
              Export Payments
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Invoice
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <CurrencyPoundIcon className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Paid</p>
              <p className="text-xl font-bold text-gray-900">£{stats.totalPaid || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-yellow-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-xl font-bold text-gray-900">£{stats.totalPending || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Overdue</p>
              <p className="text-xl font-bold text-gray-900">£{stats.totalOverdue || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <DocumentTextIcon className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Invoices</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalInvoices || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
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
              {invoices.map((invoice) => (
                <tr key={invoice._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {invoice.invoiceNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {invoice.client.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {invoice.client.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    £{invoice.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(new Date(invoice.dueDate), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(invoice.status)}
                      <span className="ml-2 text-sm text-gray-900">
                        {getStatusText(invoice.status)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedInvoice(invoice);
                          setShowDetailsModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 flex items-center"
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        View
                      </button>
                      <button
                        onClick={() => downloadInvoice(invoice._id)}
                        className="text-green-600 hover:text-green-900 flex items-center"
                      >
                        <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
                        Download
                      </button>
                      {invoice.status !== 'paid' && (
                        <button
                          onClick={() => markAsPaid(invoice._id)}
                          disabled={markingAsPaid === invoice._id}
                          className={`flex items-center ${
                            markingAsPaid === invoice._id 
                              ? 'text-gray-400 cursor-not-allowed' 
                              : 'text-purple-600 hover:text-purple-900'
                          }`}
                        >
                          {markingAsPaid === invoice._id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-1"></div>
                              Updating...
                            </>
                          ) : (
                            <>
                              <CheckCircleIcon className="h-4 w-4 mr-1" />
                              Mark Paid
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Invoice Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Invoice</h3>
              <form onSubmit={createInvoice} className="space-y-6">
                {/* Client Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Client Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.client.name}
                      onChange={(e) => setFormData({...formData, client: {...formData.client, name: e.target.value}})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      value={formData.client.email}
                      onChange={(e) => setFormData({...formData, client: {...formData.client, email: e.target.value}})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                      type="text"
                      value={formData.client.phone}
                      onChange={(e) => setFormData({...formData, client: {...formData.client, phone: e.target.value}})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Organization</label>
                    <input
                      type="text"
                      value={formData.client.organization}
                      onChange={(e) => setFormData({...formData, client: {...formData.client, organization: e.target.value}})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                </div>

                {/* Invoice Items */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-md font-medium text-gray-900">Invoice Items</h4>
                    <button
                      type="button"
                      onClick={addItem}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-sm"
                    >
                      Add Item
                    </button>
                  </div>
                  {formData.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Quantity</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Unit Price</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value))}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                      </div>
                      <div className="flex items-end space-x-2">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700">Total</label>
                          <input
                            type="number"
                            value={item.total}
                            readOnly
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50"
                          />
                        </div>
                        {formData.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="bg-red-500 hover:bg-red-600 text-white px-2 py-2 rounded-md"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tax Rate (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.taxRate}
                      onChange={(e) => {
                        const taxRate = parseFloat(e.target.value);
                        const taxAmount = (formData.subtotal * taxRate) / 100;
                        const total = formData.subtotal + taxAmount;
                        setFormData({...formData, taxRate, taxAmount, total});
                      }}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Subtotal</label>
                    <input
                      type="number"
                      value={formData.subtotal}
                      readOnly
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Total</label>
                    <input
                      type="number"
                      value={formData.total}
                      readOnly
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Due Date *</label>
                    <input
                      type="date"
                      required
                      value={formData.dueDate}
                      onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Currency</label>
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData({...formData, currency: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="GBP">GBP (£)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    rows="3"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600"
                  >
                    Create Invoice
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Details Modal */}
      {showDetailsModal && selectedInvoice && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Invoice Details</h3>
              <div className="space-y-6">
                {/* Invoice Header */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-2">Invoice Information</h4>
                    <div className="space-y-2">
                      <p><span className="font-medium">Invoice Number:</span> {selectedInvoice.invoiceNumber}</p>
                      <p><span className="font-medium">Status:</span> {getStatusText(selectedInvoice.status)}</p>
                      <p><span className="font-medium">Issued Date:</span> {format(new Date(selectedInvoice.issuedDate), 'MMM dd, yyyy')}</p>
                      <p><span className="font-medium">Due Date:</span> {format(new Date(selectedInvoice.dueDate), 'MMM dd, yyyy')}</p>
                      {selectedInvoice.paidDate && (
                        <p><span className="font-medium">Paid Date:</span> {format(new Date(selectedInvoice.paidDate), 'MMM dd, yyyy')}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-2">Client Information</h4>
                    <div className="space-y-2">
                      <p><span className="font-medium">Name:</span> {selectedInvoice.client.name}</p>
                      <p><span className="font-medium">Email:</span> {selectedInvoice.client.email}</p>
                      <p><span className="font-medium">Phone:</span> {selectedInvoice.client.phone}</p>
                      <p><span className="font-medium">Organization:</span> {selectedInvoice.client.organization}</p>
                    </div>
                  </div>
                </div>

                {/* Invoice Items */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-2">Invoice Items</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedInvoice.items.map((item, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2 text-sm text-gray-900">{item.description}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">{item.quantity}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">£{item.unitPrice.toFixed(2)}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">£{item.total.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Totals */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Subtotal</label>
                    <p className="text-lg font-bold text-gray-900">£{selectedInvoice.subtotal.toFixed(2)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tax ({selectedInvoice.taxRate}%)</label>
                    <p className="text-lg font-bold text-gray-900">£{selectedInvoice.taxAmount.toFixed(2)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Total</label>
                    <p className="text-lg font-bold text-blue-600">£{selectedInvoice.total.toFixed(2)}</p>
                  </div>
                </div>

                {selectedInvoice.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Notes</label>
                    <p className="text-sm text-gray-900">{selectedInvoice.notes}</p>
                  </div>
                )}

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;
