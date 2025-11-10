
export interface Scan {
  _id: string;
  name: string;
  type: 'file' | 'url';
  status: 'pending' | 'scanning' | 'completed' | 'failed';
  threatLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  threats: string[];
  findings: string;
  createdAt: string;
  completedAt?: string;
  duration?: number;
}
