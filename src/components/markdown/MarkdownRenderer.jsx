import React from 'react';
import ReactMarkdown from 'react-markdown';

export function MarkdownRenderer({ content, className = '' }) {
  return (
    <div className={`prose max-w-none ${className}`}>
      <ReactMarkdown>
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default MarkdownRenderer;
