import Sidebar from "@/components/Sidebar";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex bg-slate-950 text-slate-200 selection:bg-sky-500/30 overflow-hidden">
      <Sidebar />
      <main className="flex-1 h-screen overflow-auto relative">{children}</main>
    </div>
  );
}
