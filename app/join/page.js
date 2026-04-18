'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import {
  arrayUnion,
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';

import { getFirebaseDb } from '@/firebase';
import { useAuth } from '@/contexts/AuthContext';

const JoinView = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { user, loading: authLoading, signInAsAnonymous } = useAuth();

  const [phase, setPhase] = useState('resolving');
  const [roomId, setRoomId] = useState(null);
  const [roomPurpose, setRoomPurpose] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      setError('缺少邀請 token');
      setPhase('error');
      return;
    }
    if (authLoading) return;
    if (!user) {
      setPhase('need-name');
      return;
    }

    const run = async () => {
      try {
        const db = getFirebaseDb();
        const inviteSnap = await getDoc(doc(db, 'invites', token));
        if (!inviteSnap.exists()) {
          setError('邀請連結無效或已過期');
          setPhase('error');
          return;
        }
        const { roomId: resolvedRoomId, purpose } = inviteSnap.data();
        setRoomId(resolvedRoomId);
        setRoomPurpose(purpose || '');
        setPhase('confirm');
      } catch (err) {
        console.error(err);
        setError(err.message || '讀取邀請失敗');
        setPhase('error');
      }
    };
    run();
  }, [token, user, authLoading]);

  const handleAnonSignIn = async (e) => {
    e.preventDefault();
    const name = displayName.trim();
    if (!name) {
      setError('請輸入顯示名稱');
      return;
    }
    setError(null);
    setPhase('resolving');
    try {
      await signInAsAnonymous(name);
    } catch (err) {
      console.error(err);
      setError(err.message || '登入失敗');
      setPhase('need-name');
    }
  };

  const handleConfirmJoin = async () => {
    if (!roomId || !user) return;
    setPhase('joining');
    setError(null);
    try {
      const db = getFirebaseDb();
      await updateDoc(doc(db, 'rooms', roomId), {
        memberUids: arrayUnion(user.uid),
        isFull: true,
      });
      router.replace(`/room?id=${roomId}`);
    } catch (err) {
      if (err instanceof FirebaseError && err.code === 'permission-denied') {
        router.replace(`/room?id=${roomId}`);
        return;
      }
      console.error(err);
      setError(err.message || '加入失敗');
      setPhase('confirm');
    }
  };

  if (phase === 'need-name') {
    return (
      <Box
        sx={{
          p: 4,
          maxWidth: 500,
          mx: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Typography variant="h5">加入 Room</Typography>
        <Typography variant="body2" color="text.secondary">
          填一個名字讓朋友認得你。不需要 Google 登入就能加入，之後可以再綁定帳號。
        </Typography>
        <Box
          component="form"
          onSubmit={handleAnonSignIn}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <TextField
            label="顯示名稱"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            autoFocus
            fullWidth
            slotProps={{ htmlInput: { maxLength: 40 } }}
          />
          {error && <Alert severity="error">{error}</Alert>}
          <Button type="submit" variant="contained">
            繼續
          </Button>
        </Box>
      </Box>
    );
  }

  if (phase === 'confirm') {
    return (
      <Box
        sx={{
          p: 4,
          maxWidth: 500,
          mx: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Typography variant="h5">加入這個 Room？</Typography>
        <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
          <Typography variant="overline" color="text.secondary">
            用途
          </Typography>
          <Typography variant="body1">{roomPurpose || '（未命名）'}</Typography>
        </Box>
        {error && <Alert severity="error">{error}</Alert>}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="contained" onClick={handleConfirmJoin}>
            加入
          </Button>
          <Button onClick={() => router.push('/')}>取消</Button>
        </Box>
      </Box>
    );
  }

  if (phase === 'error') {
    return (
      <Box
        sx={{
          p: 4,
          maxWidth: 500,
          mx: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Alert severity="error">{error}</Alert>
        <Button onClick={() => router.push('/')}>回到首頁</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, maxWidth: 500, mx: 'auto' }}>
      <Typography color="text.secondary">
        {phase === 'joining' ? `正在加入「${roomPurpose}」...` : '處理中...'}
      </Typography>
    </Box>
  );
};

export default function JoinPage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ p: 4 }}>
          <Typography color="text.secondary">載入中...</Typography>
        </Box>
      }
    >
      <JoinView />
    </Suspense>
  );
}
