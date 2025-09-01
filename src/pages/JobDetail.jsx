import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useUser, useAuth } from '@clerk/clerk-react';
import { 
  MapPinIcon, 
  BuildingOfficeIcon, 
  CurrencyDollarIcon,
  ClockIcon,
  BookmarkIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import ApplicationForm from '../components/ApplicationForm';

const JobDetail = () => {
  const { slug } = useParams();
  const { user, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await fetch(`/api/v1/jobs/${slug}`);
        if (response.ok) {
          const jobData = await response.json();
          setJob(jobData);
        }
      } catch (error) {
        console.error('Error fetching job:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [slug]);

  useEffect(() => {
    const checkSavedStatus = async () => {
      if (!isSignedIn || !job) return;
      
      try {
        const token = await getToken();
        const response = await fetch(`/api/v1/saved/${job._id}/check`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const { isSaved: saved } = await response.json();
          setIsSaved(saved);
        }
      } catch (error) {
        console.error('Error checking saved status:', error);
      }
    };

    checkSavedStatus();
  }, [isSignedIn, job, user]);

  useEffect(() => {
    const checkApplicationStatus = async () => {
      if (!isSignedIn || !job || user.publicMetadata.role !== 'candidate') return;

      try {
        const token = await getToken();
        const response = await fetch(`/api/v1/applications/candidate/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const applications = await response.json();
          const applied = applications.some(app => app.job._id === job._id);
          setHasApplied(applied);
        }
      } catch (error) {
        console.error('Error checking application status:', error);
      }
    };

    checkApplicationStatus();
  }, [isSignedIn, job, user, getToken]);

  const handleSaveJob = async () => {
    console.log('handleSaveJob called. Current isSaved state:', isSaved);
    if (!isSignedIn) {
      // Redirect to sign in
      return;
    }

    try {
      const token = await getToken();
      const method = isSaved ? 'DELETE' : 'POST';
      
      console.log('Sending', method, 'request to /api/v1/saved/' + job._id);
      const response = await fetch(`/api/v1/saved/${job._id}`, {
        method,
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        setIsSaved(!isSaved);
        console.log('isSaved state updated to:', !isSaved);
      }
    } catch (error) {
      console.error('Error saving job:', error);
    }
  };

  const formatSalary = (min, max) => {
    if (!min && !max) return 'Salary not specified';
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `$${min.toLocaleString()}+`;
    if (max) return `Up to $${max.toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
    return `${Math.ceil(diffDays / 365)} years ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Job not found</h1>
          <p className="text-gray-600 mb-6">
            The job you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/jobs" className="btn-primary">
            Browse Jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li>
              <Link to="/" className="hover:text-blue-600">Home</Link>
            </li>
            <li>
              <span className="mx-2">/</span>
            </li>
            <li>
              <Link to="/jobs" className="hover:text-blue-600">Jobs</Link>
            </li>
            <li>
              <span className="mx-2">/</span>
            </li>
            <li className="text-gray-900">{job.title}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Job Header */}
            <div className="card mb-6">
              <div className="flex items-start space-x-4 mb-6">
                <img
                  src={job.company?.logoUrl || `https://via.placeholder.com/80x80/4A154B/FFFFFF?text=${job.company?.name?.charAt(0) || 'C'}`}
                  alt={job.company?.name}
                  className="w-20 h-20 rounded-lg"
                />
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
                  <div className="flex items-center space-x-4 text-gray-600 mb-2">
                    <div className="flex items-center space-x-1">
                      <BuildingOfficeIcon className="h-5 w-5" />
                      <span>{job.company?.name}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPinIcon className="h-5 w-5" />
                      <span>{job.location}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-gray-600">
                    <div className="flex items-center space-x-1">
                      <CurrencyDollarIcon className="h-5 w-5" />
                      <span>{formatSalary(job.salaryMin, job.salaryMax)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <ClockIcon className="h-5 w-5" />
                      <span>Posted {formatDate(job.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                {isSignedIn && user.publicMetadata.role === 'candidate' ? (
                  <button
                    onClick={() => {
                      console.log('Apply Now button clicked. Has applied:', hasApplied);
                      if (!hasApplied) {
                        console.log('Setting isApplying to true.');
                        setIsApplying(true);
                      }
                    }}
                    className="btn-primary flex-1 flex items-center justify-center space-x-2"
                    disabled={hasApplied}
                  >
                    <PaperAirplaneIcon className="h-5 w-5" />
                    <span>{hasApplied ? 'Applied' : 'Apply Now'}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      console.log('Apply Now button clicked for guest/non-candidate.');
                      if (!isSignedIn) {
                        console.log('User not signed in. Showing apply modal prompt.');
                        setShowApplyModal(true);
                      } else {
                        console.log('User is not a candidate.');
                        // Optionally, show a toast message here.
                      }
                    }}
                    className="btn-primary flex-1 flex items-center justify-center space-x-2"
                  >
                    <PaperAirplaneIcon className="h-5 w-5" />
                    <span>Apply now</span>
                  </button>
                )}
                <button
                  onClick={handleSaveJob}
                  className={`btn-secondary flex items-center justify-center space-x-2 ${
                    isSaved ? 'bg-blue-100 text-blue-800 border-blue-300' : ''
                  }`}
                >
                  <BookmarkIcon className="h-5 w-5" />
                  <span>{isSaved ? 'Saved' : 'Save Job'}</span>
                </button>
              </div>
            </div>

            {/* Job Description */}
            <div className="card mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Job description</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed mb-4">
                  {job.description}
                </p>
              </div>
            </div>

            {/* Key Responsibilities */}
            <div className="card mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Key responsibilities</h2>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 font-semibold">•</span>
                  <span>Build, test, and deploy highly responsive web applications using modern front-end and back-end technologies.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 font-semibold">•</span>
                  <span>Design and implement user-friendly interfaces using HTML, CSS, JavaScript (React, Angular, or Vue.js).</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 font-semibold">•</span>
                  <span>Develop and maintain APIs, server-side logic, and databases using technologies such as Node.js, Ruby, or Java.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 font-semibold">•</span>
                  <span>Design and maintain databases (SQL, NoSQL) for efficiency and reliability.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 font-semibold">•</span>
                  <span>Write automated tests to ensure the quality of the application (unit, integration, and end-to-end testing).</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 font-semibold">•</span>
                  <span>Work closely with designers, product managers, and engineers to understand requirements and implement features.</span>
                </li>
              </ul>
            </div>

            {/* Skills Required */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Skills required</h2>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start space-x-2">
                  <span className="text-green-600 font-semibold">•</span>
                  <span>Knowledge of HTML, CSS, and JavaScript, plus experience with frameworks like React, Angular, or Vue.js.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-600 font-semibold">•</span>
                  <span>Experience working with server-side languages such as Node.js, Python, Ruby, or Java.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-600 font-semibold">•</span>
                  <span>Familiarity with both relational databases (e.g., MySQL, PostgreSQL) and non-relational databases (e.g., MongoDB).</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-600 font-semibold">•</span>
                  <span>Experience using Git for tracking changes and collaborating on code.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-600 font-semibold">•</span>
                  <span>Good communication and collaboration skills, able to work effectively with others.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Company Info */}
            <div className="card mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-600">Company</p>
                  <p className="text-gray-900">{job.company?.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Location</p>
                  <p className="text-gray-900">{job.location}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Experience Level</p>
                  <p className="text-gray-900 capitalize">{job.level} Level</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Category</p>
                  <p className="text-gray-900">{job.category}</p>
                </div>
                {job.company?.website && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Website</p>
                    <a 
                      href={job.company.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700"
                    >
                      {job.company.website}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Job Stats */}
            <div className="card mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Applications</span>
                  <span className="font-semibold text-gray-900">{job.applicantsCount || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Posted</span>
                  <span className="font-semibold text-gray-900">{formatDate(job.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className={`font-semibold ${job.isVisible ? 'text-green-600' : 'text-red-600'}`}>
                    {job.isVisible ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            {/* More Jobs from Company */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">More jobs from {job.company?.name}</h3>
              <div className="space-y-3">
                <div className="p-3 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-900">Frontend Developer</h4>
                  <p className="text-sm text-gray-600">{job.location} • Senior Level</p>
                  <button className="btn-primary text-sm mt-2 w-full">Apply now</button>
                </div>
                <div className="p-3 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-900">Backend Developer</h4>
                  <p className="text-sm text-gray-600">{job.location} • Senior Level</p>
                  <button className="btn-primary text-sm mt-2 w-full">Apply now</button>
                </div>
                <div className="p-3 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-900">Website Developer</h4>
                  <p className="text-sm text-gray-600">{job.location} • Senior Level</p>
                  <button className="btn-primary text-sm mt-2 w-full">Apply now</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal for signed-in candidates */}
      {job && (
        <ApplicationForm
          open={isApplying}
          onClose={() => setIsApplying(false)}
          job={job}
          onSuccess={() => {
            setHasApplied(true);
            setIsApplying(false);
            setJob(prev => ({ ...prev, applicantsCount: (prev.applicantsCount || 0) + 1 }));
          }}
        />
      )}

      {/* Modal for non-signed-in users */}
      {showApplyModal && !isSignedIn && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Apply for {job.title}</h3>
            <p className="text-gray-600 mb-6">
              You need to be signed in to apply for this job.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowApplyModal(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <Link
                to="/sign-in"
                className="btn-primary flex-1 text-center"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetail;
