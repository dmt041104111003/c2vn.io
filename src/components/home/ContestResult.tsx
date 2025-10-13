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
}

export default function ContestResult({ data, onBack }: { data: ContestResultData; onBack?: () => void }) {
  const total = data.questions.length;
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden w-full">
      <div className="p-4 sm:p-5 w-full space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Your Results</h3>
          {onBack && (
            <button onClick={onBack} className="text-sm px-3 py-1 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">Back</button>
          )}
        </div>

        <div className="text-sm text-gray-700 dark:text-gray-300">Score: <span className="font-semibold">{data.correctCount * 10}</span> ({data.correctCount}/{total} correct)</div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {data.questions.map((q, idx) => {
            const sel = data.selections[idx] || '';
            const isCorrect = sel && sel === q.correct;
            return (
              <div key={q.index} className="py-4">
                <div className="mb-2 text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100">{idx + 1}. {q.text}</div>
                <div className="space-y-2">
                  {q.options.map(opt => {
                    const isSel = sel === opt.key;
                    const isAns = q.correct === opt.key;
                    return (
                      <div key={opt.key} className={`p-2 rounded border text-sm sm:text-base ${isAns ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : isSel ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
                        <span className="font-semibold w-6 inline-block">{opt.key}.</span> {opt.text}
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
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


