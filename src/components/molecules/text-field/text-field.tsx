import { cn } from '@/lib/util';
import React from 'react';

interface TextFieldProps {
  name: string;
  type?: React.InputHTMLAttributes<HTMLInputElement>['type'];
  label?: string;
  placeholder?: string;
  className?: string;
}

export const TextField = ({
  name,
  label,
  type,
  placeholder,
  className,
}: TextFieldProps) => {
  return (
    <>
      <div className={cn(className, 'cols-span-4 flex flex-col gap-4')}>
        {label && <label htmlFor={name}>{label}</label>}
        <input
          id={name}
          type={type}
          placeholder={placeholder}
          className="bg-white h-10 p-2 w-full placeholder:text-gray-400 text-black"
        />
      </div>
    </>
  );
};
