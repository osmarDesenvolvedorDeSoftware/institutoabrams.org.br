export const icons = {
  "location-icon": "/assets/icons/location.svg",
  mail: "/assets/icons/mail.svg",
  phone: "/assets/icons/phone.svg",
  facebook: "/assets/icons/facebook.svg",
  instagram: "/assets/icons/instagram.svg",
  linkedin: "/assets/icons/linkedin.svg",
  youtube: "/assets/icons/youtube.svg",
  twitter: "/assets/icons/twitter.svg",
} as const;

export type IconName = keyof typeof icons;
