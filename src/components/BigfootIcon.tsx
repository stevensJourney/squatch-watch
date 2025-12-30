import { Box } from '@mui/material';
import Image from 'next/image';

interface BigfootIconProps {
  size?: number;
  className?: string;
  useImage?: boolean;
}

export const BigfootIcon = ({ size = 48, className, useImage = true }: BigfootIconProps) => {
  if (useImage) {
    return (
      <Box
        className={className}
        sx={{
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))'
        }}>
        <Image src="/Bigfoot.png" alt="Bigfoot" width={size} height={size} style={{ objectFit: 'contain' }} />
      </Box>
    );
  }

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
