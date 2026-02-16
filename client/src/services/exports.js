import api from './api';

async function download(path, filename) {
  const res = await api.get(path, { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export const exportContacts = () => download('/exports/contacts', 'contacts.csv');
export const exportEnquiries = () => download('/exports/enquiries', 'enquiries.csv');
export const exportTrainingEvents = () => download('/exports/training-events', 'training-events.csv');
export const exportTrainingBookings = (eventId) => {
  const query = eventId ? `?eventId=${encodeURIComponent(eventId)}` : '';
  return download(`/exports/training-bookings${query}`, 'training-bookings.csv');
};
export const exportPaymentHistory = () => download('/exports/payment-history', 'payment-history.csv');

// Reports / analytics exports (CSV, Excel-friendly)
export const exportFreelancerWork = (month) => {
  const query = month ? `?month=${encodeURIComponent(month)}` : '';
  return download(`/reports/export/freelancer-work${query}`, `freelancer-work${month ? '-' + month : ''}.csv`);
};

export const exportFreelancerWorkPdf = (month) => {
  const params = [];
  if (month) params.push(`month=${encodeURIComponent(month)}`);
  params.push('format=pdf');
  const query = params.length ? `?${params.join('&')}` : '';
  return download(`/reports/export/freelancer-work${query}`, `freelancer-work${month ? '-' + month : ''}.pdf`);
};

export const exportRecruitmentPipeline = () =>
  download('/reports/export/recruitment-pipeline', 'recruitment-pipeline.csv');

export const exportRecruitmentPipelinePdf = () =>
  download('/reports/export/recruitment-pipeline?format=pdf', 'recruitment-pipeline.pdf');

export const exportInvoiceRevenue = () =>
  download('/reports/export/invoice-revenue', 'invoice-revenue.csv');

export const exportInvoiceRevenuePdf = () =>
  download('/reports/export/invoice-revenue?format=pdf', 'invoice-revenue.pdf');

export const exportTrainingAnalytics = () =>
  download('/reports/export/training-events-analytics', 'training-events-analytics.csv');

export const exportTrainingAnalyticsPdf = () =>
  download('/reports/export/training-events-analytics?format=pdf', 'training-events-analytics.pdf');

export const exportMentorAnalytics = () =>
  download('/reports/export/mentors', 'mentor-analytics.csv');

export const exportMentorAnalyticsPdf = () =>
  download('/reports/export/mentors?format=pdf', 'mentor-analytics.pdf');

export const exportCasesAnalytics = () =>
  download('/reports/export/cases-analytics', 'cases-analytics.csv');

export const exportCasesAnalyticsPdf = () =>
  download('/reports/export/cases-analytics?format=pdf', 'cases-analytics.pdf');

