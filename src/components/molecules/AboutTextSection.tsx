import React from 'react';
import SectionTitle from '../atoms/SectionTitle';
import MainHeading from '../atoms/MainHeading';
import DescriptionText from '../atoms/DescriptionText';
import Button from '../atoms/Button';

interface AboutTextSectionProps {
  sectionTitle: string;
  mainHeading: string;
  description: string;
  buttonText: string;
}

const AboutTextSection: React.FC<AboutTextSectionProps> = ({
  sectionTitle,
  mainHeading,
  description,
  buttonText
}) => {
  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <SectionTitle title={sectionTitle} />
      <MainHeading title={mainHeading} />
      <DescriptionText text={description} />
      <div className="pt-1">
        <Button text={buttonText} />
      </div>
    </div>
  );
};

export default AboutTextSection;