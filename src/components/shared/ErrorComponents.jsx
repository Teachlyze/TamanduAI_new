import React from 'react';

export const ErrorFallback = ({ error, resetErrorBoundary }) => {
  const errorMessage = error?.message || 'An unknown error occurred';
  
  return (
    <div role="alert" className="p-4 max-w-md mx-auto mt-20 text-center">
      <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
      <pre className="text-red-500 mb-4 whitespace-pre-wrap">{errorMessage}</pre>
      {resetErrorBoundary && (
        <button
          onClick={resetErrorBoundary}
          className="px-4 py-2 bg-blue-600 text-slate-900 dark:text-white rounded hover:bg-blue-700 transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  );
};

export const Loading = () => (
  <div className="w-full py-10 text-center text-gray-700 dark:text-gray-400">Loading...</div>
);
