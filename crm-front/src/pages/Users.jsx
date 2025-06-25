import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const mockInitialUsers = [
  { id: 1, email: 'admin@crm.com', role: 'admin' },
  { id: 2, email: 'caseworker@crm.com', role: 'caseworker' },
  { id: 3, email: 'freelancer@crm.com', role: 'freelancer' },
];

const roles = [
  { label: 'Admin', value: 'admin' },
  { label: 'Staff', value: 'staff' },
  { label: 'Caseworker', value: 'caseworker' },
  { label: 'Freelancer', value: 'freelancer' },
];

export default function Users() {
  const { user } = useAuth();
  const [users, setUsers] = useState(mockInitialUsers);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ email: '', role: roles[0].value });
  const [editId, setEditId] = useState(null);

  if (user?.role !== 'admin') {
    return <div className="p-8 text-center text-red-600 font-bold">Access denied. Admins only.</div>;
  }

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.email) return;
    if (editId) {
      setUsers(prev => prev.map(u => u.id === editId ? { ...u, ...form } : u));
    } else {
      setUsers(prev => [
        ...prev,
        { id: Date.now(), email: form.email, role: form.role }
      ]);
    }
    setForm({ email: '', role: roles[0].value });
    setShowForm(false);
    setEditId(null);
  }

  function handleEdit(user) {
    setForm({ email: user.email, role: user.role });
    setEditId(user.id);
    setShowForm(true);
  }

  function handleDelete(id) {
    setUsers(prev => prev.filter(u => u.id !== id));
  }

  function handleCloseForm() {
    setShowForm(false);
    setForm({ email: '', role: roles[0].value });
    setEditId(null);
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      <button
        className="mb-4 px-4 py-2 rounded bg-[#2EAB2C] text-white font-semibold hover:bg-green-800"
        onClick={() => { setShowForm(true); setForm({ email: '', role: roles[0].value }); setEditId(null); }}
      >
        Add User
      </button>
      <table className="w-full text-left bg-white rounded shadow mb-6">
        <thead>
          <tr className="bg-green-50">
            <th className="py-2 px-4">Email</th>
            <th className="py-2 px-4">Role</th>
            <th className="py-2 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} className="border-t">
              <td className="py-2 px-4 font-semibold">{u.email}</td>
              <td className="py-2 px-4 capitalize">{u.role}</td>
              <td className="py-2 px-4">
                {u.role !== 'admin' && u.email !== user.email && (
                  <>
                    <button
                      className="mr-2 px-3 py-1 rounded bg-blue-100 text-blue-700 font-semibold hover:bg-blue-200"
                      onClick={() => handleEdit(u)}
                    >
                      Edit
                    </button>
                    <button
                      className="px-3 py-1 rounded bg-red-100 text-red-700 font-semibold hover:bg-red-200"
                      onClick={() => handleDelete(u.id)}
                    >
                      Delete
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow p-6 w-full max-w-sm relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl"
              onClick={handleCloseForm}
            >
              &times;
            </button>
            <h2 className="text-lg font-bold mb-4">{editId ? 'Edit User' : 'Add New User'}</h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded"
                required
                disabled={!!editId}
              />
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded"
              >
                {roles.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
              <button
                type="submit"
                className="w-full bg-[#2EAB2C] text-white py-2 rounded hover:bg-green-800 font-semibold"
              >
                {editId ? 'Save Changes' : 'Add User'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 