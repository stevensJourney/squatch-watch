import { BigfootIcon } from '@/components/BigfootIcon';
import { Box, Typography } from '@mui/material';
import { keyframes } from '@mui/system';

interface LoadingScreenProps {
  message?: string;
  submessage?: string;
}

// Footstep animation - alternating left/right footprints
const walkLeft = keyframes`
  0%, 100% { opacity: 0.3; transform: translateY(0); }
  50% { opacity: 1; transform: translateY(-5px); }
`;

const walkRight = keyframes`
  0%, 100% { opacity: 1; transform: translateY(-5px); }
  50% { opacity: 0.3; transform: translateY(0); }
`;

export const LoadingScreen = ({
  message = 'Tracking Bigfoot...',
  submessage = 'Following the footprints'
}: LoadingScreenProps) => (
  <Box
    sx={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(180deg, #1a2f1a 0%, #0d1a0d 50%, #0a1408 100%)',
      gap: 3
    }}>
    {/* Animated footprints */}
    <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
      <Box
        sx={{
          fontSize: 40,
          transform: 'rotate(-15deg)',
          animation: `${walkLeft} 1s ease-in-out infinite`
        }}>
        👣
      </Box>
      <Box
        sx={{
          fontSize: 40,
          transform: 'rotate(15deg)',
          animation: `${walkRight} 1s ease-in-out infinite`
        }}>
        👣
      </Box>
    </Box>

    <BigfootIcon size={80} />

    <Typography
      variant="h5"
      sx={{
        color: '#8FBC8F',
        fontWeight: 600,
        textShadow: '0 2px 4px rgba(0,0,0,0.5)'
      }}>
      {message}
    </Typography>
    <Typography
      variant="body2"
      sx={{
        color: 'rgba(143, 188, 143, 0.6)',
        fontStyle: 'italic'
      }}>
      {submessage}
    </Typography>
  </Box>
);

export default LoadingScreen;
