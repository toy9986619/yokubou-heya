'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';

import { getFirebaseDb } from '@/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { generateInviteToken } from '@/lib/inviteToken';

export default function NewRoomPage() {
  const router = useRouter();
  const { user, loading: authLoading, signInWithGoogle } = useAuth();
  const [purpose, setPurpose] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (authLoading) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="text.secondary">載入中...</Typography>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box
        sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          alignItems: 'flex-start',
        }}
      >
        <Typography>建立 room 需要先以 Google 登入。</Typography>
        <Button variant="contained" onClick={signInWithGoogle}>
          以 Google 登入
        </Button>
      </Box>
    );
  }

  if (user.isAnonymous) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="warning">訪客無法建立 room，請先綁定 Google 帳號（畫面右上角選單）。</Alert>
      </Box>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = purpose.trim();
    if (trimmed.length === 0) {
      setError('請輸入用途');
      return;
    }
    if (trimmed.length > 200) {
      setError('用途最多 200 字');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const db = getFirebaseDb();
      const token = generateInviteToken();
      const displayName = (user.displayName || user.email || '使用者').slice(0, 60);
      const roomData = {
        creatorUid: user.uid,
        memberUids: [user.uid],
        memberDisplayNames: { [user.uid]: displayName },
        isFull: false,
        purpose: trimmed,
        inviteToken: token,
        createdAt: serverTimestamp(),
      };
      const roomRef = await addDoc(collection(db, 'rooms'), roomData);
      const batch = writeBatch(db);
      batch.set(doc(db, 'invites', token), {
        roomId: roomRef.id,
        createdBy: user.uid,
        purpose: trimmed,
      });
      await batch.commit();
      router.push(`/room?id=${roomRef.id}`);
    } catch (err) {
      console.error(err);
      setError(err.message || '建立失敗');
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 500 }}>
      <Typography variant="h5" gutterBottom>
        建立新 Room
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        填寫你想跟朋友一起做的事。建立後會拿到一條邀請連結。
      </Typography>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
      >
        <TextField
          label="用途"
          placeholder="例如：一起看電影、一起去吃那家店"
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          autoFocus
          fullWidth
          multiline
          minRows={2}
          maxRows={5}
          slotProps={{ htmlInput: { maxLength: 200 } }}
          helperText={`${purpose.length} / 200`}
        />
        {error && <Alert severity="error">{error}</Alert>}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? '建立中...' : '建立'}
          </Button>
          <Button onClick={() => router.push('/')} disabled={submitting}>
            取消
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
