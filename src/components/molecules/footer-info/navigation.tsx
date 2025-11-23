import React, { memo } from 'react';

interface NavigationProps {
  children: React.ReactNode;
  className?: string;
}
const NavigationComponent = ({ children, className }: NavigationProps) => {
  return (
    <nav className={className}>
      <ul className="flex flex-col gap-2.5 items-center">{children}</ul>
    </nav>
  );
};

export const Navigation = memo(NavigationComponent);
