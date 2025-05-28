import React from 'react';

interface SortableHeaderProps {
  label: string;
  sortKey: string;
  currentSort: {
    key: string;
    direction: 'asc' | 'desc';
  };
  onSort: (key: string) => void;
}

const SortableHeader: React.FC<SortableHeaderProps> = ({
  label,
  sortKey,
  currentSort,
  onSort,
}) => {
  const isCurrentSort = currentSort.key === sortKey;
  const direction = isCurrentSort ? currentSort.direction : null;

  return (
    <th
      scope="col"
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50"
      onClick={() => onSort(sortKey)}
    >
      <div className="flex items-center space-x-1">
        <span>{label}</span>
        <span className="flex flex-col">
          <svg
            className={`w-3 h-3 -mb-1 ${
              direction === 'asc' ? 'text-indigo-600' : 'text-gray-400'
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 15l7-7 7 7"
            />
          </svg>
          <svg
            className={`w-3 h-3 -mt-1 ${
              direction === 'desc' ? 'text-indigo-600' : 'text-gray-400'
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </span>
      </div>
    </th>
  );
};

export default SortableHeader; 