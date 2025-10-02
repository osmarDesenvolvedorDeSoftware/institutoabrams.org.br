import { FooterInfo } from '../molecule';

export const FooterComponent = () => {
  return (
    <footer className="relative bg-footer bg-no-repeat bg-center bg-cover h-[548px] grid grid-cols-12">
      <div className="absolute bg-dark/95 inset-0 z-10" />
      <FooterInfo>
        <FooterInfo.Description />
      </FooterInfo>
    </footer>
  );
};
