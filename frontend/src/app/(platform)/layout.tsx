import { HistoryProvider } from "@/context/HistoryContext";

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <HistoryProvider>
      <div className="min-h-screen w-full bg-slate-950 text-slate-200">
        {children}
      </div>
    </HistoryProvider>
  );
}
