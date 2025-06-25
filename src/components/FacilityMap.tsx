import {
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
} from "@vis.gl/react-google-maps";
import { FaGoogle, FaWaze } from "react-icons/fa";
import { MdSchool, MdAccessibleForward } from "react-icons/md";
import { getFacilityEmoji } from "@/constants";
import type { Facility } from "@/types/facility";

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
      style={{ width: "100%", height: "600px" }}
      mapId="DEMO_MAP_ID"
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
        <InfoWindow
          position={{
            lat: selectedFacility.lat,
            lng: selectedFacility.lng,
          }}
          onCloseClick={() => setSelectedFacility(null)}
          aria-label={`פרטים על המתקן ${selectedFacility.name}`}
        >
          <div
            dir="rtl"
            lang="he"
            className="text-right leading-relaxed space-y-1"
          >
            <div
              className="flex items-center gap-2 text-xl font-bold"
              role="document"
              aria-labelledby="info-title"
            >
              <span className="text-xl">
                {getFacilityEmoji(selectedFacility.type ?? "")}
              </span>
              <h3 id="info-title">{selectedFacility.name}</h3>
              {selectedFacility.schoolServed && (
                <MdSchool
                  className="text-blue-600"
                  size={28}
                  title="משרת בית ספר"
                />
              )}
            </div>
            <div className="text-base">
              <span className="font-semibold">סוג מתקן:</span>{" "}
              {selectedFacility.type}
            </div>
            <div className="text-base">
              <span className="font-semibold">כתובת:</span>{" "}
              {selectedFacility.street
                ? `${selectedFacility.street} ${selectedFacility.houseNumber}`
                : "לא צוינה"}
            </div>
            <div className="text-base">
              <span className="font-semibold">זמינות:</span>{" "}
              {selectedFacility.availability ?? "לא צוין"}
            </div>

            {selectedFacility.status && (
              <div className="text-base">
                <span className="font-semibold">מצב המתקן:</span>{" "}
                {selectedFacility.status}
              </div>
            )}

            {selectedFacility.accessibility && (
              <div className="flex items-center gap-2 text-base text-green-700">
                <MdAccessibleForward size={20} />
                <span>נגיש לנכים</span>
              </div>
            )}

            <div className="flex gap-2 mt-2">
              {isMobile && (
                <a
                  href={`https://waze.com/ul?ll=${selectedFacility.lat},${selectedFacility.lng}&navigate=yes`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 text-sm"
                >
                  <FaWaze size={18} />
                  ניווט עם Waze
                </a>
              )}
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${selectedFacility.lat},${selectedFacility.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
              >
                <FaGoogle size={18} />
                ניווט עם Google
              </a>
            </div>
          </div>
        </InfoWindow>
      )}
    </Map>
  );
}
