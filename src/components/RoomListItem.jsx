import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';

const RoomListItem = ({ room }) => {
  return (
    <ListItem>
      <ListItemButton>
        <ListItemText primary= {room.name} />
      </ListItemButton>
    </ListItem>
  );
};

RoomListItem.defaultProps = {
  room: {
    id: 0,
    name: "Room Name",
  },
};

export default RoomListItem;
