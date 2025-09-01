import { XMarkIcon } from '@heroicons/react/24/outline';

const FilterSidebar = ({ filters, onFilterChange, onClearFilters, hasActiveFilters }) => {
  const categories = [
    { name: 'Programming', count: 24 },
    { name: 'Designing', count: 15 },
    { name: 'Marketing', count: 41 },
    { name: 'Accounting', count: 22 },
    { name: 'Analytics', count: 41 }
  ];

  const levels = [
    { name: 'intern', label: 'Intern', count: 12 },
    { name: 'junior', label: 'Junior', count: 28 },
    { name: 'mid', label: 'Mid Level', count: 35 },
    { name: 'senior', label: 'Senior', count: 42 },
    { name: 'lead', label: 'Lead', count: 18 }
  ];

  const locations = [
    { name: 'San Francisco', count: 45 },
    { name: 'New York', count: 38 },
    { name: 'Seattle', count: 32 },
    { name: 'Austin', count: 25 },
    { name: 'Boston', count: 28 },
    { name: 'Denver', count: 22 }
  ];

  const handleCategoryChange = (category) => {
    onFilterChange({ category: filters.category === category ? '' : category });
  };

  const handleLevelChange = (level) => {
    onFilterChange({ level: filters.level === level ? '' : level });
  };

  const handleLocationChange = (location) => {
    onFilterChange({ location: filters.location === location ? '' : location });
  };

  const handleSalaryChange = (type, value) => {
    onFilterChange({ [type]: value });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Current Search */}
      {(filters.q || filters.location) && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Current Search</h4>
          <div className="space-y-2">
            {filters.q && (
              <div className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded-lg">
                <span className="text-sm text-blue-800">{filters.q}</span>
                <button
                  onClick={() => onFilterChange({ q: '' })}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            )}
            {filters.location && (
              <div className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded-lg">
                <span className="text-sm text-blue-800">{filters.location}</span>
                <button
                  onClick={() => onFilterChange({ location: '' })}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Job Categories</h4>
        <div className="space-y-2">
          {categories.map((category) => (
            <label key={category.name} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.category === category.name}
                onChange={() => handleCategoryChange(category.name)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
                {category.name} ({category.count})
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Experience Level */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Experience Level</h4>
        <div className="space-y-2">
          {levels.map((level) => (
            <label key={level.name} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.level === level.name}
                onChange={() => handleLevelChange(level.name)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
                {level.label} ({level.count})
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Location */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Location</h4>
        <div className="space-y-2">
          {locations.map((location) => (
            <label key={location.name} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.location === location.name}
                onChange={() => handleLocationChange(location.name)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
                {location.name} ({location.count})
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Salary Range */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Salary Range</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Minimum Salary</label>
            <input
              type="number"
              placeholder="Min"
              value={filters.min}
              onChange={(e) => handleSalaryChange('min', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Maximum Salary</label>
            <input
              type="number"
              placeholder="Max"
              value={filters.max}
              onChange={(e) => handleSalaryChange('max', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Quick Salary Presets */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Salary Ranges</h4>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onFilterChange({ min: '30000', max: '60000' })}
            className="text-xs px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
          >
            $30k - $60k
          </button>
          <button
            onClick={() => onFilterChange({ min: '60000', max: '100000' })}
            className="text-xs px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
          >
            $60k - $100k
          </button>
          <button
            onClick={() => onFilterChange({ min: '100000', max: '150000' })}
            className="text-xs px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
          >
            $100k - $150k
          </button>
          <button
            onClick={() => onFilterChange({ min: '150000', max: '' })}
            className="text-xs px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
          >
            $150k+
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;
