import React, { memo } from 'react';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const ContainerComponent = ({ children, className }: ContainerProps) => {
  return (
    <>
      <div className={className}>{children}</div>
    </>
  );
};

export const Container = memo(ContainerComponent);
