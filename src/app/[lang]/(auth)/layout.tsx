export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Pass-through: auth pages keep their standalone full-screen hero. No app
  // chrome (VhsHeader/AppTabBar) renders here.
  return <>{children}</>;
}
