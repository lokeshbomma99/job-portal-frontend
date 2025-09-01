import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import {
  BriefcaseIcon,
  UserIcon,
  BookmarkIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

const CandidateDashboard = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('applied');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getToken();
        const headers = { 'Authorization': `Bearer ${token}` };
        
        const [applicationsRes, savedJobsRes] = await Promise.all([
          fetch('/api/v1/applications/candidate/me', { headers }),
          fetch('/api/v1/saved', { headers })
        ]);
        
        if (applicationsRes.ok) {
          const applicationsData = await applicationsRes.json();
          setApplications(applicationsData);
        }
        
        if (savedJobsRes.ok) {
          const savedJobsData = await savedJobsRes.json();
          setSavedJobs(savedJobsData);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const getStatusBadge = (status) => {
    const badges = {
      pending: {
        icon: ClockIcon,
        className: 'badge-pending',
        text: 'Pending'
      },
      accepted: {
        icon: CheckCircleIcon,
        className: 'badge-accepted',
        text: 'Accepted'
      },
      rejected: {
        icon: XCircleIcon,
        className: 'badge-rejected',
        text: 'Rejected'
      }
    };

    const badge = badges[status];
    const Icon = badge.icon;

    return (
      <span className={`badge ${badge.className} flex items-center space-x-1`}>
        <Icon className="h-3 w-3" />
        <span>{badge.text}</span>
      </span>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 md:flex md:items-center md:justify-between">
          <div className="flex items-center space-x-5">
            <img
              className="h-20 w-20 rounded-full object-cover"
              src={user?.imageUrl || 'https://via.placeholder.com/80x80?text=User'}
              alt="Your profile"
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.firstName || 'User'}!
              </h1>
              <p className="text-gray-600">
                Manage your job applications and profile
              </p>
            </div>
          </div>
        </div>

        {/* Job Search Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Find New Opportunities</h2>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for jobs..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex-1">
              <div className="relative">
                <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Location..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Search Jobs
            </button>
          </div>
          <div className="mt-4">
            <Link 
              to="/jobs" 
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View all available jobs →
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BriefcaseIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-2xl font-semibold text-gray-900">{applications.length}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Accepted</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {applications.filter(app => app.status === 'accepted').length}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <BookmarkIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Saved Jobs</p>
                <p className="text-2xl font-semibold text-gray-900">{savedJobs.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('applied')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'applied'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Jobs Applied
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'saved'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Saved Jobs
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Profile
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow">
          {/* Jobs Applied Tab */}
          {activeTab === 'applied' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Jobs Applied</h2>
                <Link
                  to="/jobs"
                  className="btn-primary"
                >
                  Browse More Jobs
                </Link>
              </div>

              {applications.length === 0 ? (
                <div className="text-center py-12">
                  <BriefcaseIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
                  <p className="text-gray-600 mb-6">
                    Start applying to jobs to see your applications here.
                  </p>
                  <Link to="/jobs" className="btn-primary">
                    Browse Jobs
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Company
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Job Title
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Location
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {applications.map((application) => (
                        <tr key={application._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <img
                                src={application.job.company?.logoUrl || `https://via.placeholder.com/40x40/4A154B/FFFFFF?text=${application.job.company?.name?.charAt(0) || 'C'}`}
                                alt={application.job.company?.name}
                                className="w-10 h-10 rounded-lg mr-3"
                              />
                              <span className="text-sm font-medium text-gray-900">
                                {application.job.company?.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900">
                              {application.job.title}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-500">
                              {application.job.location}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-500">
                              {formatDate(application.createdAt)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(application.status)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Saved Jobs Tab */}
          {activeTab === 'saved' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Saved Jobs</h2>
                <Link
                  to="/jobs"
                  className="btn-primary"
                >
                  Browse More Jobs
                </Link>
              </div>

              {savedJobs.length === 0 ? (
                <div className="text-center py-12">
                  <BookmarkIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No saved jobs yet</h3>
                  <p className="text-gray-600 mb-6">
                    Save jobs you're interested in to view them here later.
                  </p>
                  <Link to="/jobs" className="btn-primary">
                    Browse Jobs
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedJobs.map((savedJob) => (
                    <div key={savedJob._id} className="card hover:shadow-lg transition-shadow duration-200">
                      <div className="flex items-start space-x-3 mb-3">
                        <img
                          src={savedJob.job.company?.logoUrl || `https://via.placeholder.com/40x40/4A154B/FFFFFF?text=${savedJob.job.company?.name?.charAt(0) || 'C'}`}
                          alt={savedJob.job.company?.name}
                          className="w-10 h-10 rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{savedJob.job.title}</h3>
                          <p className="text-sm text-gray-600">{savedJob.job.company?.name}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                        <span>{savedJob.job.location}</span>
                        <span>{savedJob.job.level} Level</span>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Link
                          to={`/jobs/${savedJob.job.slug}`}
                          className="btn-primary text-sm flex-1 text-center"
                        >
                          View Job
                        </Link>
                        <button className="btn-secondary text-sm px-3">
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Your Profile</h2>
                <Link
                  to="/profile"
                  className="btn-primary"
                >
                  Edit Profile
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <UserIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
                      <p className="text-sm text-gray-600">Manage your basic details</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="text-gray-900">{user?.fullName || 'Not set'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="text-gray-900">{user?.primaryEmailAddress?.emailAddress}</span>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <DocumentTextIcon className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Resume</h3>
                      <p className="text-sm text-gray-600">Manage your resume</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      Keep your resume up to date to increase your chances of getting hired.
                    </p>
                    <Link to="/profile" className="btn-primary text-sm">
                      Update Resume
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;
