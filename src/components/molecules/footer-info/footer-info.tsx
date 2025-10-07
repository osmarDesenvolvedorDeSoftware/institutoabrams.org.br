import React from 'react';
import { Description } from './description';
import { Navigation } from './navigation';
import { LinkNavigation } from './link-navigation';
import { FormNews } from './form-news';
import { SocialNetwork } from './social-network';
import { cn } from '@/lib/util';
import { Container } from './container';

interface FooterInfoProps {
  children: React.ReactNode;
  className?: string;
}

const FooterInfo = ({ children, className }: FooterInfoProps) => {
  return (
    <section className={cn(className, 'col-span-3 z-20')}>{children}</section>
  );
};

FooterInfo.Description = Description;
FooterInfo.Navigation = Navigation;
FooterInfo.LinkNavigation = LinkNavigation;
FooterInfo.FormNews = FormNews;
FooterInfo.SocialNetwork = SocialNetwork;
FooterInfo.Container = Container;

export { FooterInfo };
