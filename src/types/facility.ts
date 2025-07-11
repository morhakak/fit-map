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

export type RawFacility = {
  _id: number;
  "שם המתקן": string;
  "ציר X": string | number;
  "ציר Y": string | number;
  רחוב?: string;
  "מספר בית"?: string;
  "סוג מתקן"?: string;
  "משרת בית ספר"?: string;
  "פנוי לפעילות"?: string;
  "נגישות לנכים"?: string;
  "מצב המתקן"?: string;
  "רשות מקומית": string;
};
