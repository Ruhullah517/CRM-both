import React, { useState, useEffect } from 'react';
import { 
  AcademicCapIcon, 
  DocumentArrowDownIcon, 
  EnvelopeIcon,
  EyeIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import api from '../services/api';

const Certificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const response = await api.get('/training/certificates');
      setCertificates(response.data);
    } catch (error) {
      console.error('Error fetching certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadCertificate = async (certificateId) => {
    try {
      const response = await api.get(`/training/certificates/${certificateId}/download`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificate-${certificateId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading certificate:', error);
    }
  };

  const resendCertificateEmail = async (certificateId) => {
    try {
      await api.post(`/training/certificates/${certificateId}/resend-email`);
      alert('Certificate email sent successfully!');
      fetchCertificates(); // Refresh the list
    } catch (error) {
      console.error('Error resending certificate email:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'generated':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'sent':
        return <EnvelopeIcon className="h-5 w-5 text-blue-500" />;
      case 'downloaded':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'generated':
        return 'Generated';
      case 'sent':
        return 'Sent';
      case 'downloaded':
        return 'Downloaded';
      default:
        return 'Unknown';
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
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <AcademicCapIcon className="h-8 w-8 mr-3 text-blue-500" />
          Certificates
        </h1>
        <p className="text-gray-600 mt-2">
          Manage and download training completion certificates
        </p>
      </div>

      {certificates.length === 0 ? (
        <div className="text-center py-12">
          <AcademicCapIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No certificates found</h3>
          <p className="text-gray-500">
            Certificates will appear here once training participants complete their courses.
          </p>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Certificate Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completion Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {certificates.map((certificate) => (
                  <tr key={certificate._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {certificate.participant.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {certificate.participant.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {certificate.courseTitle}
                      </div>
                      <div className="text-sm text-gray-500">
                        Duration: {certificate.duration}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {certificate.certificateNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(certificate.completionDate), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(certificate.status)}
                        <span className="ml-2 text-sm text-gray-900">
                          {getStatusText(certificate.status)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => downloadCertificate(certificate._id)}
                          className="text-blue-600 hover:text-blue-900 flex items-center"
                        >
                          <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
                          Download
                        </button>
                        <button
                          onClick={() => resendCertificateEmail(certificate._id)}
                          className="text-green-600 hover:text-green-900 flex items-center"
                        >
                          <EnvelopeIcon className="h-4 w-4 mr-1" />
                          Resend
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCertificate(certificate);
                            setShowModal(true);
                          }}
                          className="text-gray-600 hover:text-gray-900 flex items-center"
                        >
                          <EyeIcon className="h-4 w-4 mr-1" />
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Certificate Details Modal */}
      {showModal && selectedCertificate && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Certificate Details
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Participant:</label>
                  <p className="text-sm text-gray-900">{selectedCertificate.participant.name}</p>
                  <p className="text-sm text-gray-500">{selectedCertificate.participant.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Course:</label>
                  <p className="text-sm text-gray-900">{selectedCertificate.courseTitle}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Certificate Number:</label>
                  <p className="text-sm text-gray-900">{selectedCertificate.certificateNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Completion Date:</label>
                  <p className="text-sm text-gray-900">
                    {format(new Date(selectedCertificate.completionDate), 'MMM dd, yyyy')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Duration:</label>
                  <p className="text-sm text-gray-900">{selectedCertificate.duration}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Status:</label>
                  <div className="flex items-center mt-1">
                    {getStatusIcon(selectedCertificate.status)}
                    <span className="ml-2 text-sm text-gray-900">
                      {getStatusText(selectedCertificate.status)}
                    </span>
                  </div>
                </div>
                {selectedCertificate.sentAt && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Sent At:</label>
                    <p className="text-sm text-gray-900">
                      {format(new Date(selectedCertificate.sentAt), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Certificates;
