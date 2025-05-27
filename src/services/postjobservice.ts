import axios from "axios";

export const postJob = async (jobData: any) => {
  try {
    console.log("Sending jobData:", jobData);
    const response = await axios.post("/api/client/post-job", jobData);  // <-- Use /api/post-job here
    return response.data;
  } catch (error) {
    console.error("Axios error in postJob:", error);
    throw error;
  }
};
