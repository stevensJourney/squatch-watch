import { Card, CardContent, Typography } from '@mui/material';

interface StatsCardProps {
  count: number;
}

export function StatsCard({ count }: StatsCardProps) {
  return (
    <Card
      sx={{
        mb: 3,
        background: 'linear-gradient(145deg, rgba(34, 139, 34, 0.2) 0%, rgba(34, 139, 34, 0.05) 100%)',
        border: '1px solid rgba(34, 139, 34, 0.3)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
      }}>
      <CardContent sx={{ textAlign: 'center' }}>
        <Typography variant="overline" sx={{ color: '#6B8E23', letterSpacing: 2 }}>
          DOCUMENTED ENCOUNTERS
        </Typography>
        <Typography
          variant="h1"
          sx={{
            color: '#8FBC8F',
            fontWeight: 800,
            textShadow: '0 0 20px rgba(143, 188, 143, 0.3)'
          }}>
          {count}
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
          {count === 0 ? 'No sightings... yet' : count === 1 ? 'credible report on file' : 'credible reports on file'}
        </Typography>
      </CardContent>
    </Card>
  );
}


