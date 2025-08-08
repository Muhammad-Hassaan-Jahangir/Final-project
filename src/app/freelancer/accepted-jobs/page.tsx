'use client';

import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
type Job = {
  userId: any;
  _id: string;
  title: string;
  description: string;
  budget: number;
  deadline: string;
  status: string;
  clientConfirmed?: boolean;
};

export default function AcceptedJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);
  const [showSubmissionModal, setShowSubmissionModal] = useState<string | null>(null);
  const [submissionData, setSubmissionData] = useState({ notes: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchAcceptedJobs = async () => {
      try {
        const res = await axios.get('/api/freelancer/accepted-jobs', {
          withCredentials: true,
        });
        setJobs(res.data.jobs || []);
      } catch (err) {
        setError('Failed to load accepted jobs');
      } finally {
        setLoading(false);
      }
    };

    fetchAcceptedJobs();
  }, []);

  const handleComplete = async (jobId: string) => {
    setUpdating(jobId);
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('completionNotes', submissionData.notes);
      
      if (selectedFile) {
        formData.append('file', selectedFile);
      }
      
      await axios.put(`/api/freelancer/complete-job/${jobId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          setUploadProgress(percentCompleted);
        }
      });
      
      // Refresh the jobs list
      const res = await axios.get('/api/freelancer/accepted-jobs');
      setJobs(res.data.jobs);
      setShowSubmissionModal(null);
      setSubmissionData({ notes: '' });
      setSelectedFile(null);
      setUploadProgress(0);
      alert('Job marked as completed!');
    } catch (err) {
      alert('Failed to complete job');
    } finally {
      setUpdating(null);
      setUploading(false);
    }
  };

  const openSubmissionModal = (jobId: string) => {
    setShowSubmissionModal(jobId);
  };

  const closeSubmissionModal = () => {
    setShowSubmissionModal(null);
    setSubmissionData({ notes: '' });
    setSelectedFile(null);
    setUploadProgress(0);
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };
  
  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };


  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-blue-700 border-b pb-3">Your Accepted Jobs</h1>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {jobs.length === 0 ? (
        <p className="text-gray-700">You haven't been assigned any jobs yet.</p>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job._id} className="border p-6 rounded-lg shadow-md bg-white hover:shadow-lg transition-shadow duration-300">
              <h2 className="text-xl font-semibold mb-2 text-blue-700">{job.title}</h2>
              <p className="text-gray-700 mb-4">{job.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <span className="text-blue-700">💰</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Budget</p>
                    <p className="font-semibold">${job.budget}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <span className="text-blue-700">📅</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Deadline</p>
                    <p className="font-semibold">{new Date(job.deadline).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <span className="text-blue-700">📌</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <p className="font-semibold capitalize">{job.status}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 mt-4">
                {job.userId && (
                  <Link href={`/chat/${job.userId._id}`} className="flex-1">
                    <button className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 w-full justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                      </svg>
                      Chat
                    </button>
                  </Link>
                )}

                {job.status === 'in_progress' && (
                  <button
                    onClick={() => openSubmissionModal(job._id)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    Submit Work
                  </button>
                )}
                {job.status === 'completed' && (
                  <div className="flex flex-col gap-2">
                    <span className="text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full inline-flex items-center gap-1 w-fit">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Completed
                    </span>
                    {job.clientConfirmed ? (
                      <span className="text-blue-600 font-medium bg-blue-50 px-3 py-1 rounded-full inline-flex items-center gap-1 w-fit">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Confirmed by Client
                      </span>
                    ) : (
                      <span className="text-yellow-600 font-medium bg-yellow-50 px-3 py-1 rounded-full inline-flex items-center gap-1 w-fit">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        Awaiting Client Confirmation
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submission Modal */}
      {showSubmissionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-xl max-w-md w-full mx-4 shadow-2xl border border-gray-100">
            <h3 className="text-2xl font-bold mb-6 text-center text-blue-700 border-b pb-4">Submit Your Work</h3>
            
            <div className="space-y-8">
              {/* File Upload Section */}
              <div className="border-2 border-dashed border-blue-300 rounded-xl p-6 bg-blue-50 transition-all duration-300 hover:border-blue-500">
                <label className="block text-sm font-semibold mb-3 text-blue-800 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Upload Your Work
                </label>
                
                {!selectedFile ? (
                  <div className="text-center">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                    />
                    <label 
                      htmlFor="file-upload"
                      className="cursor-pointer inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg transition-all duration-200 w-full shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      <span>Choose File to Upload</span>
                    </label>
                    <p className="mt-3 text-xs text-gray-600">Supported formats: PDF, ZIP, RAR, images, and documents</p>
                  </div>
                ) : (
                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <svg xmlns="http://www.w3.org/2000/svg" className="text-blue-600 h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                            <polyline points="10 9 9 9 8 9" />
                          </svg>
                        </div>
                        <div className="truncate">
                          <p className="font-medium truncate text-gray-800">{selectedFile.name}</p>
                          <p className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <button 
                        onClick={removeSelectedFile}
                        className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition-colors duration-200"
                        title="Remove file"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Upload Progress Bar */}
                {uploading && uploadProgress > 0 && (
                  <div className="mt-4">
                    <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-1">
                      <p className="text-xs text-gray-600">{uploadProgress}% Uploaded</p>
                      <p className="text-xs text-gray-600">{uploadProgress < 100 ? 'Uploading...' : 'Complete!'}</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Completion Notes */}
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                <label className="block text-sm font-semibold mb-3 text-blue-800 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                  Completion Notes
                </label>
                <textarea
                  value={submissionData.notes}
                  onChange={(e) => setSubmissionData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Describe what you've completed, any notes for the client..."
                  rows={4}
                  className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 bg-white shadow-sm"
                />
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-4 mt-8">
              <button
                onClick={() => handleComplete(showSubmissionModal)}
                disabled={updating === showSubmissionModal}
                className={`flex-1 flex items-center justify-center gap-2 ${
                  updating === showSubmissionModal 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700'
                } text-white py-3.5 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5`}
              >
                {updating === showSubmissionModal ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Submit & Mark Complete
                  </>
                )}
              </button>
              
              <button
                onClick={closeSubmissionModal}
                disabled={updating === showSubmissionModal}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3.5 rounded-lg font-semibold transition-all duration-200 border border-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}    
    </div>
  );
}
