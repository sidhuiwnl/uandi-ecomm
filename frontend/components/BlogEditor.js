// components/BlogEditor.jsx
'use client';

import { useEffect } from 'react';
import { 
  $getRoot, 
  $insertNodes, 
  $createParagraphNode,
  $createTextNode,
  $createLineBreakNode
} from 'lexical';

// === CORE ===
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';

// === PLUGINS ===
import { ListPlugin } from '@lexical/list/LexicalListPlugin';
import { TablePlugin } from '@lexical/table/LexicalTablePlugin';

// === NODES ===
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';
import { TableNode, TableCellNode, TableRowNode } from '@lexical/table';

// === HTML ===
import { $generateHtmlFromNodes } from '@lexical/html';

// === CUSTOM NODES ===
class ImageNode {
  constructor(src, alt = '') {
    this.__src = src;
    this.__alt = alt;
    this.__type = 'image';
    this.__version = 1;
  }

  static getType() { return 'image'; }
  static clone(node) { return new ImageNode(node.__src, node.__alt); }

  createDOM() {
    const img = document.createElement('img');
    img.src = this.__src;
    img.alt = this.__alt;
    img.className = 'max-w-full h-auto rounded my-4';
    return img;
  }

  static importJSON({ src, alt }) { return new ImageNode(src, alt); }
  exportJSON() { return { type: 'image', version: 1, src: this.__src, alt: this.__alt }; }
}

function $createImageNode(src, alt = '') {
  return new ImageNode(src, alt);
}

class LinkNode {
  constructor(url, text = url) {
    this.__url = url;
    this.__text = text;
    this.__type = 'link';
    this.__version = 1;
  }

  static getType() { return 'link'; }
  static clone(node) { return new LinkNode(node.__url, node.__text); }

  createDOM() {
    const a = document.createElement('a');
    a.href = this.__url;
    a.textContent = this.__text;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.className = 'text-blue-600 underline';
    return a;
  }

  static importJSON({ url, text }) { return new LinkNode(url, text); }
  exportJSON() { return { type: 'link', version: 1, url: this.__url, text: this.__text }; }
}

function $createLinkNode(url, text = url) {
  return new LinkNode(url, text);
}

// === TOOLBAR ===
function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();

  const insertImage = () => {
    const url = prompt('Image URL:');
    if (url) {
      editor.update(() => {
        $insertNodes([$createImageNode(url)]);
        $insertNodes([$createParagraphNode()]);
      });
    }
  };

  const insertLink = () => {
    const url = prompt('Link URL:');
    const text = prompt('Link Text:', url);
    if (url) {
      editor.update(() => {
        $insertNodes([$createLinkNode(url, text)]);
        $insertNodes([$createLineBreakNode()]);
      });
    }
  };

  const insertTable = () => {
    editor.update(() => {
      const table = new TableNode();
      for (let r = 0; r < 3; r++) {
        const row = new TableRowNode();
        for (let c = 0; c < 3; c++) {
          row.append(new TableCellNode());
        }
        table.append(row);
      }
      $insertNodes([table]);
    });
  };

  return (
    <div className="border-b p-2 flex gap-2 flex-wrap text-sm bg-gray-50">
      <button onClick={() => editor.dispatchCommand('FORMAT_TEXT_COMMAND', 'bold')} className="px-2 py-1 rounded bg-white border">Bold</button>
      <button onClick={() => editor.dispatchCommand('FORMAT_TEXT_COMMAND', 'italic')} className="px-2 py-1 rounded bg-white border">Italic</button>
      <button onClick={() => editor.dispatchCommand('INSERT_HEADING_COMMAND', { level: 2 })} className="px-2 py-1 rounded bg-white border">H2</button>
      <button onClick={() => editor.dispatchCommand('INSERT_UNORDERED_LIST_COMMAND')} className="px-2 py-1 rounded bg-white border">Bullet</button>
      <button onClick={() => editor.dispatchCommand('INSERT_ORDERED_LIST_COMMAND')} className="px-2 py-1 rounded bg-white border">Numbered</button>
      <button onClick={insertLink} className="px-2 py-1 rounded bg-white border">Link</button>
      <button onClick={insertImage} className="px-2 py-1 rounded bg-white border">Image</button>
      <button onClick={insertTable} className="px-2 py-1 rounded bg-white border">Table</button>
    </div>
  );
}

// === MAIN EDITOR ===
export default function BlogEditor({ content = '', onChange }) {
  const onEditorChange = (editorState) => {
    editorState.read(() => {
      const html = $generateHtmlFromNodes(editorState);
      onChange(html);
    });
  };

  const initialConfig = {
    namespace: 'BlogEditor',
    theme: {
      paragraph: 'mb-2',
      heading: { h2: 'text-2xl font-bold mt-6 mb-3' },
    },
    nodes: [
      HeadingNode,
      QuoteNode,
      ListNode,
      ListItemNode,
      TableNode,
      TableCellNode,
      TableRowNode,
      ImageNode,
      LinkNode,
    ],
    onError: (error) => console.error(error),
  };

  return (
    <div className="border rounded-lg overflow-hidden shadow-sm">
      <LexicalComposer initialConfig={initialConfig}>
        <ToolbarPlugin />
        <RichTextPlugin
          contentEditable={<ContentEditable className="p-4 min-h-64 prose max-w-none focus:outline-none" />}
          placeholder={<div className="text-gray-400 pointer-events-none absolute top-16 left-6">Start writing...</div>}
        />
        <HistoryPlugin />
        <OnChangePlugin onChange={onEditorChange} />
        <ListPlugin />
        <TablePlugin />
      </LexicalComposer>
    </div>
  );
}