import IconLocation from './location.svg';
import IconMail from './mail.svg';
import IconPhone from './phone.svg';
import Facebook from './facebook.svg';
import Instagram from './instagram.svg';
import Linkedin from './linkedin.svg';
import Twitter from './twitter.svg';
import Youtube from './youtube.svg';

const icons = {
  'location-icon': IconLocation,
  mail: IconMail,
  phone: IconPhone,
  youtube: Youtube,
  linkedin: Linkedin,
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
};

export type IconName = keyof typeof icons;

export { icons };
