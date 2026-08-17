import React from 'react';

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
};

export const Dialog = ({ open, onClose, title, children }: DialogProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-lg w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          {title ? (
            <h2 className="text-lg font-bold text-gray-800">{title}</h2>
          ) : (
            <div></div>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        {/* Content */}
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Dialog;
