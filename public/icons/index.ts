import IconLocation from './location.svg';
import IconMail from './mail.svg';
import IconPhone from './phone.svg';

const icons = {
  'location-icon': IconLocation,
  mail: IconMail,
  phone: IconPhone,
};

export type IconName = keyof typeof icons;

export { icons };
