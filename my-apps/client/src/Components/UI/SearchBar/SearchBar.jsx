// client/src/components/UI/SearchBar/SearchBar.jsx
import React, { useState, useRef } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

const SearchBar = ({ 
  value, 
  onChange, 
  placeholder = 'ค้นหา...', 
  onClear,
  icon,
  className = '' 
}) => {
  const inputRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    onChange('');
    onClear?.();
    inputRef.current?.focus();
  };

  return (
    <div className={`relative ${className}`}>
      <div className={`
        relative flex items-center
        ${isFocused ? 'ring-2 ring-blue-500' : ''}
        rounded-lg transition-all
      `}>
        <div className="absolute left-3 text-gray-400">
          {icon || <MagnifyingGlassIcon className="w-5 h-5" />}
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none transition-all"
        />
        
        {value && (
          <button
            onClick={handleClear}
            className="absolute right-3 text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;