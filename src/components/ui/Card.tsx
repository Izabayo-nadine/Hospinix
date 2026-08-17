import React from 'react';

export const Card = ({ className = '', children, ...props }: any) => {
  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
