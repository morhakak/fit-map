import { useEffect, useState } from "react";
import axios from "axios";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
} from "@vis.gl/react-google-maps";
import type { Facility, RawFacility } from "../types/facility";
import { MdSchool, MdAccessibleForward } from "react-icons/md";
import { FaGoogle, FaWaze } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { getFacilityEmoji } from "../constants";
import { useUserLocation } from "@/hooks/useUserLocation";
import { fromITMtoWGS84 } from "@/utils/projection";
import FacilitySearchUI from "@/components/FacilitySearchUI";

const FacilitiesList = () => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [allFacilities, setAllFacilities] = useState<Facility[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(
    null
  );
  const [cityQuery, setCityQuery] = useState("");
  const [previousCityQuery, setPreviousCityQuery] = useState<string>(cityQuery);
  const [isLoading, setIsLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [isListOpen, setIsListOpen] = useState(false);
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const [errorMessage, setErrorMessage] = useState("");
  const { userLocation, resolvedCity } = useUserLocation();

  useEffect(() => {
    if (resolvedCity) {
      setCityQuery(resolvedCity);
    }
  }, [resolvedCity]);

  useEffect(() => {
    if (allFacilities.length > 0) {
      const filtered =
        typeFilter.length === 0
          ? allFacilities
          : allFacilities.filter((f) =>
              typeFilter.some((type) => f.type?.includes(type))
            );
      setFacilities(filtered);
    }
  }, [typeFilter, allFacilities]);

  const isValidInput = (text: string): boolean => {
    const hebrewRegex = /^[\u0590-\u05FF\s]+$/;
    return hebrewRegex.test(text.trim()) && text.trim().length <= 50;
  };

  const handleSearch = async () => {
    if (!cityQuery.trim()) return;

    if (!isValidInput(cityQuery)) {
      toast.warning("יש להזין עד 50 תווים בעברית בלבד");
      return;
    }
    if (cityQuery !== previousCityQuery) {
      setFacilities([]);
      setAllFacilities([]);
      setSelectedFacility(null);
      setPreviousCityQuery(cityQuery);
    }

    setIsLoading(true);
    try {
      const response = await axios.get(import.meta.env.VITE_DATA_API_BASE, {
        params: {
          resource_id: import.meta.env.VITE_DATA_API_SOURCE_ID,
          q: cityQuery,
          fields:
            "_id,רשות מקומית,מספר זיהוי,שם המתקן,סוג מתקן,רחוב,מספר בית,פנוי לפעילות,תאורה קיימת,נגישות לנכים,מצב המתקן,חניה לרכבים,משרת בית ספר,ציר X,ציר Y",
          limit: 1000,
        },
      });

      const mapped: Facility[] = (
        response.data.result.records as RawFacility[]
      ).map((f) => {
        const x = Number(f["ציר X"]);
        const y = Number(f["ציר Y"]);
        const { lat, lng } = fromITMtoWGS84(x, y);

        return {
          id: f._id,
          name: f["שם המתקן"],
          lat,
          lng,
          street: f["רחוב"],
          houseNumber: f["מספר בית"],
          type: f["סוג מתקן"],
          schoolServed: !!f["משרת בית ספר"],
          availability: f["פנוי לפעילות"],
          accessibility: Boolean(f["נגישות לנכים"]),
          status: f["מצב המתקן"],
        };
      });

      setAllFacilities(mapped);

      const filtered =
        typeFilter.length === 0
          ? mapped
          : mapped.filter((f) =>
              typeFilter.some((type) => f.type?.includes(type))
            );
      setFacilities(filtered);

      if (filtered.length > 0) {
        setIsListOpen(true);
      }

      if (mapped.length === 0) {
        toast.info("לא קיימים מתקני ספורט ברשות המקומית שהזנת");
      }
    } catch (error) {
      console.error("שגיאה בשליפת מתקנים:", error);
      toast.error("אירעה שגיאה במהלך החיפוש. נסה שוב מאוחר יותר.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleType = (type: string) => {
    setTypeFilter((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  useEffect(() => {
    document.body.style.overflow = isListOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isListOpen]);

  return (
    <APIProvider
      apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
      language="iw"
    >
      <div
        className="relative w-full h-screen flex flex-col lg:flex-row"
        dir="rtl"
        lang="he"
        role="application"
        aria-label="מפת מתקנים"
      >
        <FacilitySearchUI
          cityQuery={cityQuery}
          setCityQuery={setCityQuery}
          handleSearch={handleSearch}
          isLoading={isLoading}
          typeFilter={typeFilter}
          toggleType={toggleType}
          errorMessage={errorMessage}
          setErrorMessage={setErrorMessage}
        />

        {facilities.length > 0 && (
          <div
            className="fixed bottom-0 left-0 right-0 z-10 flex justify-center"
            onClick={() => setIsListOpen((prev) => !prev)}
          >
            <div className="w-12 h-1.5 bg-gray-400 rounded-full my-2 cursor-pointer"></div>
          </div>
        )}
        <AnimatePresence>
          {isMobile && facilities.length > 0 && (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: isListOpen ? 0 : "100%" }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 z-20 bg-white h-[60vh] rounded-t-2xl shadow-2xl overflow-y-auto touch-pan-y overscroll-contain"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              <div
                className="flex justify-center items-center gap-1 cursor-pointer py-2"
                onClick={() => setIsListOpen((prev) => !prev)}
                title="פתח/סגור רשימה"
                aria-label={
                  isListOpen ? "סגור רשימת מתקנים" : "פתח רשימת מתקנים"
                }
              >
                <div className="w-12 h-1.5 bg-gray-400 rounded-full" />
              </div>
              {isListOpen && (
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
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {!isMobile && facilities.length > 0 && (
          <div
            className="absolute top-0 right-0 w-[350px] h-full bg-white border-l overflow-y-auto shadow-md p-4 z-10"
            aria-label="רשימת מתקנים"
            role="complementary"
          >
            <div className="text-center font-semibold mb-3">רשימת מתקנים</div>
            <div
              className="space-y-2"
              role="list"
              aria-labelledby="facility-list-title"
            >
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
                      <MdAccessibleForward size={14} aria-hidden="true" /> נגיש
                      לנכים
                    </div>
                  )}
                  <div className="text-xs text-gray-500">
                    {facility.availability}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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
                    ? selectedFacility.street +
                      " " +
                      selectedFacility.houseNumber
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
                      aria-label={`ניווט אל ${selectedFacility.name} עם Waze`}
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
                    aria-label={`ניווט אל ${selectedFacility.name} עם Google Maps`}
                  >
                    <FaGoogle size={18} />
                    ניווט עם Google
                  </a>
                </div>
              </div>
            </InfoWindow>
          )}
        </Map>
      </div>
    </APIProvider>
  );
};

export default FacilitiesList;
