import { IconName } from '@/assets';
import { Icon, Typography } from '.';
import { cn } from '@/lib/util';
import { memo } from 'react';

interface ContactInfoProps {
  iconName: IconName;
  text: string;
  className?: string;
  elementType: 'h1' | 'h2' | 'h3' | 'span' | 'p';
}

const ContactInfoComponent = ({
  className,
  iconName,
  elementType = 'span',
  text,
}: ContactInfoProps) => {
  return (
    <div className={cn(className, 'flex gap-3')}>
      <Icon name={iconName} />
      <Typography elementType={elementType}>{text}</Typography>
    </div>
  );
};

export const ContactInfo = memo(ContactInfoComponent);
