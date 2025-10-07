import { Typography } from '../atoms';
import { FooterInfo } from '../molecules';
import { TextField } from '../molecules/text-field/text-field';

export const FooterComponent = () => {
  return (
    <div>
      <footer className="relative bg-dark h-[548px] grid grid-cols-12">
        <div className="absolute bg-footer opacity-5 bg-no-repeat bg-center bg-cover inset-0 z-0" />
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
        <FooterInfo className="text-white flex flex-col gap-4">
          <FooterInfo.FormNews />
          <Typography elementType="span" className="text-lg font-normal">
            Follow Me On
          </Typography>
          <FooterInfo.Container className="flex gap-3">
            <FooterInfo.SocialNetwork href="#" name="facebook" />
            <FooterInfo.SocialNetwork href="#" name="twitter" />
            <FooterInfo.SocialNetwork href="#" name="instagram" />
            <FooterInfo.SocialNetwork href="#" name="youtube" />
            <FooterInfo.SocialNetwork href="#" name="linkedin" />
          </FooterInfo.Container>
        </FooterInfo>
        <div className="col-span-12 border-t-2 border-light-gray" />
        </div>
      </footer>
    </div>
  );
};
