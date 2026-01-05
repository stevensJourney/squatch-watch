import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';
import { Box, Chip, IconButton, ListItem, ListItemIcon, ListItemText, Tooltip, Typography } from '@mui/material';
import { CSSProperties } from 'react';
import { PhotoThumbnail } from './PhotoThumbnail';
import { Sighting } from './types';

export const ROW_HEIGHT = 160;

interface SightingRowProps {
  index: number;
  style: CSSProperties;
  sightings: Sighting[];
  canDelete: (sighting: Sighting) => boolean;
  onDelete: (sighting: Sighting) => void;
  formatDate: (date: string) => string;
}

export function SightingRow({ index, style, sightings, canDelete, onDelete, formatDate }: SightingRowProps) {
  const sighting = sightings[index];

  return (
    <Box style={style} sx={{ borderBottom: '1px solid rgba(34, 139, 34, 0.15)' }}>
      <ListItem
        sx={{
          height: ROW_HEIGHT,
          py: 2,
          alignItems: 'flex-start',
          transition: 'background 0.2s',
          '&:hover': {
            background: 'rgba(34, 139, 34, 0.1)'
          }
        }}
        secondaryAction={
          canDelete(sighting) ? (
            <IconButton
              edge="end"
              aria-label="delete"
              onClick={() => onDelete(sighting)}
              sx={{
                color: 'rgba(255,255,255,0.4)',
                mt: 1,
                '&:hover': {
                  color: '#CD5C5C',
                  background: 'rgba(205, 92, 92, 0.1)'
                }
              }}>
              <DeleteIcon />
            </IconButton>
          ) : (
            <Tooltip title="Not your sighting, buddy!">
              <Chip
                label="Other tracker"
                size="small"
                sx={{
                  height: 22,
                  fontSize: '0.7rem',
                  mt: 1,
                  background: 'rgba(100, 181, 246, 0.15)',
                  color: 'rgba(100, 181, 246, 0.7)',
                  border: '1px solid rgba(100, 181, 246, 0.3)'
                }}
              />
            </Tooltip>
          )
        }>
        <ListItemIcon sx={{ mt: 0.5, minWidth: 76 }}>
          {sighting.photo_uri ? <PhotoThumbnail uri={sighting.photo_uri} /> : <Box sx={{ fontSize: 28 }}>👣</Box>}
        </ListItemIcon>
        <ListItemText
          secondaryTypographyProps={{ component: 'div' }}
          primary={
            <Typography
              sx={{
                color: '#C8E6C9',
                fontWeight: 500,
                fontSize: '1rem',
                lineHeight: 1.5,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                pr: 4
              }}>
              {sighting.comments}
            </Typography>
          }
          secondary={
            <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, flexWrap: 'wrap' }}>
              <Typography component="span" variant="body2" sx={{ color: 'rgba(143, 188, 143, 0.6)' }}>
                📅 {formatDate(sighting.date)}
              </Typography>
              {sighting.photo_id && (
                <Chip
                  icon={<ImageIcon sx={{ fontSize: 14 }} />}
                  label="Photo"
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.7rem',
                    background: 'rgba(34, 139, 34, 0.2)',
                    color: '#8FBC8F',
                    border: '1px solid rgba(34, 139, 34, 0.3)',
                    '& .MuiChip-icon': { color: '#8FBC8F' }
                  }}
                />
              )}
              {!sighting.user_id && (
                <Chip
                  label="Local"
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.7rem',
                    background: 'rgba(139, 69, 19, 0.2)',
                    color: '#CD853F',
                    border: '1px solid rgba(139, 69, 19, 0.3)'
                  }}
                />
              )}
            </Box>
          }
        />
      </ListItem>
    </Box>
  );
}


