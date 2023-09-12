import React from 'react';
import FadeLoader from 'react-spinners/FadeLoader';
import ClipLoader from 'react-spinners/ClipLoader';
import { Skeleton } from '@mui/material';

function FadeLoading({
  height,
  width,
  margin,
}: {
  width: number;
  height: number;
  margin: number;
}) {
  return (
    <FadeLoader color="#4464ab" height={height} width={width} margin={margin} />
  );
}

function ClipLoading({ size }: any) {
  return <ClipLoader color="#4464ab" size={size} />;
}

function SkeletonLoading() {
  return (
    <div>
      <p className="flex items-center px-[20px] py-[10px]">
        <span className="mr-2">
          <Skeleton
            animation="wave"
            variant="circular"
            width={40}
            height={40}
          />
        </span>
        <span className="flex flex-col justify-between items-start h-[40px]">
          <Skeleton
            animation="wave"
            variant="rectangular"
            width={100}
            height={15}
          />
          <Skeleton
            animation="wave"
            variant="rectangular"
            width={240}
            height={15}
          />
        </span>
      </p>
      <p className="flex items-center px-[20px] py-[10px]">
        <span className="mr-2">
          <Skeleton
            animation="wave"
            variant="circular"
            width={40}
            height={40}
          />
        </span>
        <span className="flex flex-col justify-between items-start h-[40px]">
          <Skeleton
            animation="wave"
            variant="rectangular"
            width={100}
            height={15}
          />
          <Skeleton
            animation="wave"
            variant="rectangular"
            width={240}
            height={15}
          />
        </span>
      </p>
      <p className="flex items-center px-[20px] py-[10px]">
        <span className="mr-2">
          <Skeleton
            animation="wave"
            variant="circular"
            width={40}
            height={40}
          />
        </span>
        <span className="flex flex-col justify-between items-start h-[40px]">
          <Skeleton
            animation="wave"
            variant="rectangular"
            width={100}
            height={15}
          />
          <Skeleton
            animation="wave"
            variant="rectangular"
            width={240}
            height={15}
          />
        </span>
      </p>
    </div>
  );
}

export { ClipLoading, FadeLoading, SkeletonLoading };
