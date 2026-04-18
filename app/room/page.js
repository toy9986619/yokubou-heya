'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Snackbar from '@mui/material/Snackbar';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

import { useAuth } from '@/contexts/AuthContext';
import { useRoom } from '@/hooks/useRoom';
import WantButton from '@/components/WantButton';
import MatchBanner from '@/components/MatchBanner';

const RoomView = () => {
  const searchParams = useSearchParams();
  const roomId = searchParams.get('id');
  const { user, loading: authLoading, signInWithGoogle } = useAuth();
  const { room, loading: roomLoading, error } = useRoom(roomId);
  const [copied, setCopied] = useState(false);

  if (authLoading || roomLoading) {
    return (
      <Box p={4}>
        <Typography color="text.secondary">載入中...</Typography>
      </Box>
    );
  }

  if (!roomId) {
    return (
      <Box p={4}>
        <Alert severity="error">缺少 room 參數</Alert>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box p={4} display="flex" flexDirection="column" gap={2} alignItems="flex-start">
        <Typography>請先登入以查看此 room。</Typography>
        <Button variant="contained" onClick={signInWithGoogle}>
          以 Google 登入
        </Button>
      </Box>
    );
  }

  if (error || !room) {
    return (
      <Box p={4}>
        <Alert severity="error">找不到此 room，或你不是成員</Alert>
      </Box>
    );
  }

  const isCreator = room.creatorUid === user.uid;
  const otherMember = (room.memberUids || []).find((uid) => uid !== user.uid);
  const inviteLink =
    typeof window !== 'undefined'
      ? `${window.location.origin}/join?token=${room.inviteToken}`
      : '';

  const copyInvite = async () => {
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
  };

  return (
    <Box p={4} display="flex" flexDirection="column" gap={4} maxWidth={600} mx="auto">
      <Box>
        <Typography variant="overline" color="text.secondary">
          Room
        </Typography>
        <Typography variant="h5">{room.purpose}</Typography>
        <Box display="flex" gap={1} mt={1}>
          <Chip size="small" label={room.isFull ? '成員 2/2' : '等待朋友加入（1/2）'} />
          {isCreator && <Chip size="small" label="你建立的" variant="outlined" />}
        </Box>
      </Box>

      {!room.isFull && isCreator && (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            邀請連結
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontFamily: 'monospace',
              wordBreak: 'break-all',
              bgcolor: 'action.hover',
              p: 1,
              borderRadius: 1,
            }}
          >
            {inviteLink}
          </Typography>
          <Button
            startIcon={<ContentCopyIcon />}
            onClick={copyInvite}
            sx={{ mt: 1 }}
            size="small"
          >
            複製
          </Button>
        </Paper>
      )}

      {!room.isFull && !isCreator && (
        <Alert severity="info">對方還沒加入。加入後才能開始判斷達成。</Alert>
      )}

      {room.isFull && (
        <>
          <Box display="flex" justifyContent="center" py={2}>
            <WantButton roomId={room.id} />
          </Box>
          <MatchBanner roomId={room.id} />
          <Alert severity="info" variant="outlined" sx={{ fontSize: '0.85rem' }}>
            你的狀態對方完全看不到。雙方都按下「想要」的那一刻，系統才會同時通知你們。
            跨日（UTC+8 午夜）後狀態自動失效。
          </Alert>
        </>
      )}

      <Snackbar
        open={copied}
        autoHideDuration={2000}
        onClose={() => setCopied(false)}
        message="已複製邀請連結"
      />
    </Box>
  );
};

export default function RoomPage() {
  return (
    <Suspense fallback={<Box p={4}><Typography color="text.secondary">載入中...</Typography></Box>}>
      <RoomView />
    </Suspense>
  );
}
