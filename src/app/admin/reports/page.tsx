'use client';

import { useState, useEffect } from 'react';

type Report = {
  id: string;
  title: string;
  type: 'user' | 'job' | 'revenue';
  date: string;
  data: any;
};

// Sample report data (in a real app, this would come from an API)
const sampleReports: Report[] = [
  {
    id: '1',
    title: 'New User Registrations',
    type: 'user',
    date: '2023-05-01',
    data: { total: 120, freelancers: 80, clients: 40 }
  },
  {
    id: '2',
    title: 'Job Completion Rate',
    type: 'job',
    date: '2023-05-01',
    data: { posted: 85, completed: 62, rate: '72.9%' }
  },
  {
    id: '3',
    title: 'Monthly Revenue',
    type: 'revenue',
    date: '2023-05-01',
    data: { total: '$5,240', fees: '$1,048', growth: '+12%' }
  },
  {
    id: '4',
    title: 'User Activity',
    type: 'user',
    date: '2023-04-01',
    data: { active: 450, inactive: 120, new: 75 }
  },
  {
    id: '5',
    title: 'Job Categories',
    type: 'job',
    date: '2023-04-01',
    data: { web: 45, mobile: 30, design: 25, other: 15 }
  },
];

export default function AdminReportsPage() {
  const [selectedReport, setSelectedReport] = useState('users');
  const [reports, setReports] = useState<Report[]>([]);
  const [viewReport, setViewReport] = useState<Report | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);

  useEffect(() => {
    // Filter reports based on selected type
    const filteredReports = sampleReports.filter(report => {
      if (selectedReport === 'users') return report.type === 'user';
      if (selectedReport === 'jobs') return report.type === 'job';
      if (selectedReport === 'revenue') return report.type === 'revenue';
      return false;
    });
    
    setReports(filteredReports);
  }, [selectedReport]);

  const handleView = (report: Report) => {
    setViewReport(report);
  };

  const handleDelete = (id: string) => {
    // In a real app, you would call an API to delete the report
    setReports(reports.filter(report => report.id !== id));
    setDeleteConfirmation(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Reports</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex space-x-4 mb-6">
          <button
            className={`px-4 py-2 rounded-md ${selectedReport === 'users' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-800'}`}
            onClick={() => setSelectedReport('users')}
          >
            User Reports
          </button>
          <button
            className={`px-4 py-2 rounded-md ${selectedReport === 'jobs' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-800'}`}
            onClick={() => setSelectedReport('jobs')}
          >
            Job Reports
          </button>
          <button
            className={`px-4 py-2 rounded-md ${selectedReport === 'revenue' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-800'}`}
            onClick={() => setSelectedReport('revenue')}
          >
            Revenue Reports
          </button>
        </div>
        
        {reports.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reports.map((report) => (
                  <tr key={report.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{report.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{report.date}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => handleView(report)} 
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        View
                      </button>
                      <button 
                        onClick={() => setDeleteConfirmation(report.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-4 border rounded-md bg-gray-50">
            <p className="text-gray-500 text-center py-8">
              No {selectedReport} reports available.
            </p>
          </div>
        )}
      </div>

      {/* View Report Modal */}
      {viewReport && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">{viewReport.title}</h2>
                <button 
                  onClick={() => setViewReport(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">Report Type: {viewReport.type}</p>
                <p className="text-sm text-gray-500 mb-4">Date: {viewReport.date}</p>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Report Data</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  {Object.entries(viewReport.data).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b border-gray-200 last:border-0">
                      <span className="font-medium capitalize">{key}</span>
                      <span>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={() => setViewReport(null)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Deletion</h3>
              <p className="text-gray-500 mb-6">Are you sure you want to delete this report? This action cannot be undone.</p>
              
              <div className="flex justify-end">
                <button
                  onClick={() => setDeleteConfirmation(null)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirmation)}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}