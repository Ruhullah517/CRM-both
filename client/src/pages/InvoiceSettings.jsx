import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const InvoiceSettings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    companyName: '',
    addressLine1: '',
    addressLine2: '',
    addressLine3: '',
    email: '',
    website: '',
    bankAccountName: '',
    bankAccountNumber: '',
    bankSortCode: '',
    footerNote: ''
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get('/invoice-settings');
        setForm({
          companyName: data.companyName || '',
          addressLine1: data.addressLine1 || '',
          addressLine2: data.addressLine2 || '',
          addressLine3: data.addressLine3 || '',
          email: data.email || '',
          website: data.website || '',
          bankAccountName: data.bankAccountName || '',
          bankAccountNumber: data.bankAccountNumber || '',
          bankSortCode: data.bankSortCode || '',
          footerNote: data.footerNote || ''
        });
      } catch (error) {
        console.error('Error loading invoice settings:', error);
        alert('Error loading invoice settings');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/invoice-settings', form);
      alert('Invoice settings saved successfully.');
      navigate('/invoices');
    } catch (error) {
      console.error('Error saving invoice settings:', error);
      alert('Error saving invoice settings');
    } finally {
      setSaving(false);
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
    <div className="max-w-3xl mx-auto bg-white shadow rounded-lg p-4 md:p-6">
      <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
        Invoice Settings
      </h1>
      <p className="text-sm text-gray-600 mb-6">
        These details will appear on all invoices (PDF downloads and emails).
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h2 className="text-md font-semibold text-gray-900 mb-3">Company Details</h2>
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Company Name</label>
              <input
                type="text"
                name="companyName"
                value={form.companyName}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Address Line 1</label>
              <input
                type="text"
                name="addressLine1"
                value={form.addressLine1}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Address Line 2</label>
              <input
                type="text"
                name="addressLine2"
                value={form.addressLine2}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Address Line 3</label>
              <input
                type="text"
                name="addressLine3"
                value={form.addressLine3}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Website</label>
              <input
                type="text"
                name="website"
                value={form.website}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-md font-semibold text-gray-900 mb-3">Bank Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Account Name</label>
              <input
                type="text"
                name="bankAccountName"
                value={form.bankAccountName}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Account Number</label>
              <input
                type="text"
                name="bankAccountNumber"
                value={form.bankAccountNumber}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Sort Code</label>
              <input
                type="text"
                name="bankSortCode"
                value={form.bankSortCode}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-md font-semibold text-gray-900 mb-3">Footer</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700">Footer Note</label>
            <textarea
              name="footerNote"
              value={form.footerNote}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
              saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InvoiceSettings;


