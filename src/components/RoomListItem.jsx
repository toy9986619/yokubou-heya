'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Chip from '@mui/material/Chip';

const DESKTOP_QUERY = '(min-width: 900px)';

const RoomListItem = ({ room, selected }) => {
  const router = useRouter();
  const label = room.isFull ? '2/2' : '1/2';

  const handleClick = (e) => {
    // On desktop, keep user on the home page and drive the right panel via
    // ?id=xxx. On mobile, fall through to the Link and navigate to /room.
    if (typeof window !== 'undefined' && window.matchMedia(DESKTOP_QUERY).matches) {
      e.preventDefault();
      router.replace(`/?id=${room.id}`, { scroll: false });
    }
  };

  return (
    <ListItem disablePadding secondaryAction={<Chip label={label} size="small" />}>
      <ListItemButton
        component={Link}
        href={`/room?id=${room.id}`}
        onClick={handleClick}
        selected={!!selected}
      >
        <ListItemText
          primary={room.purpose || '（未命名）'}
          slotProps={{ primary: { noWrap: true } }}
        />
      </ListItemButton>
    </ListItem>
  );
};

export default RoomListItem;
