"use client";

import React from "react";
import { useToastContext } from "~/components/toast-provider";
import ContestResult, { ContestResultData } from "~/components/home/ContestResult";

type QuizQuestion = {
  index: number;
  stt: string;
  text: string;
  options: { key: 'A' | 'B' | 'C' | 'D'; text: string }[];
  correct: 'A' | 'B' | 'C' | 'D' | '';
  explanation: string;
};

export default function ContestQuestions({ onBack }: { onBack?: () => void }) {
  const [questions, setQuestions] = React.useState<QuizQuestion[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [current, setCurrent] = React.useState(0);
  const [selected, setSelected] = React.useState<'A' | 'B' | 'C' | 'D' | ''>('');
  const [correctCount, setCorrectCount] = React.useState(0);
  const [submitting, setSubmitting] = React.useState(false);
  const { showSuccess, showError } = useToastContext();
  const [showResult, setShowResult] = React.useState(false);
  const [resultData, setResultData] = React.useState<ContestResultData | null>(null);
  const selectionsRef = React.useRef<Array<'A' | 'B' | 'C' | 'D' | ''>>([]);
  const displayOptionsRef = React.useRef<Array<Array<{ key: 'A' | 'B' | 'C' | 'D'; text: string }>>>([]);

  function shuffle<T>(arr: T[]): T[] {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/contest/questions');
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data?.error || 'Failed');
        const values: string[][] = data?.data?.values || [];
        if (values.length > 0) {
          const headers = values[0].map((h: string) => (h || '').trim().toLowerCase());
          const idxSTT = headers.indexOf('stt');
          const idxQ = headers.indexOf('câu hỏi');
          const idxA = headers.indexOf('a');
          const idxB = headers.indexOf('b');
          const idxC = headers.indexOf('c');
          const idxD = headers.indexOf('d');
          const idxCorrect = headers.indexOf('đúng');
          const idxExplain = headers.indexOf('giải thích');

          const parsed: QuizQuestion[] = values.slice(1).map((row: string[], i: number) => ({
            index: i,
            stt: (row[idxSTT] ?? '').toString(),
            text: (row[idxQ] ?? '').toString(),
            options: [
              { key: 'A', text: (row[idxA] ?? '').toString() },
              { key: 'B', text: (row[idxB] ?? '').toString() },
              { key: 'C', text: (row[idxC] ?? '').toString() },
              { key: 'D', text: (row[idxD] ?? '').toString() },
            ],
            correct: ((row[idxCorrect] ?? '').toString().trim().toUpperCase() as any) || '',
            explanation: (row[idxExplain] ?? '').toString(),
          }));
          if (!cancelled) {
            setQuestions(parsed);
            selectionsRef.current = new Array(parsed.length).fill('');
            displayOptionsRef.current = parsed.map(q => shuffle(q.options));
          }
        } else {
          if (!cancelled) setQuestions([]);
        }
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden w-full">
        <div className="p-4 sm:p-5 w-full animate-pulse space-y-4">
          <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="space-y-2">
            <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded" />
            ))}
          </div>
          <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    );
  }
  if (error) return <div className="text-sm text-red-600">Error: {error}</div>;
  if (questions.length === 0) return <div className="text-sm text-gray-500">No questions available</div>;

  if (showResult && resultData) {
    return <ContestResult data={resultData} onBack={onBack} />;
  }

  const q = questions[current];
  const isLast = current === questions.length - 1;
  const displayOptions = (displayOptionsRef.current[current] || q.options);
  function submitAnswer() {
    if (!selected) return;
    selectionsRef.current[current] = selected;
    if (selected === q.correct) setCorrectCount((c) => c + 1);
    if (!isLast) {
      setSelected('');
      setCurrent((i) => i + 1);
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden w-full">
      <div className="p-4 sm:p-5 w-full space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Quiz: {current + 1}/{questions.length}</h3>
        </div>

        <div className="space-y-3">
          <div className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100">{q.text}</div>
          <div className={`space-y-2 ${submitting ? 'opacity-70 pointer-events-none' : ''}`}>
            {displayOptions.map((opt) => (
              <label key={opt.key} className={`flex items-center gap-2 p-2 rounded border ${selected === opt.key ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
                <input
                  type="radio"
                  name={`q-${q.index}`}
                  value={opt.key}
                  checked={selected === opt.key}
                  onChange={() => setSelected(opt.key)}
                  disabled={submitting}
                />
                <span className="text-sm sm:text-base">{opt.text}</span>
              </label>
            ))}
          </div>
        </div>

        {!isLast ? (
          <button
            className="mt-2 inline-flex items-center px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            disabled={!selected || submitting}
            onClick={submitAnswer}
          >
            Next
          </button>
        ) : (
          <button
            className="mt-2 inline-flex items-center justify-center whitespace-nowrap rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:text-success text-sm sm:text-base bg-blue-600 dark:bg-white px-4 sm:px-5 py-2 sm:py-2.5 font-semibold text-white dark:text-blue-900 shadow-lg hover:bg-blue-700 dark:hover:bg-gray-100"
            disabled={submitting || !selected}
            onClick={async () => {
              if (selected) submitAnswer();
              setSubmitting(true);
              try {
                const finalCorrect = selectionsRef.current.reduce((acc, sel, i) => acc + (sel && sel === questions[i].correct ? 1 : 0), 0);
                const score = finalCorrect * 10;
                const email = sessionStorage.getItem('contest_email') || '';
                if (!email) throw new Error('Missing email');
                const res = await fetch('/api/contest/submit', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email, score })
                });
                const data = await res.json();
                if (!res.ok || !data.success) {
                  throw new Error(data?.error || 'Submit failed');
                }
                showSuccess('Submitted', 'Your result has been recorded');
                setResultData({ questions, selections: selectionsRef.current, correctCount: finalCorrect, displayOptions: displayOptionsRef.current });
                setShowResult(true);
              } catch (e) {
                showError('Submit failed', (e as Error).message);
              } finally {
                setSubmitting(false);
              }
            }}
          >
            Submit Result
          </button>
        )}
      </div>
    </div>
  );
}


