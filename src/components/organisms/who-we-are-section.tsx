import React from 'react';
import AboutTextSection from '../molecules/AboutTextSection';
import ImageGallerySection from '../molecules/ImageGallerySection';

const WhoWeAreSection: React.FC = () => {
  const aboutText = `SkillBridge Foundation is a registered not-for-profit organization dedicated to advancing the well-being of children and promoting equality for girls and young women across communities. Through its grassroots social development efforts, SkillBridge Foundation strives to create lasting positive change in the lives of vulnerable children, their families, and their communities by adopting a gender-transformative, child-centered approach. Since its inception in 1996, SkillBridge Foundation has positively impacted the lives of millions of young people by connecting them with protective services, quality education, accessible healthcare, a healthy environment, better livelihood opportunities, and meaningful community participation.`;

  return (
    <section className="w-[1440px] h-[618px] mx-auto">
      <div className="grid grid-cols-2 h-full">
        <div className="p-12 flex items-center">
          <AboutTextSection 
            sectionTitle="Who We Are"
            mainHeading="ABOUT US"
            description={aboutText}
            buttonText="Know More"
          />
        </div>
        <div className="p-6">
          <ImageGallerySection />
        </div>
      </div>
    </section>
  );
};

export default WhoWeAreSection;