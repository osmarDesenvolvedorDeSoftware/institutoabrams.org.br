import { Typography } from '@/components/atoms';
import { TextField } from '../text-field/text-field';

export const FormNews = () => {
  return (
    <form className="col-span-3 grid grid-cols-8 text-white gap-3">
      <Typography
        elementType="h3"
        className="font-semibold text-xl mb-2.5 col-span-12"
      >
        Newsletter
      </Typography>
      <div className="col-span-8 flex items-center">
        <TextField
          name="email"
          placeholder="Enter your email"
          className="w-72"
        />
        <button className="bg-orange-500 h-10 w-32 text-white font-medium self-end">
          Subscribe
        </button>
      </div>
      <span className="text-gray-400 col-span-8 mt-2.5">
        Your email is safe with us,we don’t spam.
      </span>
    </form>
  );
};
