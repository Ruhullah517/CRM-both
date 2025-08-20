import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';
import Loader from '../components/Loader';

const Trainers = () => {
  const [trainers, setTrainers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [formData, setFormData] = useState({
    userId: '',
    specialization: '',
    bio: '',
    experience: {
      years: 0,
      description: ''
    },
    qualifications: '',
    hourlyRate: 0,
    availability: {
      weekdays: true,
      weekends: false,
      evenings: true
    }
  });

  useEffect(() => {
    fetchTrainers();
    fetchUsers();
  }, []);

  const fetchTrainers = async () => {
    try {
      const response = await api.get('/trainers');
      setTrainers(response.data);
    } catch (error) {
      console.error('Error fetching trainers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...formData,
        specialization: formData.specialization.split(',').map(s => s.trim()),
        qualifications: formData.qualifications.split(',').map(q => q.trim())
      };

      if (showEditModal) {
        await api.put(`/trainers/${selectedTrainer._id}`, dataToSend);
      } else {
        await api.post('/trainers', dataToSend);
      }

      setShowAddModal(false);
      setShowEditModal(false);
      setSelectedTrainer(null);
      setFormData({
        userId: '',
        specialization: '',
        bio: '',
        experience: { years: 0, description: '' },
        qualifications: '',
        hourlyRate: 0,
        availability: { weekdays: true, weekends: false, evenings: true }
      });
      fetchTrainers();
    } catch (error) {
      console.error('Error saving trainer:', error);
      alert('Error saving trainer');
    }
  };

  const handleEdit = (trainer) => {
    setSelectedTrainer(trainer);
    setFormData({
      userId: trainer.user._id,
      specialization: trainer.specialization.join(', '),
      bio: trainer.bio || '',
      experience: trainer.experience || { years: 0, description: '' },
      qualifications: trainer.qualifications.join(', '),
      hourlyRate: trainer.hourlyRate || 0,
      availability: trainer.availability || { weekdays: true, weekends: false, evenings: true }
    });
    setShowEditModal(true);
  };

  const handleDelete = async (trainerId) => {
    if (window.confirm('Are you sure you want to deactivate this trainer?')) {
      try {
        await api.delete(`/trainers/${trainerId}`);
        fetchTrainers();
      } catch (error) {
        console.error('Error deleting trainer:', error);
        alert('Error deleting trainer');
      }
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Trainers</h1>
        <Button onClick={() => setShowAddModal(true)}>
          Add Trainer
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trainers.map((trainer) => (
          <Card key={trainer._id} className="p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {trainer.user.name.charAt(0).toUpperCase()}
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold">{trainer.user.name}</h3>
                <p className="text-gray-600">{trainer.user.email}</p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Specialization:</strong> {trainer.specialization.join(', ')}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Experience:</strong> {trainer.experience?.years || 0} years
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Hourly Rate:</strong> £{trainer.hourlyRate || 0}
              </p>
              {trainer.bio && (
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Bio:</strong> {trainer.bio.substring(0, 100)}...
                </p>
              )}
            </div>

            <div className="flex space-x-2">
              <Button 
                onClick={() => handleEdit(trainer)}
                className="flex-1 bg-blue-500 hover:bg-blue-600"
              >
                Edit
              </Button>
              <Button 
                onClick={() => handleDelete(trainer._id)}
                className="flex-1 bg-red-500 hover:bg-red-600"
              >
                Deactivate
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Trainer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Add Trainer</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">User</label>
                <select
                  value={formData.userId}
                  onChange={(e) => setFormData({...formData, userId: e.target.value})}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Select a user</option>
                  {users.map(user => (
                    <option key={user._id} value={user._id}>{user.name} ({user.email})</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Specialization (comma-separated)</label>
                <input
                  type="text"
                  value={formData.specialization}
                  onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                  className="w-full p-2 border rounded"
                  placeholder="e.g., Leadership, Communication, Technical Skills"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  className="w-full p-2 border rounded"
                  rows="3"
                  placeholder="Brief description of the trainer..."
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Years of Experience</label>
                <input
                  type="number"
                  value={formData.experience.years}
                  onChange={(e) => setFormData({
                    ...formData, 
                    experience: {...formData.experience, years: parseInt(e.target.value)}
                  })}
                  className="w-full p-2 border rounded"
                  min="0"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Experience Description</label>
                <textarea
                  value={formData.experience.description}
                  onChange={(e) => setFormData({
                    ...formData, 
                    experience: {...formData.experience, description: e.target.value}
                  })}
                  className="w-full p-2 border rounded"
                  rows="2"
                  placeholder="Describe their experience..."
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Qualifications (comma-separated)</label>
                <input
                  type="text"
                  value={formData.qualifications}
                  onChange={(e) => setFormData({...formData, qualifications: e.target.value})}
                  className="w-full p-2 border rounded"
                  placeholder="e.g., Certified Trainer, MBA, PhD"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Hourly Rate (£)</label>
                <input
                  type="number"
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData({...formData, hourlyRate: parseFloat(e.target.value)})}
                  className="w-full p-2 border rounded"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Availability</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.availability.weekdays}
                      onChange={(e) => setFormData({
                        ...formData, 
                        availability: {...formData.availability, weekdays: e.target.checked}
                      })}
                      className="mr-2"
                    />
                    Weekdays
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.availability.weekends}
                      onChange={(e) => setFormData({
                        ...formData, 
                        availability: {...formData.availability, weekends: e.target.checked}
                      })}
                      className="mr-2"
                    />
                    Weekends
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.availability.evenings}
                      onChange={(e) => setFormData({
                        ...formData, 
                        availability: {...formData.availability, evenings: e.target.checked}
                      })}
                      className="mr-2"
                    />
                    Evenings
                  </label>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button type="submit" className="flex-1">
                  Add Trainer
                </Button>
                <Button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Trainer Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Edit Trainer</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">User</label>
                <select
                  value={formData.userId}
                  onChange={(e) => setFormData({...formData, userId: e.target.value})}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Select a user</option>
                  {users.map(user => (
                    <option key={user._id} value={user._id}>{user.name} ({user.email})</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Specialization (comma-separated)</label>
                <input
                  type="text"
                  value={formData.specialization}
                  onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                  className="w-full p-2 border rounded"
                  placeholder="e.g., Leadership, Communication, Technical Skills"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  className="w-full p-2 border rounded"
                  rows="3"
                  placeholder="Brief description of the trainer..."
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Years of Experience</label>
                <input
                  type="number"
                  value={formData.experience.years}
                  onChange={(e) => setFormData({
                    ...formData, 
                    experience: {...formData.experience, years: parseInt(e.target.value)}
                  })}
                  className="w-full p-2 border rounded"
                  min="0"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Experience Description</label>
                <textarea
                  value={formData.experience.description}
                  onChange={(e) => setFormData({
                    ...formData, 
                    experience: {...formData.experience, description: e.target.value}
                  })}
                  className="w-full p-2 border rounded"
                  rows="2"
                  placeholder="Describe their experience..."
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Qualifications (comma-separated)</label>
                <input
                  type="text"
                  value={formData.qualifications}
                  onChange={(e) => setFormData({...formData, qualifications: e.target.value})}
                  className="w-full p-2 border rounded"
                  placeholder="e.g., Certified Trainer, MBA, PhD"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Hourly Rate (£)</label>
                <input
                  type="number"
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData({...formData, hourlyRate: parseFloat(e.target.value)})}
                  className="w-full p-2 border rounded"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Availability</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.availability.weekdays}
                      onChange={(e) => setFormData({
                        ...formData, 
                        availability: {...formData.availability, weekdays: e.target.checked}
                      })}
                      className="mr-2"
                    />
                    Weekdays
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.availability.weekends}
                      onChange={(e) => setFormData({
                        ...formData, 
                        availability: {...formData.availability, weekends: e.target.checked}
                      })}
                      className="mr-2"
                    />
                    Weekends
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.availability.evenings}
                      onChange={(e) => setFormData({
                        ...formData, 
                        availability: {...formData.availability, evenings: e.target.checked}
                      })}
                      className="mr-2"
                    />
                    Evenings
                  </label>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button type="submit" className="flex-1">
                  Update Trainer
                </Button>
                <Button 
                  type="button" 
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Trainers;
