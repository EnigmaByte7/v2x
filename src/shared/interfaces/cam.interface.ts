export interface CamPayload {
  stationId: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  vehicleType: 'CV' | 'EV';
  emergency: { sirenOn: boolean };
}

export interface DenmMessage {
  type: 'DENM';
  intersectionId: string;
  action: 'MOVE_LEFT' | 'MOVE_RIGHT' | 'HOLD' | 'CLEAR_PATH';
  evHeading: number;
}