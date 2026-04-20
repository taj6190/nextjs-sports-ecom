import Link from "next/link";

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-sm text-slate-500 mt-1">Detailed analytics are available on the <Link href="/admin" className="text-blue-400 hover:text-blue-300">Dashboard</Link></p>
      </div>
      <div className="p-8 bg-slate-900/50 border border-slate-800/50 rounded-2xl text-center">
        <p className="text-slate-400">Analytics data including revenue by product, category, daily trends, and order status distribution are available on the main dashboard.</p>
        <Link href="/admin" className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
