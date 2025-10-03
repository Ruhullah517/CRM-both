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

  const setAlignment = (alignment) => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const selectedText = range.toString();
      
      if (selectedText) {
        // If text is selected, wrap it in a div with alignment
        const div = document.createElement('div');
        div.style.textAlign = alignment;
        div.textContent = selectedText;
        range.deleteContents();
        range.insertNode(div);
      } else {
        // If no text selected, set alignment for the current paragraph
        const currentElement = range.commonAncestorContainer;
        let element = currentElement.nodeType === Node.TEXT_NODE ? currentElement.parentElement : currentElement;
        
        // Find the nearest block element
        while (element && !['DIV', 'P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(element.tagName)) {
          element = element.parentElement;
        }
        
        if (element) {
          element.style.textAlign = alignment;
        } else {
          // Create a new div with alignment
          const div = document.createElement('div');
          div.style.textAlign = alignment;
          div.innerHTML = '<br>';
          range.insertNode(div);
          range.setStartAfter(div);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
    }
    editorRef.current.focus();
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
            <select
              onChange={(e) => {
                if (e.target.value) {
                  execCommand('fontSize', e.target.value);
                  e.target.value = '';
                }
              }}
              className="text-xs px-2 py-1 border rounded hover:bg-gray-200"
              title="Font Size"
            >
              <option value="">Size</option>
              <option value="1">8px</option>
              <option value="2">10px</option>
              <option value="3">12px</option>
              <option value="4">14px</option>
              <option value="5">16px</option>
              <option value="6">18px</option>
              <option value="7">20px</option>
            </select>
          </div>

          {/* Alignment */}
          <div className="flex border-r border-gray-300 pr-2 mr-2">
            <ToolbarButton onClick={() => setAlignment('left')} title="Align Left">
              <Bars3BottomLeftIcon className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => setAlignment('center')} title="Align Center">
              <Bars3CenterLeftIcon className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => setAlignment('right')} title="Align Right">
              <Bars3BottomRightIcon className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => setAlignment('justify')} title="Justify">
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
      `}</style>
    </div>
  );
};

export default RichTextEditor;
