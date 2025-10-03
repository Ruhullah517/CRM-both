import React, { useRef, useEffect, useState } from 'react';
import { 
  BoldIcon, 
  ItalicIcon, 
  UnderlineIcon,
  ListBulletIcon,
  Bars3Icon,
  Bars3CenterLeftIcon,
  Bars3BottomLeftIcon,
  Bars3BottomRightIcon
} from '@heroicons/react/24/outline';

const RichTextEditor = ({ value, onChange, placeholder, className = "" }) => {
  const editorRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const handleInput = () => {
    const content = editorRef.current.innerHTML;
    onChange(content);
  };

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
    handleInput();
  };

  const insertPlaceholder = (placeholder) => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      const span = document.createElement('span');
      span.className = 'placeholder-tag';
      span.style.backgroundColor = '#f3f4f6';
      span.style.padding = '2px 6px';
      span.style.borderRadius = '4px';
      span.style.fontFamily = 'monospace';
      span.style.fontSize = '0.9em';
      span.textContent = `{{${placeholder}}}`;
      range.insertNode(span);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    handleInput();
  };

  const ToolbarButton = ({ onClick, children, title, isActive = false }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-2 rounded hover:bg-gray-200 transition-colors ${
        isActive ? 'bg-gray-300' : ''
      }`}
    >
      {children}
    </button>
  );

  const FontSizeButton = ({ size, label }) => (
    <button
      type="button"
      onClick={() => execCommand('fontSize', '7')}
      title={`Font size: ${label}`}
      className="px-3 py-2 text-sm rounded hover:bg-gray-200 transition-colors"
    >
      {label}
    </button>
  );

  return (
    <div className={`border rounded-lg ${isFocused ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-300'}`}>
      {/* Toolbar */}
      <div className="border-b border-gray-200 p-2 bg-gray-50 rounded-t-lg">
        <div className="flex flex-wrap gap-1">
          {/* Text Formatting */}
          <div className="flex border-r border-gray-300 pr-2 mr-2">
            <ToolbarButton onClick={() => execCommand('bold')} title="Bold">
              <BoldIcon className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => execCommand('italic')} title="Italic">
              <ItalicIcon className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => execCommand('underline')} title="Underline">
              <UnderlineIcon className="w-4 h-4" />
            </ToolbarButton>
          </div>

          {/* Font Size */}
          <div className="flex border-r border-gray-300 pr-2 mr-2">
            <FontSizeButton size="1" label="S" />
            <FontSizeButton size="3" label="M" />
            <FontSizeButton size="5" label="L" />
            <FontSizeButton size="7" label="XL" />
          </div>

          {/* Alignment */}
          <div className="flex border-r border-gray-300 pr-2 mr-2">
            <ToolbarButton onClick={() => execCommand('justifyLeft')} title="Align Left">
              <Bars3BottomLeftIcon className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => execCommand('justifyCenter')} title="Align Center">
              <Bars3CenterLeftIcon className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => execCommand('justifyRight')} title="Align Right">
              <Bars3BottomRightIcon className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => execCommand('justifyFull')} title="Justify">
              <Bars3Icon className="w-4 h-4" />
            </ToolbarButton>
          </div>

          {/* Lists */}
          <div className="flex border-r border-gray-300 pr-2 mr-2">
            <ToolbarButton onClick={() => execCommand('insertUnorderedList')} title="Bullet List">
              <ListBulletIcon className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => execCommand('insertOrderedList')} title="Numbered List">
              <span className="text-xs font-bold">1.</span>
            </ToolbarButton>
          </div>

          {/* Placeholders */}
          <div className="flex gap-1">
            <select
              onChange={(e) => {
                if (e.target.value) {
                  insertPlaceholder(e.target.value);
                  e.target.value = '';
                }
              }}
              className="text-xs px-2 py-1 border rounded hover:bg-gray-200"
              title="Insert Placeholder"
            >
              <option value="">Insert Placeholder</option>
              <option value="client_name">Client Name</option>
              <option value="company_name">Company Name</option>
              <option value="training_date">Training Date</option>
              <option value="mentor_name">Mentor Name</option>
              <option value="contract_date">Contract Date</option>
              <option value="amount">Amount</option>
              <option value="duration">Duration</option>
              <option value="location">Location</option>
              <option value="email">Email</option>
              <option value="phone">Phone</option>
            </select>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`p-4 min-h-[140px] focus:outline-none ${className}`}
        style={{ minHeight: '140px' }}
        data-placeholder={placeholder}
      />

      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
        .placeholder-tag {
          background-color: #f3f4f6;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: monospace;
          font-size: 0.9em;
          color: #374151;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
