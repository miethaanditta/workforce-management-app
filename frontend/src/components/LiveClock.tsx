import { useState, useEffect } from 'react';
import { Typography, Paper } from '@mui/material';

const LiveClock: React.FC = () => {
  const [time, setTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const dateString = time.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 4, md: 6 }, 
        background: 'rgba(255, 255, 255, 0.4)',
        backdropFilter: 'blur(20px)', 
        border: '1px solid rgba(255, 255, 255, 0.4)',
        borderRadius: 8, 
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.05)',
        textAlign: 'center',
        minWidth: { xs: '320px', md: '500px' }, 
      }}
    >
      <Typography
        variant="h1"
        sx={{
          fontWeight: 800,
          color: '#1a1a1a',
          letterSpacing: '-2px',
          fontSize: { xs: '3.5rem', md: '6rem' }, 
          lineHeight: 1
        }}
      >
        {timeString}
      </Typography>

      <Typography
        variant="h5"
        sx={{
          mt: 2,
          color: '#555',
          fontWeight: 500,
          letterSpacing: '1px',
          textTransform: 'uppercase'
        }}
      >
        {dateString}
      </Typography>
    </Paper>
  );
};

export default LiveClock;
