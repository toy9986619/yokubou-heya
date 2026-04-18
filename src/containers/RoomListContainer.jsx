'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import RoomListLayout from '@/components/RoomListLayout';
import RoomListItem from '@/components/RoomListItem';
import { useRoomList } from '@/hooks/useRoomList';

const RoomListContainer = () => {
  const { rooms, loading } = useRoomList();

  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          載入中...
        </Typography>
      </Box>
    );
  }

  if (rooms.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          還沒有 room。建立一個，把連結分享給朋友。
        </Typography>
      </Box>
    );
  }

  return (
    <RoomListLayout>
      {rooms.map((room) => (
        <RoomListItem key={room.id} room={room} />
      ))}
    </RoomListLayout>
  );
};

export default RoomListContainer;
