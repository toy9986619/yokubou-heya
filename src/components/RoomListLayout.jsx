import Box from '@mui/material/Box';
import List from '@mui/material/List';

const RoomListLayout = ({ children }) => {
  return (
    <Box width="100%" maxWidth="360px" bgcolor="background.paper">
      <nav>
        <List>
          {children}
        </List>
      </nav>
    </Box>
  )
};

export default RoomListLayout;
