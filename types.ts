export interface Site {
  id: string;
  title: string;
  subtitle?: string;
  category?: string; // Column E: 분류
  description: string;
  url: string;
  name?: string; // Extracted hostname/domain
  createdAt?: number;
}
