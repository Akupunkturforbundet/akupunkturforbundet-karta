export interface Practitioner {
  id: string;
  name: string;
  clinic?: string;
  streetAddress: string;
  postalCode: string;
  locality: string;
  latitude: number;
  longitude: number;
  phone?: string;
  email?: string;
  website?: string;
}
