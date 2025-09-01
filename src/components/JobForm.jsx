import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const JobForm = ({ 
  isOpen, 
  onClose, 
  job = null, 
  isEditing = false, 
  onSuccess,
  isAdmin = false 
}) => {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [recruiters, setRecruiters] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    level: 'mid',
    salaryMin: '',
    salaryMax: '',
    company: '',
    recruiter: '',
    isVisible: true
  });

  const jobCategories = [
    'Programming', 'Designing', 'Marketing', 'Accounting', 'Analytics',
    'Sales', 'Customer Service', 'Human Resources', 'Operations', 'Research'
  ];

  const jobLevels = [
    { value: 'intern', label: 'Intern' },
    { value: 'junior', label: 'Junior' },
    { value: 'mid', label: 'Mid-Level' },
    { value: 'senior', label: 'Senior' },
    { value: 'lead', label: 'Lead' }
  ];

  const locations = [
    'San Francisco', 'New York', 'Seattle', 'Austin', 'Boston', 'Denver',
    'Los Angeles', 'Chicago', 'Miami', 'Portland', 'Remote', 'Other'
  ];

  // Fetch companies and recruiters for admin
  useEffect(() => {
    if (isAdmin && isOpen) {
      fetchCompaniesAndRecruiters();
    }
  }, [isAdmin, isOpen]);

  // Pre-fill form when editing
  useEffect(() => {
    if (job && isEditing) {
      setFormData({
        title: job.title || '',
        description: job.description || '',
        category: job.category || '',
        location: job.location || '',
        level: job.level || 'mid',
        salaryMin: job.salaryMin || '',
        salaryMax: job.salaryMax || '',
        company: job.company?._id || '',
        recruiter: job.createdBy || '',
        isVisible: job.isVisible !== false
      });
    }
  }, [job, isEditing]);

  const fetchCompaniesAndRecruiters = async () => {
    try {
      const token = await getToken();
      const [companiesRes, recruitersRes] = await Promise.all([
        fetch('/api/v1/admin/companies', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/v1/admin/users?role=recruiter', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      
      if (companiesRes.ok) {
        const companiesData = await companiesRes.json();
        setCompanies(companiesData.users || []);
      }
      
      if (recruitersRes.ok) {
        const recruitersData = await recruitersRes.json();
        setRecruiters(recruitersData.users || []);
      }
    } catch (error) {
      console.error('Error fetching companies/recruiters:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Convert string numbers to actual numbers
      const processedData = {
        ...formData,
        salaryMin: Number(formData.salaryMin),
        salaryMax: Number(formData.salaryMax)
      };

      // Basic validation
      if (isNaN(processedData.salaryMin) || isNaN(processedData.salaryMax)) {
        throw new Error('Please enter valid salary numbers');
      }

      if (processedData.salaryMin >= processedData.salaryMax) {
        throw new Error('Maximum salary must be greater than minimum salary');
      }

      console.log('Getting token...');
      const token = await getToken();
      if (!token) {
        throw new Error('Failed to get authentication token');
      }

      const url = isEditing 
        ? `/api/v1/jobs/${job._id}` 
        : '/api/v1/jobs';
      
      const method = isEditing ? 'PUT' : 'POST';
      
      // Prepare data based on role
      const submitData = { ...processedData };
      
      // For recruiters, remove admin-specific fields
      if (!isAdmin) {
        delete submitData.recruiter;
        delete submitData.company;
      }

      console.log('Submitting job data:', JSON.stringify(submitData, null, 2));
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(submitData)
      });

      const responseData = await response.json().catch(() => ({}));
      
      if (!response.ok) {
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          data: responseData
        });
        
        let errorMessage = 'Failed to save job';
        if (responseData.details) {
          errorMessage = Object.entries(responseData.details)
            .map(([field, error]) => `${field}: ${error._errors?.join(', ')}`)
            .join('\n');
        } else if (responseData.message) {
          errorMessage = responseData.message;
        }
        
        throw new Error(errorMessage);
      }

      console.log('Job saved successfully:', responseData);
      toast.success(`Job ${isEditing ? 'updated' : 'created'} successfully!`);
      onSuccess(responseData, isEditing ? 'updated' : 'created');
      onClose();
      resetForm();
      
    } catch (error) {
      console.error('Error in handleSubmit:', {
        error: error.message,
        stack: error.stack,
        name: error.name
      });
      toast.error(error.message || 'Failed to save job. Please check the console for details.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      location: '',
      level: 'mid',
      salaryMin: '',
      salaryMax: '',
      company: '',
      recruiter: ''
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900">
            {isEditing ? 'Edit Job' : 'Add New Job'}
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Job Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Job Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Senior Software Engineer"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Job Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe the role, responsibilities, and requirements..."
            />
          </div>

          {/* Category and Level */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Category</option>
                {jobCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-2">
                Experience Level *
              </label>
              <select
                id="level"
                name="level"
                value={formData.level}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {jobLevels.map(level => (
                  <option key={level.value} value={level.value}>{level.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              Location *
            </label>
            <select
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Location</option>
              {locations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>

          {/* Salary Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="salaryMin" className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Salary ($) *
              </label>
              <input
                type="number"
                id="salaryMin"
                name="salaryMin"
                value={formData.salaryMin}
                onChange={handleInputChange}
                required
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 50000"
              />
            </div>

            <div>
              <label htmlFor="salaryMax" className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Salary ($) *
              </label>
              <input
                type="number"
                id="salaryMax"
                name="salaryMax"
                value={formData.salaryMax}
                onChange={handleInputChange}
                required
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 80000"
              />
            </div>
          </div>

          {/* Company Selection (Admin only) */}
          {isAdmin && (
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                Company *
              </label>
              <select
                id="company"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Company</option>
                {companies.map(company => (
                  <option key={company._id} value={company._id}>{company.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Recruiter Selection (Admin only) */}
          {isAdmin && (
            <div>
              <label htmlFor="recruiter" className="block text-sm font-medium text-gray-700 mb-2">
                Recruiter *
              </label>
              <select
                id="recruiter"
                name="recruiter"
                value={formData.recruiter}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Recruiter</option>
                {recruiters.map(recruiter => (
                  <option key={recruiter._id} value={recruiter._id}>{recruiter.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Job Visibility */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isVisible"
                checked={formData.isVisible}
                onChange={(e) => setFormData(prev => ({ ...prev, isVisible: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
                Make this job visible to candidates
              </span>
            </label>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : (isEditing ? 'Update Job' : 'Create Job')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobForm;
