import { Box } from '@mui/material';

interface BigfootIconProps {
  size?: number;
  className?: string;
}

export const BigfootIcon = ({ size = 48, className }: BigfootIconProps) => {
  return (
    <Box
      className={className}
      sx={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.7,
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
      }}>
      🦶
    </Box>
  );
};

export default BigfootIcon;


