// src/components/SkipLinks.jsx
import React from 'react';

const SkipLinks = () => {
  const skipLinks = [
    { href: '#main-content', label: 'Pular para conteúdo principal' },
    { href: '#sidebar', label: 'Pular para navegação lateral' },
    { href: '#footer', label: 'Pular para rodapé' },
  ];

  return (
    <div className="sr-only focus-within:not-sr-only focus-within:absolute focus-within:top-0 focus-within:left-0 focus-within:z-50 focus-within:bg-blue-600 focus-within:text-slate-900 dark:text-white focus-within:p-2 focus-within:rounded focus-within:shadow-lg">
      <nav aria-label="Links de navegação rápida">
        <ul className="flex space-x-2">
          {skipLinks.map((link, index) => (
            <li key={index}>
              <a
                href={link.href}
                className="inline-block px-3 py-2 text-sm font-medium hover:bg-blue-700 focus:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded transition-colors"
                onFocus={(e) => {
                  // Scroll to target when focused
                  const target = document.querySelector(link.href);
                  if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    // Add temporary tabIndex to make element focusable
                    target.setAttribute('tabIndex', '-1');
                    target.focus();
                    // Remove tabIndex after focus
                    setTimeout(() => {
                      target.removeAttribute('tabIndex');
                    }, 100);
                  }
                }}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default SkipLinks;
