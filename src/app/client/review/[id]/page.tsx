'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';

type Project = {
  _id: string;
  title: string;
  description: string;
  budget: number;
  status: string;
  assignedTo: {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
};

export default function ReviewPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await axios.get(`/api/projects/${params.id}`, {
          withCredentials: true
        });
        setProject(res.data.project);
      } catch (err) {
        console.error('Error fetching project:', err);
        setError('Failed to load project details');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProject();
    }
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');

    try {
      if (!project?.assignedTo?._id) {
        throw new Error('Freelancer information is missing');
      }

      await axios.post('/api/reviews', {
        projectId: project._id,
        revieweeId: project.assignedTo._id,
        rating,
        comment,
        reviewType: 'client_to_freelancer'
      }, {
        withCredentials: true
      });

      setSubmitSuccess(true);
      // Reset form
      setRating(5);
      setComment('');
      
      // Redirect after successful submission
      setTimeout(() => {
        router.push('/client/ongoing-projects');
      }, 2000);
    } catch (err: any) {
      console.error('Error submitting review:', err);
      setSubmitError(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
        <div className="mt-4">
          <Link href="/client/ongoing-projects">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
              Back to Projects
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
          Project not found
        </div>
        <div className="mt-4">
          <Link href="/client/ongoing-projects">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
              Back to Projects
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Leave a Review</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-2">{project.title}</h2>
        <p className="text-gray-600 mb-4">{project.description}</p>
        
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
            <img 
              src={project.assignedTo?.profileImage || '/default-avatar.png'} 
              alt={project.assignedTo?.name || 'Freelancer'}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="font-medium">{project.assignedTo?.name}</p>
            <p className="text-sm text-gray-500">{project.assignedTo?.email}</p>
          </div>
        </div>
      </div>

      {submitSuccess ? (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
          Review submitted successfully! Redirecting...
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {submitError}
            </div>
          )}
          
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">Rating</label>
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="text-3xl focus:outline-none"
                >
                  <span className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}>★</span>
                </button>
              ))}
              <span className="ml-2 text-gray-600">{rating} out of 5</span>
            </div>
          </div>
          
          <div className="mb-6">
            <label htmlFor="comment" className="block text-gray-700 font-medium mb-2">
              Your Review
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Share your experience working with this freelancer..."
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Link href="/client/ongoing-projects">
              <button 
                type="button" 
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
              >
                Cancel
              </button>
            </Link>
            <button
              type="submit"
              disabled={submitting || !comment}
              className={`px-4 py-2 rounded ${submitting || !comment ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}