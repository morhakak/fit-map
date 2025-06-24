import { AnimatePresence, motion } from "framer-motion";
import { MdAccessibleForward } from "react-icons/md";
import type { Facility } from "@/types/facility";
import { getFacilityEmoji } from "@/constants";

interface FacilityListPanelProps {
  facilities: Facility[];
  isMobile: boolean;
  isListOpen: boolean;
  setIsListOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedFacility: (facility: Facility) => void;
}

export default function FacilityListPanel({
  facilities,
  isMobile,
  isListOpen,
  setIsListOpen,
  setSelectedFacility,
}: FacilityListPanelProps) {
  if (facilities.length === 0) return null;

  if (isMobile) {
    return (
      <>
        <div
          className="fixed bottom-0 left-0 right-0 z-10 flex justify-center"
          onClick={() => setIsListOpen((prev) => !prev)}
        >
          <div className="w-12 h-1.5 bg-gray-400 rounded-full my-2 cursor-pointer"></div>
        </div>
        <AnimatePresence>
          {isListOpen && (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 z-20 bg-white h-[60vh] rounded-t-2xl shadow-2xl overflow-y-auto touch-pan-y overscroll-contain"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              <div
                className="flex justify-center items-center gap-1 cursor-pointer py-2"
                onClick={() => setIsListOpen(false)}
              >
                <div className="w-12 h-1.5 bg-gray-400 rounded-full" />
              </div>
              <div className="px-4">
                <div className="text-center font-semibold mb-3">
                  רשימת מתקנים
                </div>
                <div className="space-y-2">
                  {facilities.map((facility) => (
                    <div
                      key={facility.id}
                      className="cursor-pointer border p-3 rounded-xl hover:bg-gray-100"
                      onClick={() => setSelectedFacility(facility)}
                    >
                      <div className="flex items-center gap-2 text-lg font-bold">
                        <span>{getFacilityEmoji(facility.type || "")}</span>
                        <span>{facility.name}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {facility.type}
                      </div>
                      <div className="text-sm text-gray-600">
                        {facility.street} {facility.houseNumber}
                      </div>
                      {facility.accessibility && (
                        <div className="text-xs text-green-600 flex items-center gap-1">
                          <MdAccessibleForward size={14} /> נגיש לנכים
                        </div>
                      )}
                      <div className="text-xs text-gray-500">
                        {facility.availability}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <div
      className="absolute top-0 right-0 w-[350px] h-full bg-white border-l overflow-y-auto shadow-md p-4 z-10"
      aria-label="רשימת מתקנים"
      role="complementary"
    >
      <div className="text-center font-semibold mb-3">רשימת מתקנים</div>
      <div role="list" className="space-y-2">
        {facilities.map((facility) => (
          <div
            key={facility.id}
            className="cursor-pointer border p-3 rounded-xl hover:bg-gray-100"
            onClick={() => setSelectedFacility(facility)}
            role="listitem"
            tabIndex={0}
            aria-label={`בחר את ${facility.name}`}
          >
            <div className="flex items-center gap-2 text-lg font-bold">
              <span aria-hidden="true">
                {getFacilityEmoji(facility.type || "")}
              </span>
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
        ))}
      </div>
    </div>
  );
}
