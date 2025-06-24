import proj4 from "proj4";
import { EPSG_2039_DEF } from "@/constants";

proj4.defs("EPSG:2039", EPSG_2039_DEF);

export const fromITMtoWGS84 = (x: number, y: number) => {
  const [lng, lat] = proj4("EPSG:2039", "WGS84", [x, y]);
  return { lat, lng };
};
