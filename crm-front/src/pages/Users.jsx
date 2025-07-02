import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUsers, createUser, updateUser, deleteUser } from '../services/users';

const roles = [
  { label: 'Admin', value: 'admin' },
  { label: 'Staff', value: 'staff' },
  { label: 'Caseworker', value: 'caseworker' },
  { label: 'Freelancer', value: 'freelancer' },
];

export default function Users() {
  const { user } = useAuth();
  console.log('Current user:', user);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ email: '', role: roles[0].value, name: '', password: '' });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      setError('Failed to load users');
    }
    setLoading(false);
  }

  if (user?.user.role !== 'admin') {
    return <div className="p-8 text-center text-red-600 font-bold">Access denied. Admins only.</div>;
  }

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.email) return;
    setError(null);
    try {
      const payload = { ...form };
      if (!editId && !form.password) {
        setError('Password is required for new users');
        return;
      }
      if (editId && !form.password) {
        delete payload.password; // Don't send password if not changing
      }
      if (editId) {
        await updateUser(editId, payload);
      } else {
        await createUser(payload);
      }
      setForm({ email: '', role: roles[0].value, name: '', password: '' });
      setShowForm(false);
      setEditId(null);
      fetchUsers();
    } catch (err) {
      setError('Failed to save user');
    }
  }

  function handleEdit(user) {
    setForm({ email: user.email, role: user.role, name: user.name || '', password: '' });
    setEditId(user._id);
    setShowForm(true);
  }

  async function handleDelete(_id) {
    setError(null);
    try {
      await deleteUser(_id);
      fetchUsers();
    } catch (err) {
      setError('Failed to delete user');
    }
  }

  function handleCloseForm() {
    setShowForm(false);
    setForm({ email: '', role: roles[0].value, name: '', password: '' });
    setEditId(null);
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      <button
        className="mb-4 px-4 py-2 rounded bg-[#2EAB2C] text-white font-semibold hover:bg-green-800"
        onClick={() => { setShowForm(true); setForm({ email: '', role: roles[0].value, name: '', password: '' }); setEditId(null); }}
      >
        Add User
      </button>
      {error && <div className="mb-4 text-red-600">{error}</div>}
      <table className="w-full text-left bg-white rounded shadow mb-6">
        <thead>
          <tr className="bg-green-50">
            <th className="py-2 px-4">Email</th>
            <th className="py-2 px-4">Role</th>
            <th className="py-2 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={3} className="text-center py-4">Loading...</td></tr>
          ) : users.map(u => (
            <tr key={u._id} className="border-t">
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
                      onClick={() => handleDelete(u._id)}
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
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={form.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded"
                required
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
              <input
                type="password"
                name="password"
                placeholder={editId ? "Leave blank to keep current password" : "Password"}
                value={form.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded"
                required={!editId}
              />
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