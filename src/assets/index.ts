export const icons = {
  'location-icon': '/icons/location.svg',
  mail: '/icons/mail.svg',
  phone: '/icons/phone.svg',
  facebook: '/icons/facebook.svg',
  instagram: '/icons/instagram.svg',
  linkedin: '/icons/linkedin.svg',
  youtube: '/icons/youtube.svg',
  twitter: '/icons/twitter.svg',
} as const;

export type IconName = keyof typeof icons;
