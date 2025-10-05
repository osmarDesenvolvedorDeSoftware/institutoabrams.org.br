import React from 'react';
import { Description } from './description';
import { Navigation } from './navigation';
import { LinkNavigation } from './link-navigation';

interface FooterInfoProps {
  children: React.ReactNode;
}

const FooterInfo = ({ children }: FooterInfoProps) => {
  return <section className="col-span-3">{children}</section>;
};

FooterInfo.Description = Description;
FooterInfo.Navigation = Navigation;
FooterInfo.LinkNavigation = LinkNavigation;

export { FooterInfo };
