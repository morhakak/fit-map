import { useEffect, useState } from "react";
import axios from "axios";
import { APIProvider } from "@vis.gl/react-google-maps";
import type { Facility, RawFacility } from "../types/facility";
import { toast } from "sonner";
import { useUserLocation } from "@/hooks/useUserLocation";
import { fromITMtoWGS84 } from "@/utils/projection";
import FacilitySearchUI from "@/components/FacilitySearchUI";
import FacilityListPanel from "./FacilityListPanel";
import FacilityMap from "./FacilityMap";

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

        <FacilityListPanel
          facilities={facilities}
          isMobile={isMobile}
          isListOpen={isListOpen}
          setIsListOpen={setIsListOpen}
          setSelectedFacility={setSelectedFacility}
        />

        <FacilityMap
          facilities={facilities}
          userLocation={userLocation}
          selectedFacility={selectedFacility}
          setSelectedFacility={setSelectedFacility}
          isMobile={isMobile}
        />
      </div>
    </APIProvider>
  );
};

export default FacilitiesList;
