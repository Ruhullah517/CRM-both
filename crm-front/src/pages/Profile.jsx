import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const defaultAvatar = 'https://randomuser.me/api/portraits/lego/1.jpg';

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    name: user?.name || 'User Name',
    email: user?.email || '',
    role: user?.role || '',
    avatar: user?.avatar || defaultAvatar,
  });
  const [editMode, setEditMode] = useState(false);
  const [editProfile, setEditProfile] = useState(profile);
  const [avatarFile, setAvatarFile] = useState(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState(false);

  function handlePasswordChange(e) {
    e.preventDefault();
    setError('');
    setSuccess(false);
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    // Mocked: would call backend to change password
    setSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  }

  function handleEditProfileChange(e) {
    const { name, value, files } = e.target;
    if (name === 'avatar' && files && files[0]) {
      setAvatarFile(files[0]);
      // Mocked: preview avatar
      setEditProfile(p => ({ ...p, avatar: URL.createObjectURL(files[0]) }));
    } else {
      setEditProfile(p => ({ ...p, [name]: value }));
    }
  }

  function handleProfileSave(e) {
    e.preventDefault();
    setProfile(editProfile);
    setEditMode(false);
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 2000);
  }

  function handleProfileCancel() {
    setEditProfile(profile);
    setEditMode(false);
    setAvatarFile(null);
  }

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white rounded shadow p-8">
      <h1 className="text-2xl font-bold mb-6">User Profile</h1>
      <div className="flex items-center gap-6 mb-6">
        <img src={profile.avatar} alt="Avatar" className="w-20 h-20 rounded-full border-2 border-green-700 object-cover" />
        <div>
          <div className="text-xl font-semibold mb-1">{profile.name}</div>
          <div className="mb-1 text-gray-700">{profile.email}</div>
          <div className="capitalize bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold inline-block">{profile.role}</div>
        </div>
      </div>
      <button
        className="mb-4 bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 shadow"
        onClick={() => setEditMode(true)}
      >
        Edit Profile
      </button>
      {profileSuccess && <div className="text-green-700 text-sm mb-4">Profile updated successfully (mocked).</div>}
      <hr className="my-6" />
      <h2 className="text-lg font-semibold mb-4">Change Password</h2>
      <form className="space-y-4" onSubmit={handlePasswordChange}>
        <input
          type="password"
          placeholder="Current Password"
          className="w-full px-4 py-2 border rounded"
          value={currentPassword}
          onChange={e => setCurrentPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="New Password"
          className="w-full px-4 py-2 border rounded"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm New Password"
          className="w-full px-4 py-2 border rounded"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          required
        />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {success && <div className="text-green-700 text-sm">Password changed successfully (mocked).</div>}
        <button type="submit" className="w-full bg-green-700 text-white py-2 rounded hover:bg-green-800">Change Password</button>
      </form>
      {/* Edit Profile Modal */}
      {editMode && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-8 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-500 hover:bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center" onClick={handleProfileCancel}>✕</button>
            <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
            <form className="space-y-4" onSubmit={handleProfileSave}>
              <div className="flex flex-col items-center gap-2">
                <img src={editProfile.avatar} alt="Avatar Preview" className="w-20 h-20 rounded-full border-2 border-green-700 object-cover" />
                <input
                  type="file"
                  name="avatar"
                  accept="image/*"
                  className="mt-2"
                  onChange={handleEditProfileChange}
                />
              </div>
              <input
                name="name"
                value={editProfile.name}
                onChange={handleEditProfileChange}
                placeholder="Full Name"
                className="w-full px-4 py-2 border rounded"
                required
              />
              <input
                name="email"
                value={editProfile.email}
                onChange={handleEditProfileChange}
                placeholder="Email"
                className="w-full px-4 py-2 border rounded"
                required
                type="email"
              />
              <div className="flex gap-2 mt-4">
                <button type="submit" className="flex-1 bg-green-700 text-white py-2 rounded hover:bg-green-800 shadow">Save</button>
                <button type="button" className="flex-1 bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300 shadow" onClick={handleProfileCancel}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 