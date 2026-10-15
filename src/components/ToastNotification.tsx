import React from 'react';

interface ToastNotificationProps {
  message: string | null;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 transform transition-all duration-300 pointer-events-none animate-bounce-short">
      <div className="px-4 py-3 rounded-xl bg-[#2d3449] text-[#dae2fd] shadow-2xl flex items-center gap-3 border border-[#464554]/40 backdrop-blur-xl">
        <span className="material-symbols-outlined text-[#4edea3] text-lg">
          check_circle
        </span>
        <span className="text-[13px] font-medium leading-none">
          {message}
        </span>
      </div>
    </div>
  );
};
