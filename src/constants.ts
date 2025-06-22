export const allTypes = [
  "כדורגל",
  "כדורסל",
  "טניס",
  "שחיה",
  "כושר",
  "כדורעף",
  "משולב",
];

export const EPSG_2039_DEF =
  "+proj=tmerc +lat_0=31.7343936111111 +lon_0=35.2045169444444 +k=1.0000067 +x_0=219529.584 +y_0=626907.39 +ellps=GRS80 +units=m +no_defs";

export function getFacilityEmoji(type: string): string {
  if (/טניס/.test(type)) return "🎾";
  if (/כדורגל|דשא סינטטי/.test(type)) return "⚽";
  if (/כדורסל/.test(type)) return "🏀";
  if (/כדורעף/.test(type)) return "🏐";
  if (/התעמלות|חדר כושר|כושר/.test(type)) return "💪";
  if (/שחיה|בריכה/.test(type)) return "🏊";
  if (/ריצה|מסלול/.test(type)) return "🏃";
  if (/משולב/.test(type)) return "🏅";
  if (/אופניים|אופני/.test(type)) return "🚴";
  if (/טיפוס/.test(type)) return "🧗";
  if (/אולם/.test(type)) return "🏟️";
  return "🏃";
}
