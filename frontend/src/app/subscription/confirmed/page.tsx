import { Suspense } from "react";
import ConfirmedClient from "./ConfirmedClient";

export default function SubscriptionConfirmedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
          Loading...
        </div>
      }
    >
      <ConfirmedClient />
    </Suspense>
  );
}
