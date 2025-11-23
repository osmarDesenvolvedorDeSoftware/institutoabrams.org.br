import React from "react";

interface ImageGallerySectionProps {}

const ImageGallerySection: React.FC<ImageGallerySectionProps> = () => {
  return (
    <div className="flex h-full items-center justify-center">
      <div
        className="relative h-[348px] w-[482.48px] rounded-lg bg-blue-500 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(/assets/images/Subtract.png)`,
        }}
      >
        <div className="absolute top-[128px] left-[-128px] z-0 h-[267px] w-[282px] rounded-[22px] bg-white shadow-md" />
        <div
          className="absolute top-[150px] left-[-150px] z-[1] h-[267px] w-[282px] rounded-[22px] bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(/assets/images/image.png)`,
          }}
        />
        <div className="absolute top-[265px] left-[320px] z-0 h-[267px] w-[282px] rounded-lg border border-amber-50 bg-white" />

        <div className="absolute top-[330px] left-[90px] z-[2] h-[117px] w-[209px] rounded-lg bg-[#ED632F] p-3">
          <span className="flex items-center gap-2">
            <div>
              <p className="text-[46px] font-bold leading-none text-white">
                50
              </p>
            </div>
            <p className="text-[20px] font-medium text-white">Lakh</p>
          </span>
          <p className="text-[18px] font-medium text-white">Lives Impacted</p>
        </div>
      </div>
    </div>
  );
};

export default ImageGallerySection;
