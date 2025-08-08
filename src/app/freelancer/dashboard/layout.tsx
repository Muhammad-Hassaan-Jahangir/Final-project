import FreelancerSidebar from "../../../components/FreelancerSidebar";
import LogoutButton from "../../../components/LogoutButton";

export default function FreelancerLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-gray-100">
            <FreelancerSidebar />
            <div className="flex-1 md:ml-48 p-4 md:p-8 transition-all duration-300 ease-in-out">
                {children}
            </div>
        </div>
    );
}
