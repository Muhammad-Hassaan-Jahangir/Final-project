"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";

function PostJobPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const freelancerId = searchParams.get('freelancer');
  const [freelancerDetails, setFreelancerDetails] = useState<any>(null);
  const [isInvitation, setIsInvitation] = useState(false);
  const [invitationMessage, setInvitationMessage] = useState('');
  const [job, setJob] = useState({
    title: "",
    description: "",
    category: "",
    subcategory: "",
    skills: "",
    jobType: "",
    basicBudget: "",
    expertBudget: "",
    deadline: "",
    additionalRequirements: "",
  });
  const [attachments, setAttachments] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  
  useEffect(() => {
    if (freelancerId) {
      setIsInvitation(true);
      fetchFreelancerDetails(freelancerId);
    }
  }, [freelancerId]);
  
  const fetchFreelancerDetails = async (id: string) => {
    try {
      const res = await axios.get(`/api/freelancers/${id}`);
      setFreelancerDetails(res.data);
    } catch (err) {
      console.error('Error fetching freelancer details:', err);
      toast.error('Failed to load freelancer details');
    }
  };

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setAttachments(Array.from(e.target.files));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setJob({ ...job, [e.target.name]: e.target.value });
  };

  const handleCancel = () => {
    setJob({
      title: "",
      description: "",
      category: "",
      subcategory: "",
      skills: "",
      jobType: "",
      basicBudget: "",
      expertBudget: "",
      deadline: "",
      additionalRequirements: "",
    });
    setAttachments([]);
    setImage(null);
    setImagePreview("");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setUploading(true);
    try {
      // First post the job
      const formData = new FormData();
      formData.append("title", job.title);
      formData.append("description", job.description);
      formData.append("category", job.category);
      formData.append("subcategory", job.subcategory);
      formData.append("skills", job.skills);
      formData.append("jobType", job.jobType);
      formData.append("basicBudget", job.basicBudget);
      formData.append("expertBudget", job.expertBudget);
      formData.append("deadline", job.deadline);
      formData.append("additionalRequirements", job.additionalRequirements);
      attachments.forEach((file) => formData.append("attachments", file));
      if (image) formData.append("image", image);
      
      const res = await fetch("/api/client/post-job", {
        method: "POST",
        body: formData,
      });
      
      if (res.ok) {
        const jobData = await res.json();
        console.log('Job data response:', jobData);
        
        // If this is an invitation, send the invitation to the freelancer
        if (isInvitation && freelancerId) {
          try {
            await axios.post('/api/client/invitations', {
              jobId: jobData.jobId,
              freelancerId: freelancerId,
              message: invitationMessage
            });
            toast.success("Job posted and invitation sent successfully", { position: "top-center" });
          } catch (inviteError) {
            console.error('Error sending invitation:', inviteError);
            toast.error("Job posted but failed to send invitation", { position: "top-right" });
          }
        } else {
          toast.success("Job posted successfully", { position: "top-center" });
        }
        
        handleCancel();
        // Redirect to view jobs page
        router.push('/client/view-jobs');
      } else {
        toast.error("Error posting job", { position: "top-right" });
      }
    } catch (error) {
      console.error('Error in job submission:', error);
      toast.error("Error posting job", { position: "top-right" });
    } finally {
      setUploading(false);
      setLoading(false);
    }
  };

  return (
    <main className="bg-white flex flex-col items-center py-6 h-full">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg p-6 md:p-8">
        <h1 className="text-xl font-bold mb-2">{isInvitation ? 'Send Job Invitation' : 'Post a Job'}</h1>
        {isInvitation && freelancerDetails && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="font-medium text-blue-800 text-sm">Sending invitation to:</p>
            <div className="flex items-center mt-1.5">
              {freelancerDetails.profileImage ? (
                <img src={freelancerDetails.profileImage} alt={freelancerDetails.name} className="w-8 h-8 rounded-full mr-2" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-300 mr-2 flex items-center justify-center">
                  <span className="text-gray-600 text-sm">{freelancerDetails.name?.charAt(0)}</span>
                </div>
              )}
              <div>
                <p className="font-medium text-sm">{freelancerDetails.name}</p>
                <p className="text-xs text-gray-600">{freelancerDetails.email}</p>
              </div>
            </div>
          </div>
        )}
        <p className="mb-4 text-gray-500 text-sm">Fill in the details below to {isInvitation ? 'send a job invitation' : 'post a new job'}.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium text-sm mb-1">Job Title</label>
            <textarea name="title" value={job.title} onChange={handleChange} className="w-full border rounded px-3 py-1.5 text-sm h-8" required />
          </div>
          <div>
            <label className="block font-medium text-sm mb-1">Job Description</label>
            <textarea name="description" value={job.description} onChange={handleChange} className="w-full border rounded px-3 py-1.5 text-sm h-16" required />
          </div>
          <div>
            <label className="block font-medium text-sm mb-1">Category</label>
            <input type="text" name="category" value={job.category} onChange={handleChange} className="w-full border rounded px-3 py-1.5 text-sm h-8" />
          </div>
          <div>
            <label className="block font-medium text-sm mb-1">Subcategory</label>
            <input type="text" name="subcategory" value={job.subcategory} onChange={handleChange} className="w-full border rounded px-3 py-1.5 text-sm h-8" />
          </div>
          <div>
            <label className="block font-medium text-sm mb-1">Skills</label>
            <input type="text" name="skills" value={job.skills} onChange={handleChange} className="w-full border rounded px-3 py-1.5 text-sm h-8" />
          </div>
          <div>
            <label className="block font-medium text-sm mb-1">Job Type</label>
            <input type="text" name="jobType" value={job.jobType} onChange={handleChange} className="w-full border rounded px-3 py-1.5 text-sm h-8" />
          </div>
          <div>
            <label className="block font-medium text-sm mb-1">Add Attachments</label>
            <input type="file" multiple onChange={handleAttachmentChange} className="w-full border rounded px-3 py-1 text-xs h-8" />
            {attachments.length > 0 && (
              <div className="text-xs text-gray-500 mt-0.5">{attachments.length} file(s) selected</div>
            )}
            {uploading && <span className="text-blue-500 text-xs ml-2">Uploading...</span>}
          </div>
          <div>
            <label className="block font-medium text-sm mb-1">Project Image</label>
            <input type="file" accept="image/*" onChange={handleImageChange} className="w-full border rounded px-3 py-1 text-xs h-8" />
            {image && <span className="text-xs text-gray-500">{image.name}</span>}
            {imagePreview && <img src={imagePreview} alt="Preview" className="mt-1 h-16 rounded" />}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-sm mb-1">Basic Budget</label>
              <input type="text" name="basicBudget" value={job.basicBudget} onChange={handleChange} className="w-full border rounded px-3 py-1.5 text-sm h-8" />
            </div>
            <div>
              <label className="block font-medium text-sm mb-1">Expert Budget</label>
              <input type="text" name="expertBudget" value={job.expertBudget} onChange={handleChange} className="w-full border rounded px-3 py-1.5 text-sm h-8" />
            </div>
          </div>
          <div>
            <label className="block font-medium text-sm mb-1">Deadline</label>
            <input
              type="date"
              name="deadline"
              value={job.deadline}
              onChange={handleChange}
              className="w-full border rounded px-3 py-1.5 text-sm h-8"
              required
            />
          </div>
          <div>
            <label className="block font-medium text-sm mb-1">Additional Requirements</label>
            <textarea name="additionalRequirements" value={job.additionalRequirements} onChange={handleChange} className="w-full border rounded px-3 py-1.5 text-sm h-16" />
          </div>
          {isInvitation && (
            <div className="mb-4">
              <label className="block font-medium text-sm mb-1">Invitation Message (Optional)</label>
              <textarea 
                value={invitationMessage} 
                onChange={(e) => setInvitationMessage(e.target.value)} 
                className="w-full border rounded px-3 py-1.5 text-sm h-16" 
                placeholder="Add a personal message to the freelancer..."
              />
            </div>
          )}
          
          <div className="flex justify-between gap-4 mt-6 w-full">
            <button type="button" onClick={handleCancel} className="flex-1 bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-semibold text-sm hover:bg-gray-400 transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 bg-indigo-500 text-white px-6 py-2 rounded-lg font-semibold text-sm hover:bg-indigo-600 transition-colors">
              {loading ? "Posting..." : isInvitation ? "Send Invitation" : "Post Job"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default PostJobPage;
