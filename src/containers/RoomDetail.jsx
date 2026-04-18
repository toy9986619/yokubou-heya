'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { deleteDoc, doc } from 'firebase/firestore';

import { getFirebaseDb } from '@/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useRoom } from '@/hooks/useRoom';
import WantButton from '@/components/WantButton';
import MatchBanner from '@/components/MatchBanner';

const RoomDetail = ({ roomId, onDeleted }) => {
  const { user, loading: authLoading, signInWithGoogle } = useAuth();
  const { room, loading: roomLoading, error } = useRoom(roomId);
  const [copied, setCopied] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  if (authLoading || roomLoading) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="text.secondary">載入中...</Typography>
      </Box>
    );
  }

  if (!roomId) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">缺少 room 參數</Alert>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box
        sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-start' }}
      >
        <Typography>請先登入以查看此 room。</Typography>
        <Button variant="contained" onClick={signInWithGoogle}>
          以 Google 登入
        </Button>
      </Box>
    );
  }

  if (error || !room) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">找不到此 room，或你不是成員</Alert>
      </Box>
    );
  }

  const isCreator = room.creatorUid === user.uid;
  const inviteLink =
    typeof window !== 'undefined'
      ? `${window.location.origin}/join?token=${room.inviteToken}`
      : '';

  const copyInvite = async () => {
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
  };

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      const db = getFirebaseDb();
      await deleteDoc(doc(db, 'rooms', roomId));
      if (onDeleted) onDeleted();
    } catch (err) {
      console.error(err);
      setDeleteError(err.message || '刪除失敗');
      setDeleting(false);
    }
  };

  return (
    <Box
      sx={{
        p: 4,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        maxWidth: 600,
        mx: 'auto',
        width: '100%',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="overline" color="text.secondary">
            Room
          </Typography>
          <Typography variant="h5">{room.purpose}</Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
            <Chip size="small" label={room.isFull ? '成員 2/2' : '等待朋友加入（1/2）'} />
            {isCreator && <Chip size="small" label="你建立的" variant="outlined" />}
          </Box>
        </Box>
        {isCreator && (
          <IconButton
            onClick={(e) => setMenuAnchor(e.currentTarget)}
            aria-label="room options"
          >
            <MoreVertIcon />
          </IconButton>
        )}
      </Box>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem
          onClick={() => {
            setMenuAnchor(null);
            setConfirmOpen(true);
          }}
          sx={{ color: 'error.main' }}
        >
          刪除 Room
        </MenuItem>
      </Menu>

      <Dialog open={confirmOpen} onClose={() => !deleting && setConfirmOpen(false)}>
        <DialogTitle>刪除這個 Room？</DialogTitle>
        <DialogContent>
          <DialogContentText>
            用途：<strong>{room.purpose}</strong>
          </DialogContentText>
          <DialogContentText sx={{ mt: 2 }}>
            所有成員、達成紀錄、邀請連結都會一併消失，且無法復原。
          </DialogContentText>
          {deleteError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {deleteError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} disabled={deleting}>
            取消
          </Button>
          <Button color="error" onClick={handleDelete} disabled={deleting}>
            {deleting ? '刪除中...' : '確認刪除'}
          </Button>
        </DialogActions>
      </Dialog>

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
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
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

export default RoomDetail;
