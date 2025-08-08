'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

type Freelancer = {
  _id: string;
  name: string;
  email: string;
  bio: string;
  skills: string[];
  hourlyRate: number;
  profileImage: string;
  rating?: number;
};

export default function FindFreelancers() {
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchFreelancers = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/freelancers');
        setFreelancers(res.data.freelancers);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching freelancers:', err);
        setError('Failed to load freelancers');
        setLoading(false);
      }
    };

    fetchFreelancers();
  }, []);

  const handleContact = (freelancerId: string) => {
    // In a real implementation, this would navigate to a chat or contact page
    router.push(`/chat/${freelancerId}`);
  };

  const handleHire = (freelancerId: string) => {
    // In a real implementation, this would navigate to a job offer page
    router.push(`/client/post-job?freelancer=${freelancerId}`);
  };

  const handleViewProfile = (freelancerId: string) => {
    // In a real implementation, this would navigate to the freelancer's profile
    router.push(`/freelancer/profile/${freelancerId}`);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-purple-700">Freelancers Bids</h1>
        <button 
          onClick={() => router.push('/client/dashboard')}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded"
        >
          Back to Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {freelancers.map(freelancer => (
          <div key={freelancer._id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between">
              <div className="flex items-start space-x-4">
                <img 
                  src={freelancer.profileImage || 'https://randomuser.me/api/portraits/lego/1.jpg'} 
                  alt={freelancer.name} 
                  className="w-16 h-16 rounded-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://randomuser.me/api/portraits/lego/1.jpg';
                  }}
                />
                <div>
                  <h2 className="font-semibold text-lg">{freelancer.name}</h2>
                  <p className="text-gray-600 text-sm">{freelancer.email}</p>
                  <div className="mt-1">
                    {freelancer.rating ? (
                      <div className="flex items-center">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <svg 
                              key={i} 
                              className={`w-4 h-4 ${i < Math.floor(freelancer.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                              fill="currentColor" 
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-sm text-gray-500 ml-1">{freelancer.rating}</span>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">No ratings yet</div>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-green-600 font-bold">${freelancer.hourlyRate}/hr</span>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-gray-700 text-sm line-clamp-2">{freelancer.bio}</p>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {freelancer.skills.slice(0, 3).map((skill, index) => (
                <span key={index} className="px-2 py-1 bg-gray-100 text-xs rounded-full text-gray-600">
                  {skill}
                </span>
              ))}
              {freelancer.skills.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-xs rounded-full text-gray-600">
                  +{freelancer.skills.length - 3} more
                </span>
              )}
            </div>

            <div className="mt-4 flex space-x-2">
              <button 
                onClick={() => handleContact(freelancer._id)}
                className="flex-1 bg-orange-500 text-white py-2 rounded text-sm"
              >
                Contact
              </button>
              <button 
                onClick={() => handleHire(freelancer._id)}
                className="flex-1 bg-purple-600 text-white py-2 rounded text-sm"
              >
                Send Invitation
              </button>
              <button 
                onClick={() => handleViewProfile(freelancer._id)}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded text-sm"
              >
                View Profile
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Information Section */}
      <div className="mt-8 bg-purple-100 rounded-lg p-6 flex items-center">
        <div className="flex-1">
          <h2 className="text-xl font-bold text-purple-800">Stay Informed</h2>
          <p className="text-purple-600 mt-1">
            Get real-time updates on freelancer activity on the platform. Learn about new skills and services offered by our growing community.
          </p>
          <button className="mt-4 bg-purple-600 text-white px-4 py-2 rounded">
            Sign Up Now
          </button>
        </div>
        <div className="hidden md:block flex-1">
          <img 
            src="/puzzle-pieces.jpg" 
            alt="Collaboration" 
            className="w-full h-48 object-cover rounded-lg"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80';
            }}
          />
        </div>
      </div>
    </div>
  );
}