export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Stub pass-through for now. The real chrome (VhsHeader + AppTabBar) is
  // wired in Unit 4; this keeps the (app) route group valid in the interim.
  return <>{children}</>;
}
