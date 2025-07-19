export interface Facility {
  id: number;
  name: string;
  lat: number;
  lng: number;
  street?: string;
  houseNumber?: string;
  type?: string;
  schoolServed?: boolean;
  availability?: string;
  accessibility?: boolean;
  status?: string;
}
