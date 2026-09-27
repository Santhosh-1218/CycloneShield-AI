export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export type LocationStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'unavailable' | 'skipped';

export interface UserLocation {
  latitude: number | null;
  longitude: number | null;
  status: LocationStatus;
  errorMessage?: string;
}

export interface CycloneScenario {
  id: string;
  name: string;
  category: number;
  windSpeed: number; // km/h
  rainfall: number; // mm / 24h
  stormSurge: number; // meters
  etaHours: number;
  coordinates: [number, number]; // [lat, lng]
  status: string;
}

export interface InfrastructureAsset {
  id: string;
  name: string;
  category: 'Hospital' | 'Shelter' | 'Road' | 'Bridge' | 'Power Grid';
  location: string;
  coordinates: [number, number];
  riskLevel: RiskLevel;
  populationServed: string;
  accessibility: 'Accessible' | 'Limited' | 'Blocked' | 'At Risk';
  status: 'Operational' | 'Standby' | 'Damaged' | 'Evacuated';
  capacity?: string;
  generatorBackup?: boolean;
}

export interface DisasterAlert {
  id: string;
  title: string;
  severity: RiskLevel;
  district: string;
  summary: string;
  timestamp: string;
  actionRequired: string;
}

export interface SimulationParams {
  windSpeed: number;
  rainfall: number;
  stormSurge: number;
  durationHours: number;
}

export interface SimulationResult {
  riskScore: number; // 0 - 100
  populationExposed: number;
  criticalAssetsCount: number;
  highRiskRoadsKm: number;
  evacuationRecommended: boolean;
}

export interface DataSource {
  id: string;
  name: string;
  type: string;
  status: 'Not connected' | 'Planned' | 'Active';
  purpose: string;
  lastUpdated: string;
}

export interface HistoryRecord {
  id: string;
  action: string;
  category: string;
  timestamp: string;
  details: string;
  user: string;
}
