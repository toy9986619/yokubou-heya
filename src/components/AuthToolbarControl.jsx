'use client';

import { useState } from 'react';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';

import { useAuth } from '@/contexts/AuthContext';

const AuthToolbarControl = () => {
  const { user, loading, signInWithGoogle, upgradeAnonymousToGoogle, signOut, isAnonymous } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);

  if (loading) {
    return <Box sx={{ width: 80 }} />;
  }

  if (!user) {
    return (
      <Button color="inherit" onClick={signInWithGoogle}>
        以 Google 登入
      </Button>
    );
  }

  const open = Boolean(anchorEl);
  const closeMenu = () => setAnchorEl(null);

  const displayName = user.displayName || (isAnonymous ? '訪客' : user.email || '使用者');

  return (
    <Box display="flex" alignItems="center" gap={1}>
      {isAnonymous && (
        <Typography variant="caption" sx={{ color: 'warning.light' }}>
          訪客模式
        </Typography>
      )}
      <Typography variant="body2">{displayName}</Typography>
      <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small" sx={{ p: 0 }}>
        <Avatar sx={{ width: 32, height: 32 }} src={user.photoURL || undefined}>
          {displayName.charAt(0).toUpperCase()}
        </Avatar>
      </IconButton>
      <Menu anchorEl={anchorEl} open={open} onClose={closeMenu}>
        {isAnonymous && (
          <MenuItem
            onClick={async () => {
              closeMenu();
              await upgradeAnonymousToGoogle();
            }}
          >
            綁定 Google 登入
          </MenuItem>
        )}
        <MenuItem
          onClick={async () => {
            closeMenu();
            await signOut();
          }}
        >
          登出
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default AuthToolbarControl;
