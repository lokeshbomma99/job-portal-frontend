import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { UserIcon, DocumentTextIcon, CogIcon } from '@heroicons/react/24/outline';

const Profile = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    skills: '',
    experience: []
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await getToken();
        const response = await fetch('/api/v1/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const profileData = await response.json();
          setProfile(profileData);
          setFormData({
            name: profileData.name || '',
            phone: profileData.phone || '',
            skills: profileData.candidate?.skills?.join(', ') || '',
            experience: profileData.candidate?.experience || []
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = await getToken();
      const response = await fetch('/api/v1/auth/me', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          candidate: {
            skills: formData.skills.split(',').map(skill => skill.trim()).filter(Boolean),
            experience: formData.experience
          }
        })
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setProfile(updatedProfile);
        // Show success message
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
          <p className="text-gray-600">
            Manage your personal information and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card">
              <div className="text-center">
                <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                  {profile?.avatar ? (
                    <img
                      src={profile.avatar}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <UserIcon className="h-12 w-12 text-gray-600" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {profile?.name || 'User'}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {profile?.email || user?.primaryEmailAddress?.emailAddress}
                </p>
                <div className="text-xs text-gray-500">
                  Member since {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Recently'}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="card">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <UserIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="card">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CogIcon className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Skills</h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skills (comma-separated)
                  </label>
                  <input
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="e.g., JavaScript, React, Node.js, MongoDB"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Separate multiple skills with commas
                  </p>
                </div>
              </div>

              {/* Resume */}
              <div className="card">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <DocumentTextIcon className="h-5 w-5 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Resume</h3>
                </div>

                <div>
                  {profile?.candidate?.resumeUrl ? (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">
                        Current resume: 
                        <a
                          href={profile.candidate.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 ml-2"
                        >
                          View Resume
                        </a>
                      </p>
                      <div className="flex space-x-3">
                        <button
                          type="button"
                          className="btn-primary"
                        >
                          Update Resume
                        </button>
                        <button
                          type="button"
                          className="btn-secondary"
                        >
                          Remove Resume
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                      <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">No resume uploaded yet</p>
                      <button
                        type="button"
                        className="btn-primary"
                      >
                        Upload Resume
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Experience */}
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <UserIcon className="h-5 w-5 text-orange-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Work Experience</h3>
                  </div>
                  <button
                    type="button"
                    className="btn-secondary text-sm"
                  >
                    Add Experience
                  </button>
                </div>

                {formData.experience.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No work experience added yet</p>
                    <p className="text-sm">Add your work history to improve your profile</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.experience.map((exp, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-900">{exp.title}</h4>
                          <button
                            type="button"
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{exp.company}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(exp.from).toLocaleDateString()} - 
                          {exp.to ? new Date(exp.to).toLocaleDateString() : 'Present'}
                        </p>
                        {exp.desc && (
                          <p className="text-sm text-gray-700 mt-2">{exp.desc}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary px-8 py-3"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
