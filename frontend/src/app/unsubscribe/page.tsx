import Link from "next/link";
import { CheckCircle, XCircle, ArrowLeft } from "lucide-react";

export default function UnsubscribePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const success = searchParams.success === "true";
  const error = searchParams.error;
  const email =
    typeof searchParams.email === "string" ? searchParams.email : "";

  return (
    <div className="min-h-screen w-full bg-slate-950 text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-8 shadow-2xl text-center">
        {success ? (
          <>
            <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <CheckCircle size={32} />
            </div>
            <h1 className="text-2xl font-bold mb-2">Unsubscribed</h1>
            <p className="text-slate-400 mb-8">
              {email ? (
                <>
                  <strong>{email}</strong> has been removed from our daily
                  report list.
                </>
              ) : (
                "You have been removed from our daily report list."
              )}
            </p>
            <div className="p-4 bg-slate-800/50 rounded-lg mb-8">
              <p className="text-sm text-slate-500">
                Did this by mistake? You can always resubscribe from the home
                page.
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
              <XCircle size={32} />
            </div>
            <h1 className="text-2xl font-bold mb-2">Unable to Unsubscribe</h1>
            <p className="text-slate-400 mb-8">
              {error === "invalid_token"
                ? "The link you clicked is invalid or has expired."
                : "An error occurred while processing your request. Please try again later."}
            </p>
          </>
        )}

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sky-400 hover:text-sky-300 transition-colors font-medium"
        >
          <ArrowLeft size={16} />
          Return to Home
        </Link>
      </div>
    </div>
  );
}
