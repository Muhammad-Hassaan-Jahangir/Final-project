export default async function LoginPage() {
  await new Promise(resolve => setTimeout(resolve, 3000)); // 3 seconds
  return <div>Login Page</div>;
}