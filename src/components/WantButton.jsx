'use client';

import Button from '@mui/material/Button';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

import { useWant } from '@/hooks/useWant';

const WantButton = ({ roomId, disabled }) => {
  const { isWantingToday, loading, toggle } = useWant(roomId);

  return (
    <Button
      variant={isWantingToday ? 'contained' : 'outlined'}
      color={isWantingToday ? 'error' : 'primary'}
      size="large"
      startIcon={isWantingToday ? <FavoriteIcon /> : <FavoriteBorderIcon />}
      onClick={toggle}
      disabled={loading || disabled}
      sx={{ minWidth: 200, py: 1.5 }}
    >
      {isWantingToday ? '我今天想要（點一下取消）' : '我今天想要'}
    </Button>
  );
};

export default WantButton;
