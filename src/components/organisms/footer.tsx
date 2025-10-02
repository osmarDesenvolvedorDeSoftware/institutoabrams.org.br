import { FooterInfo } from '../molecule';

export const FooterComponent = () => {
  return (
    <footer className="relative bg-dark h-[548px] grid grid-cols-12">
      <div className="absolute bg-footer bg-no-repeat bg-center bg-cover opacity-[3%] inset-0 z-10" />
      <FooterInfo>
        <FooterInfo.Description />
      </FooterInfo>
    </footer>
  );
};
