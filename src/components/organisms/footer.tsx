import { Typography } from '../atoms';
import { FooterInfo } from '../molecules';

export const FooterComponent = () => {
  return (
    <footer className="relative bg-dark h-[548px] grid grid-cols-12">
      <div className="absolute  bg-footer opacity-5 bg-no-repeat bg-center bg-cover inset-0 z-10" />
      <FooterInfo>
        <FooterInfo.Description />
      </FooterInfo>
      <FooterInfo>
        <FooterInfo.Navigation className="text-white">
          <Typography
            elementType="h3"
            className="font-semibold text-xl mb-2.5 w-44"
          >
            Quick Links
          </Typography>
          <FooterInfo.LinkNavigation to="#" text="Success Stories" />
          <FooterInfo.LinkNavigation to="#" text="Latest News & Blogs" />
          <FooterInfo.LinkNavigation to="#" text="Case Studies" />
          <FooterInfo.LinkNavigation to="#" text="Our Projects" />
          <FooterInfo.LinkNavigation to="#" text="Gallery" />
          <FooterInfo.LinkNavigation to="#" text="National Events" />
        </FooterInfo.Navigation>
      </FooterInfo>
      <FooterInfo>
        <FooterInfo.Navigation className="text-white">
          <Typography
            elementType="h3"
            className="font-semibold text-xl mb-2.5 w-44"
          >
            Get In Touch
          </Typography>
          <FooterInfo.LinkNavigation to="#" text="Get In Touch" />
          <FooterInfo.LinkNavigation to="#" text="Be a Volunteer" />
          <FooterInfo.LinkNavigation to="#" text="Career" />
          <FooterInfo.LinkNavigation to="#" text="Focus Areas" />
        </FooterInfo.Navigation>
      </FooterInfo>
    </footer>
  );
};
