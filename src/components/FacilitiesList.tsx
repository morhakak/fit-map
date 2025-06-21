import { useEffect, useState, type ChangeEvent } from "react";
import axios from "axios";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
} from "@vis.gl/react-google-maps";
import proj4 from "proj4";
import type { Facility, RawFacility } from "../types/facility";
import { MdSchool, MdAccessibleForward } from "react-icons/md";
import { FaGoogle, FaWaze } from "react-icons/fa";
import { ImSpinner2 } from "react-icons/im";
import { Button } from "../components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "../components/ui/popover";
import { Checkbox } from "../components/ui/checkbox";
import { Input } from "../components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "../components/ui/select";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { Filter } from "lucide-react";

const allTypes = [
  "כדורגל",
  "כדורסל",
  "טניס",
  "שחיה",
  "כושר",
  "כדורעף",
  "משולב",
];

const FacilitiesList = () => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [allFacilities, setAllFacilities] = useState<Facility[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(
    null
  );
  const [cityQuery, setCityQuery] = useState(
    import.meta.env.VITE_DEFAULT_CITY || "תל אביב"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [isListOpen, setIsListOpen] = useState(false);
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  proj4.defs(
    "EPSG:2039",
    "+proj=tmerc +lat_0=31.7343936111111 +lon_0=35.2045169444444 +k=1.0000067 +x_0=219529.584 +y_0=626907.39 +ellps=GRS80 +units=m +no_defs"
  );

  const fromITMtoWGS84 = (x: number, y: number) => {
    const [lng, lat] = proj4("EPSG:2039", "WGS84", [x, y]);
    return { lat, lng };
  };

  function getFacilityEmoji(type: string): string {
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

  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          setUserLocation({ lat: 31.877, lng: 34.738 });
        }
      );
    } else {
      setUserLocation({ lat: 31.877, lng: 34.738 });
    }
  }, []);

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

  const handleSearch = async () => {
    if (!cityQuery.trim()) return;
    setIsLoading(true);
    try {
      const response = await axios.get(import.meta.env.VITE_DATA_API_BASE, {
        params: {
          resource_id: "2304b5de-c720-4b5c-bbc7-4cbab85e0ae8",
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
        toast("לא קיימים מתקני ספורט ברשות המקומית שהזנת");
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

  return (
    <APIProvider
      apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
      language="iw"
    >
      <div
        className="relative w-full h-screen"
        dir="rtl"
        lang="he"
        role="application"
        aria-label="מפת מתקנים"
      >
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex-col sm:flex items-center space-y-2 gap-2 sm:space-y-0 bg-white p-2 rounded-lg shadow max-w-[95%]">
          <Input
            type="text"
            value={cityQuery}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setCityQuery(e.target.value)
            }
            aria-label="חיפוש לפי עיר או רשות מקומית"
            placeholder="חפש לפי רשות מקומית..."
            className="w-full sm:w-[250px] p-2 rounded-lg border text-right outline-0 placeholder:text-gray-500"
          />
          <div className="flex gap-2">
            <Button
              onClick={handleSearch}
              className="px-4 py-1 bg-blue-500 text-white rounded hover:cursor-pointer hover:bg-blue-600 disabled:bg-blue-500 "
              disabled={isLoading || !cityQuery}
              aria-label="בצע חיפוש"
            >
              חפש
              {isLoading && (
                <ImSpinner2 className="animate-spin text-gray-200" size={24} />
              )}
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="hover:cursor-pointer">
                  סנן
                  <Filter />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48" side="bottom" align="start">
                <div className="space-y-2">
                  {allTypes.map((type) => (
                    <div key={type} className="flex items-center gap-2">
                      <Checkbox
                        id={type}
                        checked={typeFilter.includes(type)}
                        onCheckedChange={() => toggleType(type)}
                        className="hover:cursor-pointer"
                      />
                      <label htmlFor={type} className="text-sm">
                        {getFacilityEmoji(type)} {type}
                      </label>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

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
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 100) setIsListOpen(false);
                if (info.offset.y < -100) setIsListOpen(true);
              }}
              initial={{ y: "100%" }}
              animate={{ y: isListOpen ? 0 : "100%" }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 z-20 bg-white max-h-[60vh] rounded-t-2xl shadow-2xl overflow-y-auto touch-pan-y"
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
                  {selectedFacility.street} {selectedFacility.houseNumber}
                </div>
                <div className="text-base">
                  <span className="font-semibold">זמינות:</span>{" "}
                  {selectedFacility.availability ?? "לא ידוע"}
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
