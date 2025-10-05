import React from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListItemNode, ListNode } from '@lexical/list';
import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { TRANSFORMERS } from '@lexical/markdown';

import ToolbarPlugin from './plugins/ToolbarPlugin';
import './editor.css';

const editorConfig = {
  namespace: 'AdvancedEditor',
  theme: {
    text: {
      bold: 'font-bold',
      italic: 'italic',
      underline: 'underline',
      strikethrough: 'line-through',
    },
    link: 'text-blue-500 hover:underline',
    heading: {
      h1: 'text-3xl font-bold',
      h2: 'text-2xl font-bold',
      h3: 'text-xl font-bold',
    },
    paragraph: 'mb-4',
    quote: 'border-l-4 border-gray-300 pl-4 italic',
    code: 'bg-gray-100 p-1 rounded font-mono text-sm',
  },
  onError(error) {
    console.error(error);
  },
  nodes: [
    HeadingNode,
    ListNode,
    ListItemNode,
    QuoteNode,
    CodeNode,
    CodeHighlightNode,
    AutoLinkNode,
    LinkNode,
  ],
};

export default function Editor({ onChange, initialValue = '' }) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <LexicalComposer initialConfig={{ ...editorConfig, editorState: initialValue }}>
        <div className="editor-container">
          <ToolbarPlugin />
          <div className="editor-inner relative">
            <RichTextPlugin
              contentEditable={<ContentEditable className="min-h-[200px] p-4 focus:outline-none" />}
              placeholder={<div className="absolute top-4 left-4 text-gray-400 pointer-events-none">Comece a digitar...</div>}
            />
            <HistoryPlugin />
            <AutoFocusPlugin />
            <LinkPlugin />
            <ListPlugin />
            <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
            {typeof onChange === 'function' && (
              <OnChangePlugin onChange={(editorState, editor) => {
                try {
                  onChange(editorState, editor);
                } catch (e) {
                  // swallow user onChange errors to avoid breaking editor
                  console.warn('Editor onChange handler error:', e);
                }
              }} />
            )}
          </div>
        </div>
      </LexicalComposer>
    </div>
  );
}
