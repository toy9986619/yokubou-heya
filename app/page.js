'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';

import { useAuth } from '@/contexts/AuthContext';
import RoomListContainer from '@/containers/RoomListContainer';
import RoomDetail from '@/containers/RoomDetail';

const HomeView = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedRoomId = searchParams.get('id');
  const { user, loading, signInWithGoogle } = useAuth();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Typography color="text.secondary">載入中...</Typography>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          gap: 3,
          p: 4,
          textAlign: 'center',
        }}
      >
        <Typography variant="h4">欲望部屋</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 420 }}>
          跟朋友各自偷偷表達「今天想要一起做某件事」。只有雙方都按下，系統才會同時通知你們。
          對方看不到你的狀態，你也看不到他的——直到達成的那一刻。
        </Typography>
        <Button variant="contained" size="large" onClick={signInWithGoogle}>
          以 Google 登入開始
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: '100%' }}>
      <Box
        sx={{
          width: { xs: '100%', md: 360 },
          borderRight: { xs: 0, md: 1 },
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
        }}
      >
        <Box sx={{ p: 2 }}>
          <Button
            component={Link}
            href="/rooms/new"
            variant="contained"
            startIcon={<AddIcon />}
            fullWidth
          >
            建立新 Room
          </Button>
        </Box>
        <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
          <RoomListContainer selectedRoomId={selectedRoomId} />
        </Box>
      </Box>
      {isDesktop && (
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            overflowY: 'auto',
          }}
        >
          {selectedRoomId ? (
            <RoomDetail
              roomId={selectedRoomId}
              onDeleted={() => router.replace('/', { scroll: false })}
            />
          ) : (
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography color="text.secondary">從左側選擇一個 Room，或建立新的</Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default function Home() {
  return (
    <Suspense
      fallback={
        <Box
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}
        >
          <Typography color="text.secondary">載入中...</Typography>
        </Box>
      }
    >
      <HomeView />
    </Suspense>
  );
}
