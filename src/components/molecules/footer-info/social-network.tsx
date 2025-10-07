import { IconName, icons } from '@/assets';

import Image from 'next/image';

import Link from 'next/link';
import { memo } from 'react';
interface SocialNetworkProps {
  href: string;
  name: IconName;
}

export const SocialNetworkComponent = ({ href, name }: SocialNetworkProps) => {
  const src = icons[name];
  if (!name) return null;
  return (
    <Link
      href={href}
      className="size-10 flex items-center justify-center rounded-full bg-white z-20 overflow-hidden"
    >
      <Image
        src={src}
        width={20}
        height={20}
        alt={name}
        className="object-contain"
      />
    </Link>
  );
};
export const SocialNetwork = memo(SocialNetworkComponent);
