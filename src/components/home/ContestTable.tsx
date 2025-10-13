"use client";

import React from "react";

export default function ContestTable({ page = 1, pageSize = 20 }: { page?: number; pageSize?: number }) {
  const [rows, setRows] = React.useState<string[][] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('pageSize', String(pageSize));
        const res = await fetch(`/api/contest/list?${params.toString()}`);
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data?.error || 'Failed');
        if (!cancelled) setRows(data.data?.values || []);
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [page, pageSize]);

  if (loading) return <div className="text-sm text-gray-500">Loading...</div>;
  if (error) return <div className="text-sm text-red-600">Error: {error}</div>;
  if (!rows || rows.length === 0) return <div className="text-sm text-gray-500">No data</div>;

  return (
    <div className="overflow-auto rounded-md ring-1 ring-gray-200 dark:ring-gray-700 w-full">
      <table className="min-w-full text-sm w-full">
        <thead className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
          <tr>
            {rows[0].map((cell, i) => (
              <th key={i} className="px-3 py-2 text-left font-semibold border-b border-gray-200 dark:border-gray-700">{cell}</th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900">
          {rows.slice(1).map((r, ri) => (
            <tr key={ri} className="border-b border-gray-100 dark:border-gray-800">
              {r.map((cell, ci) => (
                <td key={ci} className="px-3 py-2 whitespace-nowrap text-gray-800 dark:text-gray-100">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


