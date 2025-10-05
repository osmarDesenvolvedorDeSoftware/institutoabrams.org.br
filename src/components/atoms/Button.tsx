import React from 'react';

interface ButtonProps {
  text: string;
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({ text, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-4 rounded-lg bg-[#0062CE] px-7 py-3 text-sm font-semibold text-white"
    >
      <span>{text}</span>
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white">
        <svg className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="none">
          <path
            d="M7 17L17 7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M10 7h7v7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </button>
  );
};

export default Button;
