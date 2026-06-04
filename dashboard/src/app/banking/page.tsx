"use client";

export default function BankingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Banking
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Bank account connections and transaction feeds
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
        <div className="text-4xl mb-4">🏦</div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Banking Integration Coming Soon
        </h2>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          Direct bank feeds and transaction syncing will be configured here.
          Contact your administrator to set up bank connections for Park Vista communities.
        </p>
      </div>
    </div>
  );
}
