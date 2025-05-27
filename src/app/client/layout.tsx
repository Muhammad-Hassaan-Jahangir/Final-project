import LogoutButton from "../../components/LogoutButton"; // Make sure this path is correct

export default function LayoutWithLogout({ children }: { children: React.ReactNode }) {
    return (
        <div>
            <LogoutButton /> {/* No error should appear here */}
            <div>{children}</div>
        </div>
    );
}
