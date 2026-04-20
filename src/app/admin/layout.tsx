import AdminSidebar from "@/components/layout/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200">
      <AdminSidebar />
      <main className="flex-1 overflow-x-hidden">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
