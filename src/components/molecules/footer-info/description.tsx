import { ContactInfo, Typography } from '@/components/atoms';

export const Description = () => {
  return (
    <div className="flex flex-col items-start text-white gap-4">
      <Typography elementType="h1" className="text-2xl font-semibold">
        SkillBridge Foundation
      </Typography>
      <Typography elementType="p">
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptatum
        magnam aperiam necessitatibus quis
      </Typography>
      <ContactInfo elementType="p" text="+91 000-000-0000" iconName="phone" />
      <ContactInfo
        elementType="p"
        text="hello@skillbridge.xyz"
        iconName="mail"
      />
      <ContactInfo
        elementType="p"
        text="  123 Harmony Street, Greenview, New Delhi, India – 110001"
        iconName="location-icon"
      />
    </div>
  );
};
