import { Typography } from "@/components/atoms";

type SectionHeadingProps = {
  title: string;
  subtitle: string;
};

export const SectionHeading = ({ title, subtitle }: SectionHeadingProps) => {
  return (
    <div className="flex flex-col">
      <div className="flex flex-row items-center gap-2">
        <Typography elementType="h1" className="text-orange text-lg">
          {title}
        </Typography>
        <div className="w-20 h-px bg-orange" />
      </div>
      <Typography elementType="h3" className="font-semibold text-3xl">
        {subtitle}
      </Typography>
    </div>
  );
};
