import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MagnifyingGlassIcon, MapPinIcon, FunnelIcon } from '@heroicons/react/24/outline';
import JobCard from '../components/JobCard';
import FilterSidebar from '../components/FilterSidebar';
import Pagination from '../components/Pagination';
import ApplicationForm from '../components/ApplicationForm';
import { useUser } from '@clerk/clerk-react';

const Jobs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  const { isSignedIn } = useUser();

  // Get current filters from URL
  const currentFilters = {
    q: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    level: searchParams.get('level') || '',
    location: searchParams.get('location') || '',
    min: searchParams.get('min') || '',
    max: searchParams.get('max') || '',
    page: searchParams.get('page') || '1',
    sort: searchParams.get('sort') || 'newest'
  };

  const [filters, setFilters] = useState(currentFilters);

  // Fetch jobs based on filters
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });

        const response = await fetch(`/api/v1/jobs?${params.toString()}`);
        const data = await response.json();
        
        setJobs(data.jobs || []);
        setPagination(data.pagination || {});
      } catch (error) {
        console.error('Error fetching jobs:', error);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [filters]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '1') params.append(key, value);
    });
    setSearchParams(params);
  }, [filters, setSearchParams]);

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: '1' }));
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page: page.toString() }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (filters.q || filters.location) {
      setFilters(prev => ({ ...prev, page: '1' }));
    }
  };

  const handleApplyClick = (job) => {
    if (!isSignedIn) {
      // Or redirect to sign-in page
      alert('Please sign in to apply for jobs.');
      return;
    }
    setSelectedJob(job);
    setIsApplying(true);
  };

  const clearFilters = () => {
    setFilters({
      q: '',
      category: '',
      level: '',
      location: '',
      min: '',
      max: '',
      page: '1',
      sort: 'newest'
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value && value !== '1' && value !== 'newest');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Browse Jobs</h1>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-4xl">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for jobs..."
                  value={filters.q}
                  onChange={(e) => setFilters(prev => ({ ...prev, q: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex-1 relative">
                <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Location"
                  value={filters.location}
                  onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Mobile Filter Toggle */}
        <div className="md:hidden mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            <FunnelIcon className="h-5 w-5 text-gray-600" />
            <span>Filters</span>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:w-80 ${showFilters ? 'block' : 'hidden'} lg:block`}>
            <FilterSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={clearFilters}
              hasActiveFilters={hasActiveFilters}
            />
          </div>

          {/* Job Listings */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {loading ? 'Loading...' : `${pagination.total || 0} jobs found`}
                </h2>
                {hasActiveFilters && (
                  <p className="text-sm text-gray-600 mt-1">
                    Showing results for your search criteria
                  </p>
                )}
              </div>
              
              {/* Sort Dropdown */}
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange({ sort: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="salary-high">Salary: High to Low</option>
                <option value="salary-low">Salary: Low to High</option>
              </select>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="card animate-pulse">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gray-300 rounded-lg"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                        <div className="h-3 bg-gray-300 rounded w-1/4"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Job Listings */}
            {!loading && jobs.length > 0 && (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <JobCard key={job._id} job={job} onApplyClick={handleApplyClick} />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && jobs.length === 0 && (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MagnifyingGlassIcon className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search criteria or filters to find more jobs.
                </p>
                <button
                  onClick={clearFilters}
                  className="btn-primary"
                >
                  Clear All Filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {!loading && pagination.pages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.pages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedJob && (
        <ApplicationForm
          open={isApplying}
          onClose={() => setIsApplying(false)}
          job={selectedJob}
          onSuccess={() => {
            setIsApplying(false);
            // Optionally, refresh jobs or update the specific job card
          }}
        />
      )}
    </div>
  );
};

export default Jobs;
