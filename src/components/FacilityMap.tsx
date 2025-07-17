import { Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import { getFacilityEmoji } from "@/constants";
import type { Facility } from "@/types/facility";
import FacilityInfoWindow from "./FacilityInfoWindow";

interface Props {
  facilities: Facility[];
  userLocation: { lat: number; lng: number } | null;
  selectedFacility: Facility | null;
  setSelectedFacility: (f: Facility | null) => void;
  isMobile: boolean;
}

export default function FacilityMap({
  facilities,
  userLocation,
  selectedFacility,
  setSelectedFacility,
  isMobile,
}: Props) {
  return (
    <Map
      defaultCenter={{ lat: 31.877, lng: 34.738 }}
      defaultZoom={14}
      style={{ width: "100%", height: "100%" }}
      mapId="DEMO_MAP_ID"
      fullscreenControl={false}
      mapTypeControl={false}
    >
      {userLocation && (
        <AdvancedMarker position={userLocation} title="המיקום שלך">
          <Pin background="red" glyphColor="white" />
        </AdvancedMarker>
      )}

      {facilities.map((facility) => (
        <AdvancedMarker
          onClick={() => setSelectedFacility(facility)}
          key={facility.id}
          position={{ lat: facility.lat, lng: facility.lng }}
          title={facility.name}
        >
          <Pin
            background={"white"}
            glyphColor="white"
            borderColor="black"
            glyph={getFacilityEmoji(facility.type ?? "")}
          />
        </AdvancedMarker>
      ))}

      {selectedFacility && (
        <FacilityInfoWindow
          facility={selectedFacility}
          onClose={() => setSelectedFacility(null)}
          isMobile={isMobile}
        />
      )}
    </Map>
  );
}
