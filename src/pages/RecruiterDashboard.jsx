import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import JobForm from '../components/JobForm';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const RecruiterDashboard = () => {
  // State declarations at the top
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({ totalJobs: 0, activeJobs: 0, applications: 0 });

  // Hooks at the top level
  const { getToken } = useAuth();

  // Memoized callbacks
  const fetchData = useCallback(async () => {
    try {
      console.log('Fetching dashboard data...');
      const token = await getToken();
      console.log('Token obtained:', !!token);
      
      if (!token) {
        throw new Error('No authentication token available');
      }
      
      const headers = { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      console.log('Fetching jobs from:', '/api/v1/jobs/recruiter/me');
      const jobsRes = await fetch('/api/v1/jobs/recruiter/me', { headers });
      console.log('Jobs response status:', jobsRes.status);
      
      if (!jobsRes.ok) {
        const errorText = await jobsRes.text();
        console.error('Jobs API error:', jobsRes.status, errorText);
        throw new Error(`Failed to fetch jobs: ${jobsRes.status} ${jobsRes.statusText}`);
      }
      
      console.log('Fetching applications from:', '/api/v1/applications/recruiter');
      const applicationsRes = await fetch('/api/v1/applications/recruiter', { headers });
      console.log('Applications response status:', applicationsRes.status);
      
      if (!applicationsRes.ok) {
        const errorText = await applicationsRes.text();
        console.error('Applications API error:', applicationsRes.status, errorText);
        throw new Error(`Failed to fetch applications: ${applicationsRes.status} ${applicationsRes.statusText}`);
      }
      
      const [jobsData, applicationsData] = await Promise.all([
        jobsRes.json(),
        applicationsRes.json()
      ]);
      
      console.log('Jobs data received:', jobsData.length, 'jobs');
      console.log('Applications data received:', applicationsData.length, 'applications');
      
      setJobs(jobsData);
      setApplications(applicationsData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error.message || 'Failed to fetch dashboard data');
      toast.error(error.message || 'Failed to fetch dashboard data');
      // Set empty arrays to prevent undefined errors
      setJobs([]);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  const handleJobCreated = useCallback((job, action) => {
    if (action === 'created') {
      setJobs(prevJobs => [job, ...prevJobs]);
    } else if (action === 'updated') {
      setJobs(prevJobs => prevJobs.map(j => j._id === job._id ? job : j));
    }
    setShowJobForm(false);
    setEditingJob(null);
    toast.success(`Job ${action} successfully`);
  }, []);

  const handleDeleteJob = useCallback(async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    
    try {
      const token = await getToken();
      const response = await fetch(`/api/v1/jobs/${jobId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete job');
      }
      
      setJobs(prevJobs => prevJobs.filter(job => job._id !== jobId));
      toast.success('Job deleted successfully');
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error(error.message || 'Failed to delete job');
    }
  }, [getToken]);

  const handleToggleVisibility = useCallback(async (jobId, currentVisibility) => {
    try {
      const token = await getToken();
      const response = await fetch(`/api/v1/jobs/${jobId}/visibility`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isVisible: !currentVisibility })
      });

      if (!response.ok) {
        throw new Error('Failed to update job visibility');
      }
      
      const updatedJob = await response.json();
      setJobs(prevJobs => 
        prevJobs.map(job => job._id === updatedJob._id ? updatedJob : job)
      );
      toast.success(`Job ${updatedJob.isVisible ? 'published' : 'hidden'} successfully`);
    } catch (error) {
      console.error('Error toggling job visibility:', error);
      toast.error(error.message || 'Failed to update job visibility');
    }
  }, [getToken]);

  // Effects after all callbacks
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load dashboard</h3>
          <p className="text-sm text-gray-500 mb-6">{error}</p>
          <div className="space-x-4">
            <button
              onClick={() => {
                setError(null);
                setLoading(true);
                fetchData();
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Try Again
            </button>
            <button
              onClick={() => {
                setEditingJob(null);
                setShowJobForm(true);
              }}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Post New Job
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Recruiter Dashboard</h1>
        <button
          onClick={() => {
            setEditingJob(null);
            setShowJobForm(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Post New Job
        </button>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="mt-2 text-lg font-medium text-gray-900">No jobs posted yet</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by posting a new job.</p>
          <div className="mt-6">
            <button
              onClick={() => setShowJobForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Post Your First Job
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <ul className="divide-y divide-gray-200">
            {jobs.map((job) => (
              <li key={job._id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-blue-600 truncate">{job.title}</p>
                    <p className="mt-1 flex items-center text-sm text-gray-500">
                      {job.company?.name || 'No company'}
                      <span className="mx-2">•</span>
                      {job.location}
                    </p>
                  </div>
                  <div className="ml-4 flex-shrink-0 flex space-x-2">
                    <button
                      onClick={() => handleToggleVisibility(job._id, job.isVisible)}
                      className={`px-3 py-1 rounded-md text-xs font-medium ${
                        job.isVisible 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {job.isVisible ? 'Visible' : 'Hidden'}
                    </button>
                    <button
                      onClick={() => {
                        setEditingJob(job);
                        setShowJobForm(true);
                      }}
                      className="p-1 text-gray-400 hover:text-blue-600 focus:outline-none"
                    >
                      <PencilIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                    <button
                      onClick={() => handleDeleteJob(job._id)}
                      className="p-1 text-gray-400 hover:text-red-600 focus:outline-none"
                    >
                      <TrashIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      {job.category}
                    </p>
                    <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                      {job.level.charAt(0).toUpperCase() + job.level.slice(1)} Level
                    </p>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    <p>
                      ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {showJobForm && (
        <JobForm
          isOpen={showJobForm}
          onClose={() => {
            setShowJobForm(false);
            setEditingJob(null);
          }}
          onSuccess={handleJobCreated}
          job={editingJob}
        />
      )}
    </div>
  );
};

export default RecruiterDashboard;
