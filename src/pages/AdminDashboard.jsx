import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import {
  UsersIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
  CogIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import JobForm from '../components/JobForm';
import CompanyForm from '../components/CompanyForm';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalJobs: 0,
    totalCompanies: 0,
    totalApplications: 0,
    usersByRole: {},
    jobsByCategory: {}
  });
  const [jobs, setJobs] = useState([]);
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getToken();
        const [metricsRes, jobsRes, usersRes, companiesRes] = await Promise.all([
          fetch('/api/v1/admin/metrics', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/v1/admin/jobs', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/v1/admin/users', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/v1/admin/companies', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        
        if (metricsRes.ok) setMetrics(await metricsRes.json());
        if (jobsRes.ok) setJobs(await jobsRes.json());
        if (usersRes.ok) setUsers(await usersRes.json());
        if (companiesRes.ok) setCompanies(await companiesRes.json());
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const handleToggleJobVisibility = async (jobId, currentVisibility) => {
    try {
      const token = await getToken();
      const response = await fetch(`/api/v1/admin/jobs/${jobId}/visibility`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        setJobs(prev => prev.map(job => 
          job._id === jobId ? { ...job, isVisible: !currentVisibility } : job
        ));
        toast.success(`Job ${!currentVisibility ? 'activated' : 'deactivated'} successfully!`);
      }
    } catch (error) {
      console.error('Error toggling job visibility:', error);
      toast.error('Failed to toggle job visibility');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    
    try {
      const token = await getToken();
      const response = await fetch(`/api/v1/admin/jobs/${jobId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        setJobs(prev => prev.filter(job => job._id !== jobId));
        toast.success('Job deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error('Failed to delete job');
    }
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      const token = await getToken();
      const response = await fetch(`/api/v1/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });
      
      if (response.ok) {
        setUsers(prev => prev.map(user => 
          user._id === userId ? { ...user, role: newRole } : user
        ));
        toast.success('User role updated successfully!');
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    }
  };

  const handleEditJob = (job) => {
    setEditingJob(job);
    setShowJobForm(true);
  };

  const handleJobSuccess = (job, action) => {
    if (action === 'created') {
      setJobs(prev => [job, ...prev]);
      toast.success('Job created successfully!');
    } else if (action === 'updated') {
      setJobs(prev => prev.map(j => j._id === job._id ? job : j));
      toast.success('Job updated successfully!');
    }
    setEditingJob(null);
  };

  const handleCloseJobForm = () => {
    setShowJobForm(false);
    setEditingJob(null);
  };

  const handleCompanySuccess = (company, action) => {
    if (action === 'created') {
      setCompanies(prev => [company, ...prev]);
      toast.success('Company created successfully!');
    } else if (action === 'updated') {
      setCompanies(prev => prev.map(c => c._id === company._id ? company : c));
      toast.success('Company updated successfully!');
    }
    setEditingCompany(null);
  };

  const handleDeleteCompany = async (companyId) => {
    if (!window.confirm('Are you sure you want to delete this company? This will also delete all associated jobs.')) return;
    
    try {
      const token = await getToken();
      const response = await fetch(`/api/v1/admin/companies/${companyId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        setCompanies(prev => prev.filter(company => company._id !== companyId));
        // Also remove jobs from this company
        setJobs(prev => prev.filter(job => job.company?._id !== companyId));
        toast.success('Company deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting company:', error);
      toast.error('Failed to delete company');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-indigo-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <CogIcon className="h-8 w-8 text-white" />
              <h1 className="ml-3 text-2xl font-bold text-white">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-indigo-100">Welcome, {user?.firstName || 'Admin'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Navigation Tabs */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', name: 'Overview', icon: ChartBarIcon },
                { id: 'jobs', name: 'Manage Jobs', icon: BriefcaseIcon },
                { id: 'users', name: 'Manage Users', icon: UsersIcon },
                { id: 'companies', name: 'Manage Companies', icon: BuildingOfficeIcon }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-5 w-5 inline mr-2" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <UsersIcon className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                          <dd className="text-lg font-medium text-gray-900">{metrics.totalUsers}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <BriefcaseIcon className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Total Jobs</dt>
                          <dd className="text-lg font-medium text-gray-900">{metrics.totalJobs}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <BuildingOfficeIcon className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Total Companies</dt>
                          <dd className="text-lg font-medium text-gray-900">{metrics.totalCompanies}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <CogIcon className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Total Applications</dt>
                          <dd className="text-lg font-medium text-gray-900">{metrics.totalApplications}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button 
                    onClick={() => setActiveTab('jobs')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Manage Jobs
                  </button>
                  <button 
                    onClick={() => setActiveTab('users')}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Manage Users
                  </button>
                  <button 
                    onClick={() => setActiveTab('companies')}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Manage Companies
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Jobs Management Tab */}
          {activeTab === 'jobs' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Manage All Jobs</h2>
                <button
                  onClick={() => setShowJobForm(true)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Add New Job
                </button>
              </div>

              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {jobs.map((job) => (
                        <tr key={job._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{job.title}</div>
                              <div className="text-sm text-gray-500">{job.category}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {job.company?.name || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {job.location}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              job.isVisible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {job.isVisible ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleToggleJobVisibility(job._id, job.isVisible)}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                {job.isVisible ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                              </button>
                              <button 
                                onClick={() => handleEditJob(job)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteJob(job._id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Users Management Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Manage Users</h2>
              
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <img
                                src={user.avatar || `https://via.placeholder.com/40x40/4A154B/FFFFFF?text=${user.name?.charAt(0) || 'U'}`}
                                alt={user.name}
                                className="w-10 h-10 rounded-full mr-3"
                              />
                              <div>
                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              value={user.role}
                              onChange={(e) => handleUpdateUserRole(user._id, e.target.value)}
                              className="text-sm border-gray-300 rounded-md"
                            >
                              <option value="candidate">Candidate</option>
                              <option value="recruiter">Recruiter</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-red-600 hover:text-red-900">
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Companies Management Tab */}
          {activeTab === 'companies' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Manage Companies</h2>
                <button
                  onClick={() => {
                    setEditingCompany(null);
                    setShowCompanyForm(true);
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                  Add Company
                </button>
              </div>
              
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Website</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {companies.map((company) => (
                        <tr key={company._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <img
                                src={company.logoUrl || `https://via.placeholder.com/40x40/4A154B/FFFFFF?text=${company.name?.charAt(0) || 'C'}`}
                                alt={company.name}
                                className="w-10 h-10 rounded-full mr-3"
                              />
                              <div>
                                <div className="text-sm font-medium text-gray-900">{company.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {company.location}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {company.website || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => {
                                  setEditingCompany(company);
                                  setShowCompanyForm(true);
                                }}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteCompany(company._id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Job Form Modal */}
      <JobForm
        isOpen={showJobForm}
        onClose={handleCloseJobForm}
        job={editingJob}
        isEditing={!!editingJob}
        onSuccess={handleJobSuccess}
        isAdmin={true}
      />

      {/* Company Form Modal */}
      <CompanyForm
        isOpen={showCompanyForm}
        onClose={() => {
          setShowCompanyForm(false);
          setEditingCompany(null);
        }}
        company={editingCompany}
        isEditing={!!editingCompany}
        onSuccess={handleCompanySuccess}
      />
    </div>
  );
};

export default AdminDashboard;
