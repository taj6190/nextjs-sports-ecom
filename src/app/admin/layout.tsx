import AdminSidebar from "@/components/layout/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#0a0a0f] text-white/90">
      <AdminSidebar />
      <main className="flex-1 overflow-x-hidden min-h-screen">
        <div className="p-5 lg:p-8 max-w-[1400px]">{children}</div>
      </main>
    </div>
  );
}
