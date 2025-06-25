import { InfoWindow } from "@vis.gl/react-google-maps";
import type { Facility } from "@/types/facility";
import { getFacilityEmoji } from "@/constants";
import { MdAccessibleForward, MdSchool } from "react-icons/md";
import { FaGoogle, FaWaze } from "react-icons/fa";

type Props = {
  facility: Facility;
  onClose: () => void;
  isMobile: boolean;
};

const FacilityInfoWindow = ({ facility, onClose, isMobile }: Props) => {
  return (
    <InfoWindow
      position={{ lat: facility.lat, lng: facility.lng }}
      onCloseClick={onClose}
      aria-label={`פרטים על המתקן ${facility.name}`}
    >
      <div dir="rtl" lang="he" className="text-right leading-relaxed space-y-1">
        <div
          className="flex items-center gap-2 text-xl font-bold"
          role="document"
          aria-labelledby="info-title"
        >
          <span className="text-xl">
            {getFacilityEmoji(facility.type ?? "")}
          </span>
          <h3 id="info-title">{facility.name}</h3>
          {facility.schoolServed && (
            <MdSchool
              className="text-blue-600"
              size={28}
              title="משרת בית ספר"
            />
          )}
        </div>

        <div className="text-base">
          <span className="font-semibold">סוג מתקן:</span> {facility.type}
        </div>

        <div className="text-base">
          <span className="font-semibold">כתובת:</span>{" "}
          {facility.street
            ? `${facility.street} ${facility.houseNumber}`
            : "לא צוינה"}
        </div>

        <div className="text-base">
          <span className="font-semibold">זמינות:</span>{" "}
          {facility.availability ?? "לא צוין"}
        </div>

        {facility.status && (
          <div className="text-base">
            <span className="font-semibold">מצב המתקן:</span> {facility.status}
          </div>
        )}

        {facility.accessibility && (
          <div className="flex items-center gap-2 text-base text-green-700">
            <MdAccessibleForward size={20} />
            <span>נגיש לנכים</span>
          </div>
        )}

        <div className="flex gap-2 mt-2">
          {isMobile && (
            <a
              href={`https://waze.com/ul?ll=${facility.lat},${facility.lng}&navigate=yes`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 text-sm"
              aria-label={`ניווט אל ${facility.name} עם Waze`}
            >
              <FaWaze size={18} />
              ניווט עם Waze
            </a>
          )}
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${facility.lat},${facility.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
            aria-label={`ניווט אל ${facility.name} עם Google Maps`}
          >
            <FaGoogle size={18} />
            ניווט עם Google
          </a>
        </div>
      </div>
    </InfoWindow>
  );
};

export default FacilityInfoWindow;
