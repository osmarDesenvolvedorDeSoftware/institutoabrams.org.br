import Link from 'next/link';
import React, { memo } from 'react';

interface LinkNavigationProps {
  to: string;
  text: string;
}

const LinkNavigationComponent = ({ text, to }: LinkNavigationProps) => {
  return (
    <li className="w-44">
      <Link href={to}>{text}</Link>
    </li>
  );
};

export const LinkNavigation = memo(LinkNavigationComponent);
