
export interface Scan {
  _id: string;
  name: string;
  type: 'file' | 'url' | 'api';
  status: 'pending' | 'scanning' | 'completed' | 'failed' | 'queued';
  threatLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  threats: number;
  findings: string;
  createdAt: string;
  completedAt?: string;
  duration?: number;
  progress?: number; 
}
