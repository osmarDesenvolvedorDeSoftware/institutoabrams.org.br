import React from 'react';

interface SectionTitleProps {
  title: string;
  color?: string;
}

const SectionTitle: React.FC<SectionTitleProps> = ({ title, color = 'text-orange-500' }) => {
  return (
    <div className={`flex items-center gap-4 ${color}`}>
      <p className="text-sm font-normal uppercase text-current">
        {title}
      </p>
      <span className="h-px w-20 bg-current" />
    </div>
  );
};

export default SectionTitle;
