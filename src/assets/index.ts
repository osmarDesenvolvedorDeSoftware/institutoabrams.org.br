export const icons = {
  'location-icon': '/icons/location.svg',
  mail: '/icons/mail.svg',
  phone: '/icons/phone.svg',
} as const;

export type IconName = keyof typeof icons;
