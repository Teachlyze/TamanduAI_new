import React from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelection, $isRangeSelection } from 'lexical';
import { $wrapNodes } from '@lexical/selection';
import { $createHeadingNode, $createQuoteNode } from '@lexical/rich-text';
import { $createCodeNode } from '@lexical/code';

const ToolbarPlugin = () => {
  const [editor] = useLexicalComposerContext();

  const formatHeading = (level) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $wrapNodes(selection, () => $createHeadingNode(`h${level}`));
      }
    });
  };

  const formatQuote = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $wrapNodes(selection, () => $createQuoteNode());
      }
    });
  };

  const insertCode = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $wrapNodes(selection, () => $createCodeNode());
      }
    });
  };

  return (
    <div className="flex flex-wrap gap-2 p-2 border-b bg-white/70">
      <button onClick={() => formatHeading(1)} className="p-2 rounded hover:bg-gray-100" title="Título 1">H1</button>
      <button onClick={() => formatHeading(2)} className="p-2 rounded hover:bg-gray-100" title="Título 2">H2</button>
      <button onClick={formatQuote} className="p-2 rounded hover:bg-gray-100" title="Citação">“”</button>
      <button onClick={insertCode} className="p-2 rounded hover:bg-gray-100" title="Código">&lt;/&gt;</button>
    </div>
  );
};

export default ToolbarPlugin;
