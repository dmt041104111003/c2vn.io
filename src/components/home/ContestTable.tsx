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
        let values: string[][] = data.data?.values || [];
        if (values.length > 1) {
          const headers = values[0].map((h: string) => (h || '').toString().trim().toLowerCase());
          const emailIdx = headers.indexOf('your-email');
          if (emailIdx >= 0) {
            const maskEmail = (email: string) => {
              const str = (email || '').toString();
              const at = str.indexOf('@');
              if (at <= 0) return str;
              const local = str.slice(0, at);
              const domain = str.slice(at);
              const keep = Math.ceil(local.length * 0.5);
              const masked = local.slice(0, keep) + '*'.repeat(Math.max(0, local.length - keep));
              return masked + domain;
            };
            values = [values[0], ...values.slice(1).map((r: string[]) => {
              const c = [...r];
              c[emailIdx] = maskEmail(c[emailIdx] || '');
              return c;
            })];
          }
        }
        if (!cancelled) setRows(values);
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [page, pageSize]);

  if (loading) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 animate-pulse">
        <div className="p-4">
          <div className="h-5 w-44 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
          <div className="h-8 w-full bg-gray-200 dark:bg-gray-700 rounded mb-2" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 w-full bg-gray-200 dark:bg-gray-700 rounded mb-2" />
          ))}
        </div>
      </div>
    );
  }
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


