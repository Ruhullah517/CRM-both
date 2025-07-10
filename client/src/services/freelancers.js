import api from './api';

function buildFreelancerFormData(freelancer) {
  const formData = new FormData();
  for (const key in freelancer) {
    if (freelancer[key] === undefined || freelancer[key] === null) continue;
    if (key === 'dbsCertificateFile' && freelancer.dbsCertificateFile) {
      formData.append('dbsCertificateFile', freelancer.dbsCertificateFile);
    } else if (key === 'cvFile' && freelancer.cvFile) {
      formData.append('cvFile', freelancer.cvFile);
    } else if (Array.isArray(freelancer[key])) {
      // Send arrays as JSON strings
      formData.append(key, JSON.stringify(freelancer[key]));
    } else if (typeof freelancer[key] === 'boolean') {
      formData.append(key, freelancer[key] ? 'true' : 'false');
    } else {
      formData.append(key, freelancer[key]);
    }
  }
  return formData;
}

export async function getFreelancers() {
  const res = await api.get('/freelancers');
  return res.data;
}

export async function getFreelancer(id) {
  const res = await api.get(`/freelancers/${id}`);
  return res.data;
}

export async function createFreelancer(freelancer) {
  const formData = buildFreelancerFormData(freelancer);
  const res = await api.post('/freelancers', formData);
  return res.data;
}

export async function updateFreelancer(id, freelancer) {
  const formData = buildFreelancerFormData(freelancer);
  const res = await api.put(`/freelancers/${id}`, formData);
  return res.data;
}

export async function deleteFreelancer(id) {
  const res = await api.delete(`/freelancers/${id}`);
  return res.data;
} 