import api from './api';

// Get all contract templates
export const getContractTemplates = async () => {
  try {
    const response = await api.get('/contract-templates');
    return response.data;
  } catch (error) {
    console.error('Error fetching contract templates:', error);
    throw error;
  }
};

// Get a single contract template
export const getContractTemplate = async (id) => {
  try {
    const response = await api.get(`/contract-templates/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching contract template:', error);
    throw error;
  }
};

// Create a new contract template
export const createContractTemplate = async (templateData) => {
  try {
    const response = await api.post('/contract-templates', templateData);
    return response.data;
  } catch (error) {
    console.error('Error creating contract template:', error);
    throw error;
  }
};

// Update a contract template
export const updateContractTemplate = async (id, templateData) => {
  try {
    const response = await api.put(`/contract-templates/${id}`, templateData);
    return response.data;
  } catch (error) {
    console.error('Error updating contract template:', error);
    throw error;
  }
};

// Delete a contract template
export const deleteContractTemplate = async (id) => {
  try {
    const response = await api.delete(`/contract-templates/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting contract template:', error);
    throw error;
  }
};