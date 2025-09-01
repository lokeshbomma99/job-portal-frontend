import { Link } from 'react-router-dom';
import { MapPinIcon, BuildingOfficeIcon, CurrencyDollarIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

const JobCard = ({ job, onApplyClick }) => {
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

  const getLevelColor = (level) => {
    const colors = {
      intern: 'bg-green-100 text-green-800',
      junior: 'bg-blue-100 text-blue-800',
      mid: 'bg-yellow-100 text-yellow-800',
      senior: 'bg-purple-100 text-purple-800',
      lead: 'bg-red-100 text-red-800'
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryColor = (category) => {
    const colors = {
      Programming: 'bg-blue-100 text-blue-800',
      Designing: 'bg-purple-100 text-purple-800',
      Marketing: 'bg-green-100 text-green-800',
      Accounting: 'bg-red-100 text-red-800',
      Analytics: 'bg-orange-100 text-orange-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="card hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
      <div className="flex items-start space-x-4">
        {/* Company Logo */}
        <div className="flex-shrink-0">
          <img
            src={job.company?.logoUrl || `https://via.placeholder.com/60x60/4A154B/FFFFFF?text=${job.company?.name?.charAt(0) || 'C'}`}
            alt={job.company?.name}
            className="w-12 h-12 rounded-lg object-cover"
            onError={(e) => {
              e.target.src = `https://via.placeholder.com/60x60/4A154B/FFFFFF?text=${job.company?.name?.charAt(0) || 'C'}`;
            }}
          />
        </div>

        {/* Job Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors duration-200">
                <Link to={`/jobs/${job.slug}`}>
                  {job.title}
                </Link>
              </h3>
              <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <BuildingOfficeIcon className="h-4 w-4" />
                  <span>{job.company?.name}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPinIcon className="h-4 w-4" />
                  <span>{job.location}</span>
                </div>
              </div>
            </div>
            
            {/* Posted Date */}
            <div className="text-sm text-gray-500 text-right">
              {formatDate(job.createdAt)}
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            <span className={`badge ${getCategoryColor(job.category)}`}>
              {job.category}
            </span>
            <span className={`badge ${getLevelColor(job.level)}`}>
              {job.level.charAt(0).toUpperCase() + job.level.slice(1)} Level
            </span>
          </div>

          {/* Salary */}
          <div className="flex items-center space-x-1 text-sm text-gray-600 mb-3">
            <CurrencyDollarIcon className="h-4 w-4" />
            <span>{formatSalary(job.salaryMin, job.salaryMax)}</span>
          </div>

          {/* Description Preview */}
          <p className="text-gray-600 text-sm line-clamp-2 mb-4">
            {job.description}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onApplyClick(job)}
                className="btn-primary text-sm flex items-center justify-center space-x-2"
              >
                <PaperAirplaneIcon className="h-5 w-5" />
                <span>Apply now</span>
              </button>
              <Link
                to={`/jobs/${job.slug}`}
                className="btn-secondary text-sm"
              >
                Learn more
              </Link>
            </div>
            
            {/* Applicants Count */}
            {job.applicantsCount > 0 && (
              <div className="text-sm text-gray-500">
                {job.applicantsCount} applicant{job.applicantsCount !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
