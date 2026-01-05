import { BigfootIcon } from '@/components/BigfootIcon';
import ForestIcon from '@mui/icons-material/Forest';
import { Box, Typography } from '@mui/material';

export function PageHeader() {
  return (
    <Box sx={{ mb: 4, textAlign: 'center' }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <BigfootIcon size={80} />
      </Box>
      <Typography
        variant="h3"
        sx={{
          color: '#8FBC8F',
          fontWeight: 800,
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
          letterSpacing: '-0.02em'
        }}>
        SQUATCH WATCH
      </Typography>
      <Typography
        variant="h6"
        sx={{
          color: '#6B8E23',
          fontWeight: 400,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1
        }}>
        <ForestIcon fontSize="small" />
        Bigfoot Sighting Tracker
        <ForestIcon fontSize="small" />
      </Typography>
      <Typography variant="body2" sx={{ color: 'rgba(143, 188, 143, 0.5)', mt: 1, fontStyle: 'italic' }}>
        &ldquo;I want to believe&rdquo; — Synced offline with PowerSync
      </Typography>
    </Box>
  );
}


