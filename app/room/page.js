'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import RoomDetail from '@/containers/RoomDetail';

const RoomPageBody = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomId = searchParams.get('id');

  return <RoomDetail roomId={roomId} onDeleted={() => router.push('/')} />;
};

export default function RoomPage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ p: 4 }}>
          <Typography color="text.secondary">載入中...</Typography>
        </Box>
      }
    >
      <RoomPageBody />
    </Suspense>
  );
}
