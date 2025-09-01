import { useUser, useAuth } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CandidateDashboard from './CandidateDashboard';
import RecruiterDashboard from './RecruiterDashboard';
import AdminDashboard from './AdminDashboard';

const Dashboard = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const token = await getToken();
        const response = await fetch('/api/v1/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUserRole(userData.role);
          
          // Redirect to role-specific dashboard
          switch (userData.role) {
            case 'admin':
              navigate('/admin');
              break;
            case 'recruiter':
              navigate('/recruiter');
              break;
            case 'candidate':
              navigate('/candidate');
              break;
            default:
              navigate('/candidate');
          }
        } else {
          // Default to candidate if role not found
          setUserRole('candidate');
          navigate('/candidate');
        }
              } catch (error) {
          console.error('Error fetching user role:', error);
          setUserRole('candidate');
          navigate('/candidate');
        } finally {
          setLoading(false);
        }
    };

    if (user) {
      fetchUserRole();
    }
  }, [user]);

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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
};

export default Dashboard;
