import Link from 'next/link';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Chip from '@mui/material/Chip';

const RoomListItem = ({ room }) => {
  const label = room.isFull ? '2/2' : '1/2';
  return (
    <ListItem disablePadding secondaryAction={<Chip label={label} size="small" />}>
      <ListItemButton component={Link} href={`/room?id=${room.id}`}>
        <ListItemText
          primary={room.purpose || '（未命名）'}
          primaryTypographyProps={{ noWrap: true }}
        />
      </ListItemButton>
    </ListItem>
  );
};

export default RoomListItem;
