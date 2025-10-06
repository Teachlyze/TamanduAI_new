import React from 'react';

export default function CookiesPolicy() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Política de Cookies</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-4">
        Esta página explica como utilizamos cookies para melhorar sua experiência.
      </p>
      <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-300">
        <li>Cookies essenciais para funcionamento do site.</li>
        <li>Cookies de desempenho para métricas de uso.</li>
        <li>Cookies de preferência para lembrar suas escolhas.</li>
      </ul>
    </div>
  );
}
