import React from "react";
import AboutTextSection from "../molecules/AboutTextSection";
import ImageGallerySection from "../molecules/ImageGallerySection";
import { SectionHeading } from "../molecules/section-heading";
import { LandingPageResponse } from "@/app/api/route";

type WhoWeAreSectionProps =
  LandingPageResponse["landingPage"]["whoWeAreSection"];

const WhoWeAreSection: React.FC<WhoWeAreSectionProps> = ({ whoWeAreText }) => {
  return (
    <section className="w-[1440px] h-[618px] mx-auto">
      <SectionHeading title="Who We Are" subtitle="About Us" />
      <div className="grid grid-cols-2 h-full">
        <div className="p-12 flex items-center">
          <AboutTextSection description={whoWeAreText} buttonText="Know More" />
        </div>
        <div className="p-6">
          <ImageGallerySection />
        </div>
      </div>
    </section>
  );
};

export default WhoWeAreSection;
