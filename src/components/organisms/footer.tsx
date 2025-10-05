import { Typography } from '../atoms';
import { FooterInfo } from '../molecules';
import { TextField } from '../molecules/text-field/text-field';

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
      <div className="col-span-3 text-white flex flex-col gap-8">
        <Typography
          elementType="h3"
          className="font-semibold text-xl mb-2.5 w-44"
        >
          Newsletter
        </Typography>
        <form className="grid grid-cols-8">
          <TextField
            name="email"
            placeholder="Enter your email"
            className="col-span-5"
          />
          <button className="bg-orange-500 h-10 col-span-3 text-white font-semibold">
            SUBSCRIBE
          </button>
          <span className="text-gray-400 col-span-8 mt-2.5">
            Your email is safe with us,we don’t spam.
          </span>
        </form>
      </div>
    </footer>
  );
};
