"use client";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { postJob } from "../../../services/postjobservice";

function PostJobPage() {
  const [job, setJob] = useState({
    title: "",
    description: "",
    budget: "",
    deadline: "",
  });

  const [loading, setLoading] = useState(false);

  const SubmitJob = async (event: any) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await postJob({
        ...job,
        budget: parseFloat(job.budget),
      });

      toast.success("Job posted successfully", { position: "top-center" });
      setJob({ title: "", description: "", budget: "", deadline: "" });
    } catch (error) {
      console.error("Error posting job:", error);
      toast.error("Error posting job", { position: "top-right" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-4 py-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="https://illustrations.popsy.co/white/remote-work.svg"
          alt="Remote work background"
          className="absolute bottom-20 right-0 w-[500px] opacity-100 pointer-events-none select-none"
        />
        <div className="absolute inset-0 bg-black opacity-10"></div>
      </div>

      <div className="z-10 relative bg-white shadow-2xl rounded-3xl p-10 md:p-12 w-full max-w-lg">
        <h1 className="text-3xl font-extrabold text-center text-purple-700 mb-8">Post a Job</h1>
        <form onSubmit={SubmitJob} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700">Job Title</label>
            <input
              type="text"
              value={job.title}
              onChange={(e) => setJob({ ...job, title: e.target.value })}
              className="mt-2 w-full p-3 rounded-xl border border-gray-300 text-black"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">Description</label>
            <textarea
              value={job.description}
              onChange={(e) => setJob({ ...job, description: e.target.value })}
              rows={4}
              className="mt-2 w-full p-3 rounded-xl border border-gray-300 text-black"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">Budget ($)</label>
            <input
              type="number"
              value={job.budget}
              onChange={(e) => setJob({ ...job, budget: e.target.value })}
              className="mt-2 w-full p-3 rounded-xl border border-gray-300 text-black"
              min={0}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">Deadline</label>
            <input
              type="date"
              value={job.deadline}
              onChange={(e) => setJob({ ...job, deadline: e.target.value })}
              className="mt-2 w-full p-3 rounded-xl border border-gray-300 text-black"
              required
            />
          </div>

          <div className="flex justify-between gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition duration-300 disabled:opacity-50"
            >
              {loading ? "Posting..." : "Post Job"}
            </button>

            <button
              type="reset"
              onClick={() => setJob({ title: "", description: "", budget: "", deadline: "" })}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default PostJobPage;
