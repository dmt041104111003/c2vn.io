"use client";

import React from "react";
import { useToastContext } from "~/components/toast-provider";

export default function ContestForm() {
  const { showSuccess, showError } = useToastContext();
  const [form, setForm] = React.useState({ email: "", score: "" });
  const [submitting, setSubmitting] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/contest/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, score: form.score }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error || "Submit failed");
      }
      showSuccess("Submitted", "Your response has been recorded");
      setForm({ email: "", score: "" });
    } catch (e) {
      showError("Submit failed", (e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden w-full">
      <div className="p-4 sm:p-5 w-full">
        <div className="grid grid-cols-1 gap-4 sm:gap-6 w-full">
          <form onSubmit={onSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-sm"
                  placeholder="you@gmail.com"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Score</label>
                <input
                  type="number"
                  step="any"
                  value={form.score}
                  onChange={(e) => setForm((p) => ({ ...p, score: e.target.value }))}
                  className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-sm"
                  placeholder="Optional"
                />
              </div>
              <button
                type="submit"
                disabled={submitting || !form.email.trim()}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:text-success text-sm sm:text-base bg-blue-600 dark:bg-white px-4 sm:px-5 py-2 sm:py-2.5 font-semibold text-white dark:text-blue-900 shadow-lg hover:bg-blue-700 dark:hover:bg-gray-100 w-full md:w-auto"
              >
                {submitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


