'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

type Profile = {
  name: string;
  email: string;
  bio: string;
  phone?: string;
  profileImage: string;
  country?: string;
  city?: string;
};

export default function EditProfilePage() {
  const [profile, setProfile] = useState<Profile>({
    name: '',
    email: '',
    bio: '',
    phone: '',
    profileImage: '',
    country: '',
    city: ''
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Get the current user's ID
      const meRes = await axios.get("/api/auth/me");
      const id = meRes.data?.user?._id;
      
      if (!id) {
        toast.error('User ID not found. Please log in again.');
        router.push('/login');
        return;
      }
      
      setUserId(id);

      // Fetch user profile data
      try {
        const res = await axios.get(`/api/user/${id}`);
        
        if (!res.data) {
          toast.error('Profile data not found');
          return;
        }
        
        // Set profile data with fallbacks for missing fields
        setProfile({
          name: res.data.name || '',
          email: res.data.email || '',
          bio: res.data.bio || '',
          phone: res.data.phone || '',
          profileImage: res.data.profileImage || '',
          country: res.data.country || '',
          city: res.data.city || ''
        });
        
        // Notify user that data was loaded successfully
        toast.success('Profile data loaded successfully');
      } catch (profileError: any) {
        console.error('Error fetching profile:', profileError);
        const errorMessage = profileError.response?.data?.error || 'Failed to load profile data';
        toast.error(errorMessage);
      }
    } catch (authError: any) {
      console.error('Authentication error:', authError);
      toast.error('Authentication failed. Please log in again.');
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, PNG, GIF, WEBP)');
      return;
    }
    
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('Image size should be less than 5MB');
      return;
    }
    
    setUploading(true);
    const loadingToast = toast.loading('Uploading image...');
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await axios.post(`/api/user/${userId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      setProfile((prev) => ({ ...prev, profileImage: res.data.url }));
      toast.dismiss(loadingToast);
      toast.success('Image uploaded successfully');
    } catch (err: any) {
      toast.dismiss(loadingToast);
      const errorMessage = err.response?.data?.error || 'Failed to upload image';
      toast.error(errorMessage);
      console.error('Image upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const validateForm = () => {
    // Validate required fields
    if (!profile.name.trim()) {
      toast.error('Name is required');
      return false;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profile.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    
    // Validate bio length
    if (profile.bio && profile.bio.length > 1000) {
      toast.error('Bio must be less than 1000 characters');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }
    
    // Prevent multiple submissions
    if (submitting) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Show loading toast
      const loadingToast = toast.loading('Updating profile...');
      
      // Send the update request
      await axios.patch(`/api/user/${userId}`, profile);
      
      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success('Profile updated successfully');
      
      // Navigate back to dashboard
      router.push('/client/dashboard');
    } catch (error: any) {
      // Handle specific error messages from the API if available
      const errorMessage = error.response?.data?.error || 'Failed to update profile';
      toast.error(errorMessage);
      console.error('Profile update error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Edit Profile</h1>
          <button
            onClick={() => router.push('/client/dashboard')}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
          >
            Back to Dashboard
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Personal Info */}
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <i className="fas fa-user mr-2"></i>Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <i className="fas fa-envelope mr-2"></i>Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md bg-gray-100"
                  disabled
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <i className="fas fa-phone mr-2"></i>Phone
                </label>
                <input
                  type="text"
                  name="phone"
                  value={profile.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <i className="fas fa-map-marker-alt mr-2"></i>City
                </label>
                <input
                  type="text"
                  name="city"
                  value={profile.city}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <i className="fas fa-globe mr-2"></i>Country
                </label>
                <input
                  type="text"
                  name="country"
                  value={profile.country}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>

            {/* Right Column - Professional Info & Image */}
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <i className="fas fa-image mr-2"></i>Profile Image
                </label>
                <div className="flex items-center space-x-4">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200">
                    {profile.profileImage ? (
                      <img 
                        src={profile.profileImage} 
                        alt="Profile" 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {uploading && <p className="text-blue-500 text-sm mt-1">Uploading...</p>}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <i className="fas fa-info-circle mr-2"></i>Bio
                </label>
                <textarea
                  name="bio"
                  value={profile.bio}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                  rows={4}
                  maxLength={1000}
                  placeholder="Tell clients about yourself, your experience, and your expertise..."
                ></textarea>
                <div className="flex justify-end mt-1 text-sm text-gray-500">
                  <span className={`${profile.bio.length > 900 ? 'text-orange-500' : ''} ${profile.bio.length > 950 ? 'text-red-500' : ''}`}>
                    {profile.bio.length}/1000 characters
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.push('/client/dashboard')}
              disabled={submitting}
              className={`px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium ${submitting ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'text-gray-700 bg-white hover:bg-gray-50'}`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${submitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'}`}
            >
              {submitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : 'Save'}
            </button>
          </div>
        </form>
      </div>

      {/* Save Progress Card */}
      <div className="max-w-4xl mx-auto mt-6 bg-blue-600 rounded-lg shadow overflow-hidden">
        <div className="flex">
          <div className="w-1/2 p-6 text-white">
            <h2 className="text-2xl font-bold mb-4">Save Your Progress</h2>
            <p className="mb-4">Ensure your work is safe and up-to-date by saving your changes now.</p>
            <button 
              onClick={handleSubmit}
              disabled={submitting}
              className={`bg-white text-blue-600 px-4 py-2 rounded-md font-medium ${submitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-50'}`}
            >
              {submitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : 'Save'}
            </button>
          </div>
          <div className="w-1/2 bg-gray-800">
            <img 
              src="/keyboard-typing.jpg" 
              alt="Save Progress" 
              className="w-full h-full object-cover opacity-75"
            />
          </div>
        </div>
      </div>
    </div>
  );
}