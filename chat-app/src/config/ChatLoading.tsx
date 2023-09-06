import { Skeleton } from '@chakra-ui/skeleton';
import React from 'react';
import { Stack } from '@chakra-ui/layout';

function ChatLoading() {
  return (
    <Stack>
      <Skeleton height="40px" />
      <Skeleton height="40px" />
      <Skeleton height="40px" />
      <Skeleton height="40px" />
      <Skeleton height="40px" />
      <Skeleton height="40px" />
      <Skeleton height="40px" />
      <Skeleton height="40px" />
      <Skeleton height="40px" />
    </Stack>
  );
}

export default ChatLoading;
