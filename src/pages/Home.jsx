import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MagnifyingGlassIcon, MapPinIcon } from '@heroicons/react/24/outline';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLocation, setSearchLocation] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery || searchLocation) {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (searchLocation) params.append('location', searchLocation);
      window.location.href = `/jobs?${params.toString()}`;
    }
  };

  const trustedCompanies = [
    'Microsoft',
    'Walmart',
    'Accenture',
    'Google',
    'Amazon',
    'Netflix'
  ];

  const featuredJobs = [
    {
      id: 1,
      title: 'Full Stack Developer',
      company: 'Slack',
      location: 'California',
      level: 'Senior level',
      description: 'You will be responsible for frontend and backend development tasks. You will work closely with our...',
      salary: '$80k'
    },
    {
      id: 2,
      title: 'Data Scientist',
      company: 'Meta',
      location: 'San Francisco',
      level: 'Mid level',
      description: 'Analyze large datasets to extract meaningful insights and help drive business decisions...',
      salary: '$120k'
    },
    {
      id: 3,
      title: 'UI/UX Designer',
      company: 'Apple',
      location: 'Cupertino',
      level: 'Senior level',
      description: 'Create beautiful and intuitive user interfaces that enhance user experience...',
      salary: '$110k'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Over 10,000+ jobs to apply
          </h1>
          <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto text-blue-100">
            Your Next Big Career Move Starts Right Here - Explore The Best Job Opportunities 
            And Take The First Step Toward Your Future!
          </p>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for jobs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex-1 relative">
                <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Location"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
      </section>

      {/* Trusted By Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Trusted by</h2>
            <p className="text-gray-600">Leading companies trust us for their hiring needs</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
            {trustedCompanies.map((companyName) => (
              <div key={companyName} className="flex justify-center">
                <span className="font-semibold text-lg text-gray-800 tracking-wide hover:text-gray-500 cursor-pointer transition-colors duration-200">
                  {companyName}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Jobs Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Latest jobs</h2>
            <p className="text-xl text-gray-600">Get your desired job from top companies</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {featuredJobs.map((job) => (
              <div key={job.id} className="card hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-start space-x-4 mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {job.title}
                    </h3>
                    <p className="text-gray-600">{job.company}</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="badge bg-gray-100 text-gray-800">
                    {job.location}
                  </span>
                  <span className="badge bg-blue-100 text-blue-800">
                    {job.level}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {job.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-green-600">
                    {job.salary}
                  </span>
                  <div className="flex space-x-2">
                    <Link
                      to={`/jobs/${job.title.toLowerCase().replace(/\s+/g, '-')}`}
                      className="btn-primary text-sm"
                    >
                      Apply now
                    </Link>
                    <button className="btn-secondary text-sm">
                      Learn more
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <Link
              to="/jobs"
              className="btn-primary text-lg px-8 py-3"
            >
              View All Jobs
            </Link>
          </div>
        </div>
      </section>

      {/* Mobile App Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Download mobile app for better experience
                </h2>
                <p className="text-gray-600 mb-8 text-lg">
                  Get instant job notifications, apply on the go, and track your applications 
                  with our mobile app.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors duration-200 flex items-center justify-center">
                    <span className="mr-2">GET IT ON</span>
                    <span className="text-xs">Google Play</span>
                  </button>
                  <button className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors duration-200 flex items-center justify-center">
                    <span className="mr-2">Download on the</span>
                    <span className="text-xs">App Store</span>
                  </button>
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-100 to-blue-100 p-8 lg:p-12 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-32 h-32 bg-yellow-400 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <span className="text-6xl">👩</span>
                  </div>
                  <p className="text-gray-600 font-medium">Better experience on mobile</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
