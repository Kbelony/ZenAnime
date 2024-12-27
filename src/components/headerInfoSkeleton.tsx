import { Skeleton } from "./ui/skeleton";

const HeaderInfoSkeleton = () => {
  return (
    <div className="headerInfoSkeleton">
      {/* Section Mobile */}
      <div className="header_mobile md:hidden">
        <Skeleton className="object-cover mobile_img" />
        <div className="mt-6 text-center info_mobile">
          <div className="flex justify-center meanScoreBadge mb-3">
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-6 w-48 mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto mt-2" />
        </div>
      </div>

      {/* Section Desktop */}
      <div className="header_desktop hidden md:block">
        <Skeleton className="object-cover blur_img h-40 w-full" />
        <div className="absolute top-20 p-4">
          <div className="flex ml-7 desktop_img">
            <Skeleton className="mr-5 portrait:w-46 h-80 rounded-lg" />
            <div className="ml-2 mb-2">
              <Skeleton className="h-10 w-60" />
              <Skeleton className="h-4 w-24 mt-4" />
              <Skeleton className="h-4 w-24 mt-2" />
              <Skeleton className="h-4 w-40 mt-2" />
              <Skeleton className="h-4 w-56 mt-2" />
              <Skeleton className="h-16 w-full mt-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex mt-5 ml-5 md:ml-8">
        <Skeleton className="h-10 w-10 mr-2" />
        <Skeleton className="h-10 w-40" />
        <div className="ml-2">
          <Skeleton className="h-10 w-40" />
        </div>
      </div>

      {/* Iframe */}
      <div className="mt-6 aspect-video pb-8 px-5 md:px-8">
        <Skeleton className="w-full h-full" />
      </div>
    </div>
  );
};

export default HeaderInfoSkeleton;
