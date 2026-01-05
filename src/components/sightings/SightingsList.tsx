import { useEffect, useState } from 'react';
import { List } from 'react-window';
import { ROW_HEIGHT, SightingRow } from './SightingRow';
import { Sighting } from './types';

interface SightingsListProps {
  sightings: Sighting[];
  canDelete: (sighting: Sighting) => boolean;
  onDelete: (sighting: Sighting) => void;
  formatDate: (date: string) => string;
}

interface RowProps {
  sightings: Sighting[];
  canDelete: (sighting: Sighting) => boolean;
  onDelete: (sighting: Sighting) => void;
  formatDate: (date: string) => string;
}

export function SightingsList({ sightings, canDelete, onDelete, formatDate }: SightingsListProps) {
  const rowProps: RowProps = { sightings, canDelete, onDelete, formatDate };
  const [listHeight, setListHeight] = useState(500);

  useEffect(() => {
    const updateHeight = () => {
      setListHeight(Math.max(400, Math.floor(window.innerHeight * 0.6)));
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  return (
    <List<RowProps>
      defaultHeight={listHeight}
      rowComponent={SightingRow}
      rowCount={sightings.length}
      rowHeight={ROW_HEIGHT}
      rowProps={rowProps}
      overscanCount={5}
      style={{ height: listHeight }}
    />
  );
}


