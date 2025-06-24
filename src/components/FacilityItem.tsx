import { MdAccessibleForward } from "react-icons/md";
import { getFacilityEmoji } from "@/constants";
import type { Facility } from "@/types/facility";

type FacilityItemProps = {
  facility: Facility;
  onSelect: (facility: Facility) => void;
};

export default function FacilityItem({
  facility,
  onSelect,
}: FacilityItemProps) {
  return (
    <div
      key={facility.id}
      className="cursor-pointer border p-3 rounded-xl hover:bg-gray-100"
      onClick={() => onSelect(facility)}
    >
      <div className="flex items-center gap-2 text-lg font-bold">
        <span>{getFacilityEmoji(facility.type || "")}</span>
        <span>{facility.name}</span>
      </div>
      <div className="text-sm text-gray-600">{facility.type}</div>
      <div className="text-sm text-gray-600">
        {facility.street} {facility.houseNumber}
      </div>
      {facility.accessibility && (
        <div className="text-xs text-green-600 flex items-center gap-1">
          <MdAccessibleForward size={14} /> נגיש לנכים
        </div>
      )}
      <div className="text-xs text-gray-500">{facility.availability}</div>
    </div>
  );
}
