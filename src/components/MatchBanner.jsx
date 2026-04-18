'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { useMatches } from '@/hooks/useMatches';

const MatchBanner = ({ roomId }) => {
  const { matches, matchedToday, loading } = useMatches(roomId);

  if (loading) return null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
      {matchedToday ? (
        <Alert severity="success" sx={{ fontSize: '1.1rem' }}>
          🎉 今天你們達成了！去做吧
        </Alert>
      ) : (
        <Alert severity="info">今天還沒達成。你的狀態對方看不到，安心按</Alert>
      )}
      {matches.length > 0 && (
        <Box>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            達成紀錄
          </Typography>
          <Box component="ul" sx={{ pl: 3, m: 0 }}>
            {matches.map((m) => (
              <Typography component="li" key={m.dayKey} variant="body2" color="text.secondary">
                {m.dayKey}
              </Typography>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default MatchBanner;
