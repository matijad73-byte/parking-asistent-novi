import React from 'react';
import { OfficialStreetPickerModal } from './OfficialStreetPickerModal';
import { REGIONAL_CITIES } from '../data/citiesData';
import { ParkingZone } from '../types';

interface ValjevoStreetPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStreet: (streetName: string, zone?: ParkingZone | null) => void;
  currentStreet?: string;
}

export const ValjevoStreetPickerModal: React.FC<ValjevoStreetPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectStreet,
  currentStreet,
}) => {
  const valjevoCity = REGIONAL_CITIES.find((c) => c.id === 'valjevo') || REGIONAL_CITIES[0];

  return (
    <OfficialStreetPickerModal
      isOpen={isOpen}
      onClose={onClose}
      city={valjevoCity}
      onSelectStreet={onSelectStreet}
      currentStreet={currentStreet}
    />
  );
};
