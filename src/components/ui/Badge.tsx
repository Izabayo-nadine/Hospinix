import React from 'react';

export const Badge = ({ color = 'blue', className = '', children, ...props }: any) => {
  const colorClasses: { [key: string]: string } = {
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    red: 'bg-red-50 text-red-700 border-red-100',
    green: 'bg-green-50 text-green-700 border-green-100',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-100',
    gray: 'bg-gray-50 text-gray-700 border-gray-100',
  };

  const selectedColor = colorClasses[color] || colorClasses.blue;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${selectedColor} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
