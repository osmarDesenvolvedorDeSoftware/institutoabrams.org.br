import React from "react";
import DescriptionText from "../atoms/DescriptionText";
import Button from "../atoms/Button";

interface AboutTextSectionProps {
  description: string;
  buttonText: string;
}

const AboutTextSection: React.FC<AboutTextSectionProps> = ({
  description,
  buttonText,
}) => {
  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <DescriptionText text={description} />
      <div className="pt-1">
        <Button text={buttonText} />
      </div>
    </div>
  );
};

export default AboutTextSection;
