import { useEffect, useState } from 'react';
import { axiosInstance } from '../../lib/authInstances';
import { Link } from 'react-router-dom';
import { getProfilePicUrl } from '../../utils/avatarUtils';

const IMAGE_BASE_URL = "https://worklah.onrender.com";

interface Application {
  id: string;
  candidateId?: string;
  candidate?: {
    fullName?: string;
    profilePicture?: string;
  };
  job?: {
    jobName?: string;
  };
  createdAt?: string;
}

const NewApplications = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        // Fetch recent applications - using candidates endpoint with limit
        const response = await axiosInstance.get('/admin/candidates?limit=4&sort=-createdAt');
        if (response?.data?.candidates) {
          // Map candidates to applications format
          const apps = response.data.candidates.slice(0, 4).map((candidate: any) => ({
            id: candidate._id || candidate.id,
            candidateId: candidate._id || candidate.id,
            candidate: {
              fullName: candidate.fullName,
              profilePicture: candidate.profilePicture || candidate.avatarUrl,
            },
            createdAt: candidate.createdAt || candidate.registrationDate,
          }));
          setApplications(apps);
        }
      } catch (error) {
        console.error('Error fetching applications:', error);
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const formatTimeAgo = (dateString?: string) => {
    if (!dateString) return 'Recently';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffInSeconds < 60) return 'Just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
      return `${Math.floor(diffInSeconds / 86400)}d ago`;
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">New Applications</h3>
        <Link to="/hustle-heroes">
          <button className="text-blue-500 text-sm hover:underline">View all</button>
        </Link>
      </div>
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No new applications
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <div key={application.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              {getProfilePicUrl(application.candidate?.profilePicture) ? (
                <img
                  src={(() => {
                    const url = getProfilePicUrl(application.candidate?.profilePicture);
                    return url?.startsWith("http") ? url : `${IMAGE_BASE_URL}${url}`;
                  })()}
                  alt={application.candidate?.fullName || 'Candidate'}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-500">
                  {application.candidate?.fullName?.charAt(0)?.toUpperCase() || "?"}
                </div>
              )}
              <div className="flex-1">
                <h4 className="font-medium">{application.candidate?.fullName || 'Unknown'}</h4>
                <p className="text-sm text-gray-500">
                  {application.job?.jobName ? `Applied for: ${application.job.jobName}` : 'New candidate'}
                </p>
              </div>
              <span className="text-sm text-gray-500">{formatTimeAgo(application.createdAt)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NewApplications;