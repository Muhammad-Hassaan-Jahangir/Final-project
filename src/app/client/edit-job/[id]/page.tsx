'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';

export default function EditJobPage() {
  const { id } = useParams();
  const router = useRouter();

  const [form, setForm] = useState({
    title: '',
    description: '',
    budget: '',
    deadline: '',
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await axios.get(`/api/client/view-jobs/${id}`, {
          withCredentials: true,
        });
        const job = res.data.job;
        setForm({
          title: job.title,
          description: job.description,
          budget: job.budget.toString(),
          deadline: job.deadline.slice(0, 10), // yyyy-mm-dd
        });
      } catch (err) {
        setError('Failed to load job');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      await axios.put(`/api/client/view-jobs/${id}`, form, {
        withCredentials: true,
      });
      alert('Job updated successfully');
      router.push('/client/view-jobs');
    } catch (err) {
      alert('Update failed');
    }
  };

  if (loading) return <p className="p-4">Loading...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Edit Job</h1>
      <input
        name="title"
        value={form.title}
        onChange={handleChange}
        placeholder="Title"
        className="w-full p-2 border mb-3 rounded"
      />
      <textarea
        name="description"
        value={form.description}
        onChange={handleChange}
        placeholder="Description"
        className="w-full p-2 border mb-3 rounded"
      />
      <input
        name="budget"
        type="number"
        value={form.budget}
        onChange={handleChange}
        placeholder="Budget"
        className="w-full p-2 border mb-3 rounded"
      />
      <input
        name="deadline"
        type="date"
        value={form.deadline}
        onChange={handleChange}
        className="w-full p-2 border mb-4 rounded"
      />
      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Update Job
      </button>
    </div>
  );
}
