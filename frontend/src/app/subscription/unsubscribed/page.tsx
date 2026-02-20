import { Suspense } from "react";
import UnsubscribedClient from "./UnsubscribedClient";

export default function UnsubscribedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
          Loading...
        </div>
      }
    >
      <UnsubscribedClient />
    </Suspense>
  );
}
