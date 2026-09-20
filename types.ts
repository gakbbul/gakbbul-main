export interface Site {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  url: string;
  name?: string; // Extracted hostname/domain
  createdAt?: number;
}
