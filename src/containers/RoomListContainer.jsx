'use client';

import RoomListLayout from '@/components/RoomListLayout';
import RoomListItem from '@/components/RoomListItem';

const mockRooms = [
  {
    id: 1,
    name: "Room 1",
  }
];

const RoomListContainer = () => {
  return (
    <RoomListLayout>
      {mockRooms.map((room) => (
        <RoomListItem key={room.id} room={room} />
      ))}
    </RoomListLayout>
  );
};

export default RoomListContainer;
