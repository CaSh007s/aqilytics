export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-sky-500/30">
      <main className="pt-24 min-h-screen">{children}</main>
    </div>
  );
}
