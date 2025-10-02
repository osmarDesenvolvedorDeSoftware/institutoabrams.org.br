import { IconName, icons } from '@/assets';
import { cn } from '@/lib/util';
import Image from 'next/image';
import { memo } from 'react';

interface IconProps {
  name: IconName;
  className?: string;
}

const IconComponent = ({ name, className }: IconProps) => {
  const src = icons[name];
  if (!src) return null;

  return (
    <div className={cn(className, 'flex items-center justify-center')}>
      <Image src={src} alt={name} className="size-5" width={10} height={10} />
    </div>
  );
};

export const Icon = memo(IconComponent);
