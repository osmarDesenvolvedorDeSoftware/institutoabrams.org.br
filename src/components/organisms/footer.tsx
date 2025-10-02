import { FooterInfo } from '../molecule';

export const FooterComponent = () => {
  return (
    <footer className="relative bg-dark h-[548px] grid grid-cols-12">
      <div className="absolute  bg-footer opacity-5 bg-no-repeat bg-center bg-cover inset-0 z-10" />
      <FooterInfo>
        <FooterInfo.Description />
      </FooterInfo>
    </footer>
  );
};
