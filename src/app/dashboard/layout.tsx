import Sidebar from "@/components/dashboard/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-mist/30 via-ivory to-mist/20">
      <Sidebar />
      <main className="flex-1 pt-20 pb-8 px-5 md:p-8 lg:p-10 overflow-x-hidden w-full">
        <div className="max-w-7xl mx-auto w-full">{children}</div>
      </main>
    </div>
  );
}
