import React from 'react';
import { Description } from './description';

interface FooterInfoProps {
  children: React.ReactNode;
}

const FooterInfo = ({ children }: FooterInfoProps) => {
  return <section className="col-span-3">{children}</section>;
};

FooterInfo.Description = Description;

export { FooterInfo };
