import { httpaxios } from "../helper/axioshelper";
export async function CheckLogin(login: any) {
    console.log("Task in Addtask function:", login); // Log the task object to see its structure
    try {
        const result = await httpaxios.post("/api/login", login);
        return result.data; // Returning the response data
    } catch (error) {
        console.error("Error adding task:", error);
        throw error; // Optionally throw the error to be handled elsewhere
    }
}
