import React, { useState, useMemo } from 'react';

export default function IconManager({ icons }) {
  const [search, setSearch] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(null);

  const filteredIcons = useMemo(() => {
    if (!search) return icons.slice(0, 100); // Show first 100 by default
    const lowerSearch = search.toLowerCase();
    return icons.filter(icon => icon.toLowerCase().includes(lowerSearch)).slice(0, 100);
  }, [search, icons]);

  return (
    <div className="p-4">
      <div className="mb-4 sticky top-0 bg-white p-4 shadow-md rounded-lg">
        <input
          type="text"
          placeholder="Search icons..."
          className="w-full p-2 border border-gray-300 rounded"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="mt-2 text-sm text-gray-500">
          Showing {filteredIcons.length} of {icons.length} icons
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
        {filteredIcons.map((icon) => (
          <div
            key={icon}
            className="flex flex-col items-center p-2 border rounded hover:bg-gray-50 cursor-pointer"
            onClick={() => setSelectedIcon(icon)}
          >
            <img
              src={`/icon/${icon}`}
              alt={icon}
              className="w-12 h-12 object-contain mb-2"
              loading="lazy"
            />
            <span className="text-xs text-center break-all">{icon}</span>
          </div>
        ))}
      </div>

      {selectedIcon && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedIcon(null)}>
          <div className="bg-white p-6 rounded-lg max-w-lg w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Icon Details</h3>
            <div className="flex justify-center mb-4">
               <img src={`/icon/${selectedIcon}`} alt={selectedIcon} className="w-32 h-32 object-contain" />
            </div>
            <div className="space-y-2">
              <p><strong>Filename:</strong> {selectedIcon}</p>
              <p><strong>URL:</strong> <code className="bg-gray-100 p-1 rounded">/icon/{selectedIcon}</code></p>
              <button
                className="mt-4 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                onClick={() => {
                  navigator.clipboard.writeText(`/icon/${selectedIcon}`);
                  alert('URL copied to clipboard!');
                }}
              >
                Copy URL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
