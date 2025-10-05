import React, { Suspense } from 'react';

const DefaultFallback = () => (
  <div className="w-full py-10 text-center text-gray-500">Carregando...</div>
);

export function LoadingSuspense({ children, fallback = <DefaultFallback /> }) {
  return <Suspense fallback={fallback}>{children}</Suspense>;
}

export default LoadingSuspense;
