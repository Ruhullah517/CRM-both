import api from './api';

export const getCasesStatus = (params = {}) => api.get('/reports/cases-status', { params }).then(r => r.data);
export const getCaseTypeDistribution = () => api.get('/reports/case-type-distribution').then(r => r.data);
export const getCaseloadByWorker = () => api.get('/reports/caseload-by-worker').then(r => r.data);
export const getTimeToResolution = (params = {}) => api.get('/reports/time-to-resolution', { params }).then(r => r.data);
export const getDemographics = () => api.get('/reports/demographics').then(r => r.data);
export const getTimeLogged = () => api.get('/reports/time-logged').then(r => r.data);
export const getInvoiceableHours = (params = {}) => api.get('/reports/invoiceable-hours', { params }).then(r => r.data);

// New analytics APIs
export const getFreelancerWorkReport = () => api.get('/reports/freelancer-work').then(r => r.data);
export const getContractStatusReport = () => api.get('/reports/contract-status').then(r => r.data);
export const getRecruitmentPipelineReport = () => api.get('/reports/recruitment-pipeline').then(r => r.data);
export const getInvoiceRevenueReport = () => api.get('/reports/invoice-revenue').then(r => r.data);
export const getTrainingEventsReport = () => api.get('/reports/training-events').then(r => r.data);

