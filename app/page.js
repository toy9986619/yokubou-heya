import Box from '@mui/material/Box';
import InitFirebaseApp from '@/InitFirebaseApp';
import RoomListContainer from '@/containers/RoomListContainer';

export default function Home() {
  return (
    <Box component="main" height="100%" display="flex">
      <InitFirebaseApp />
      <Box>
        <RoomListContainer />
      </Box>
      <Box flex={1} minWidth={0}>

      </Box>
    </Box>
  );
}
