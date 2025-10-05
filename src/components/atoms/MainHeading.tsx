import React from 'react';

interface MainHeadingProps {
  title: string;
}

const MainHeading: React.FC<MainHeadingProps> = ({ title }) => {
  return (
    <h2 className="text-4xl font-semibold uppercase text-[#0f172a]">
      {title}
    </h2>
  );
};

export default MainHeading;