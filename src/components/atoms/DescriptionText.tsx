import React from 'react';

interface DescriptionTextProps {
  text: string;
}

const DescriptionText: React.FC<DescriptionTextProps> = ({ text }) => {
  return (
    <p className="max-w-[594px] text-[18px] leading-8 text-[#243C4B]">
      {text}
    </p>
  );
};

export default DescriptionText;