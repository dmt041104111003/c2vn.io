"use client";

import React from "react";

type AnswerKey = 'A' | 'B' | 'C' | 'D' | '';
type QuizQuestion = {
  index: number;
  stt: string;
  text: string;
  options: { key: 'A' | 'B' | 'C' | 'D'; text: string }[];
  correct: 'A' | 'B' | 'C' | 'D' | '';
  explanation: string;
};

export interface ContestResultData {
  questions: QuizQuestion[];
  selections: AnswerKey[];
  correctCount: number;
  displayOptions?: Array<Array<{ key: 'A' | 'B' | 'C' | 'D'; text: string }>>;
}

export default function ContestResult({ data, onBack }: { data: ContestResultData; onBack?: () => void }) {
  const total = data.questions.length;
  const [current, setCurrent] = React.useState(0);
  const q = data.questions[current];
  const sel = data.selections[current] || '';
  const isCorrect = sel && sel === q.correct;
  const isLast = current === total - 1;
  const opts = (data.displayOptions && data.displayOptions[current]) ? data.displayOptions[current] : q.options;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden w-full">
      <div className="p-4 sm:p-5 w-full space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Your Results {current + 1}/{total}</h3>
          {onBack && (
            <button onClick={onBack} className="text-sm px-3 py-1 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">Back</button>
          )}
        </div>

        <div className="text-sm text-gray-700 dark:text-gray-300">Score: <span className="font-semibold">{data.correctCount * 10}</span> ({data.correctCount}/{total} correct)</div>

        <div className="py-2">
          <div className="mb-2 text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100">{current + 1}. {q.text}</div>
          <div className="space-y-2">
            {opts.map(opt => {
              const isSel = sel === opt.key;
              const isAns = q.correct === opt.key;
              return (
                <div key={opt.key} className={`p-2 rounded border text-sm sm:text-base ${isAns ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : isSel ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
                  {opt.text}
                  {isSel && (
                    <span className={`ml-2 text-xs ${isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {isCorrect ? '(your choice - correct)' : '(your choice)'}
                    </span>
                  )}
                  {isAns && !isSel && (
                    <span className="ml-2 text-xs text-green-600 dark:text-green-400">(correct)</span>
                  )}
                </div>
              );
            })}
          </div>
          {q.explanation && (
            <div className="mt-2 text-sm text-gray-700 dark:text-gray-300"><span className="font-medium">Explanation:</span> {q.explanation}</div>
          )}
          <div className="mt-4 flex justify-between">
            <button
              className="inline-flex items-center px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
              disabled={current === 0}
              onClick={() => setCurrent(i => Math.max(0, i - 1))}
            >
              Prev
            </button>
            <button
              className="inline-flex items-center px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
              disabled={isLast}
              onClick={() => setCurrent(i => Math.min(total - 1, i + 1))}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


