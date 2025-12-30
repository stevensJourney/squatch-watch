import { Box, Tooltip } from '@mui/material';
import Image from 'next/image';
import { useEffect, useState } from 'react';

// Fun messages when you find the hiding bigfoot
const DISCOVERY_MESSAGES = [
  "👀 You found me! Don't tell the Illuminati!",
  '🤫 Shhh! I was never here...',
  "🦶 Nice spotting skills! You'd make a great tracker!",
  '📸 Quick! Take a photo before I disappear!',
  '🌲 How did you see me? I was so well hidden!',
  "🔍 A true believer! You've got the eye!",
  "🏃 Gotta go! Someone's coming!",
  '☕ Just taking a coffee break from being mysterious...'
];

// Predefined hiding positions (percentage-based)
const HIDING_SPOTS = [
  { bottom: '5%', right: '2%', rotation: -15 }, // Bottom right corner
  { top: '40%', left: '1%', rotation: 10 }, // Left side peeking
  { bottom: '30%', right: '1%', rotation: -10 }, // Right side peeking
  { top: '15%', right: '3%', rotation: 5 }, // Top right area
  { bottom: '50%', left: '2%', rotation: -5 } // Mid left
];

interface HidingBigfootProps {
  /** Unique ID for this bigfoot to ensure consistent position per page load */
  id?: string;
  /** Size of the bigfoot image */
  size?: number;
  /** Opacity - lower = more hidden */
  opacity?: number;
}

export const HidingBigfoot = ({ id = 'default', size = 40, opacity = 0.15 }: HidingBigfootProps) => {
  const [position, setPosition] = useState<(typeof HIDING_SPOTS)[0] | null>(null);
  const [message, setMessage] = useState('');
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Use the id to seed a "random" but consistent position
    const seed = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const spotIndex = seed % HIDING_SPOTS.length;
    const messageIndex = seed % DISCOVERY_MESSAGES.length;

    // Use setTimeout to avoid calling setState synchronously within an effect
    setTimeout(() => {
      setPosition(HIDING_SPOTS[spotIndex]);
      setMessage(DISCOVERY_MESSAGES[messageIndex]);
    }, 0);
  }, [id]);

  if (!position) return null;

  return (
    <Tooltip title={message} placement="top" arrow>
      <Box
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={{
          position: 'fixed',
          ...position,
          zIndex: 1,
          cursor: 'pointer',
          opacity: isHovered ? 0.9 : opacity,
          transform: `rotate(${position.rotation}deg) scale(${isHovered ? 1.2 : 1})`,
          transition: 'all 0.3s ease-in-out',
          filter: isHovered ? 'drop-shadow(0 0 10px rgba(143, 188, 143, 0.5))' : 'none',
          pointerEvents: 'auto',
          '&:hover': {
            animation: 'wiggle 0.5s ease-in-out'
          },
          '@keyframes wiggle': {
            '0%, 100%': { transform: `rotate(${position.rotation}deg) scale(1.2)` },
            '25%': { transform: `rotate(${position.rotation - 5}deg) scale(1.2)` },
            '75%': { transform: `rotate(${position.rotation + 5}deg) scale(1.2)` }
          }
        }}>
        <Image src="/Bigfoot.png" alt="" width={size} height={size} style={{ objectFit: 'contain' }} />
      </Box>
    </Tooltip>
  );
};

export default HidingBigfoot;
