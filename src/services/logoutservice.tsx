import { httpaxios } from "../helper/axioshelper";

export async function Logout() {
    try {
        const result = await httpaxios.post("/api/logout", {});
        return result.data; // Returning the response data
    } catch (error) {
        console.error("Error during logout:", error);
        throw error; // Optionally throw the error to be handled elsewhere
    }
}
