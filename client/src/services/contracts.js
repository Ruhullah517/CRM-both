import api from './api';

// Get all contracts
export const getContracts = async () => {
  try {
    const response = await api.get('/contracts');
    return response.data;
  } catch (error) {
    console.error('Error fetching contracts:', error);
    throw error;
  }
};

// Get a single contract
export const getContract = async (id) => {
  try {
    const response = await api.get(`/contracts/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching contract:', error);
    throw error;
  }
};

// Generate a new contract
export const generateContract = async (contractData) => {
  try {
    const response = await api.post('/contracts/generate', contractData);
    return response.data;
  } catch (error) {
    console.error('Error generating contract:', error);
    throw error;
  }
};

// Download contract PDF
export const downloadContract = async (id) => {
  try {
    const response = await api.get(`/contracts/${id}/download`, {
      responseType: 'blob'
    });
    
    // Create blob URL and trigger download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `contract_${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return response.data;
  } catch (error) {
    console.error('Error downloading contract:', error);
    throw error;
  }
};

// Get contract status
export const getContractStatus = async (id) => {
  try {
    const response = await api.get(`/contracts/${id}/status`);
    return response.data;
  } catch (error) {
    console.error('Error fetching contract status:', error);
    throw error;
  }
};

// Delete a contract
export const deleteContract = async (id) => {
  try {
    const response = await api.delete(`/contracts/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting contract:', error);
    throw error;
  }
};