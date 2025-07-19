import { InfoWindow } from "@vis.gl/react-google-maps";
import type { Facility } from "@/types/facility";
import { getFacilityEmoji } from "@/constants";
import { MdAccessibleForward, MdSchool } from "react-icons/md";
import { FaWaze } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

type Props = {
  facility: Facility;
  onClose: () => void;
};

const FacilityInfoWindow = ({ facility, onClose }: Props) => {
  return (
    <InfoWindow
      position={{ lat: facility.lat, lng: facility.lng }}
      onCloseClick={onClose}
      aria-label={`פרטים על המתקן ${facility.name}`}
      className="font-rubik"
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
          <p className="font-semibold text-nowrap">ניווט עם:</p>
          <a
            href={`https://waze.com/ul?ll=${facility.lat},${facility.lng}&navigate=yes`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1"
            aria-label={`ניווט אל ${facility.name} עם Waze`}
          >
            <FaWaze size={18} />
          </a>

          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${facility.lat},${facility.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1"
            aria-label={`ניווט אל ${facility.name} עם Google Maps`}
          >
            <FcGoogle size={18} />
          </a>
        </div>
      </div>
    </InfoWindow>
  );
};

export default FacilityInfoWindow;
