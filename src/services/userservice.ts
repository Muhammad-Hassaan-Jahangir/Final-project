import { httpaxios } from "../helper/axioshelper";
export async function setuser(user: any) {
    console.log("User in setUser function:", user); // Log the task object to see its structure
    try {
        const result = await httpaxios.post("/api/user", user);
        return result.data; // Returning the response data
    } catch (error) {
        console.error("Error adding user:", error);
        throw error; // Optionally throw the error to be handled elsewhere
    }
}
