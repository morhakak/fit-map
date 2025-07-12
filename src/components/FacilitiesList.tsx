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
import { useQuery, useQueryClient } from "@tanstack/react-query";

const FacilitiesList = () => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [allFacilities, setAllFacilities] = useState<Facility[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(
    null
  );
  const [cityQuery, setCityQuery] = useState("");
  const [previousCityQuery, setPreviousCityQuery] = useState<string>(cityQuery);
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [isListOpen, setIsListOpen] = useState(false);
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const [errorMessage, setErrorMessage] = useState("");
  const { userLocation, resolvedCity } = useUserLocation();

  const qc = useQueryClient();
  const queryKey = ["facilities", cityQuery];
  const { data, isLoading, error, refetch } = useQuery<Facility[], Error>({
    queryKey: queryKey,
    queryFn: async () => {
      const response = await axios.get("/api/facilities", {
        params: { q: cityQuery },
      });

      const raws = response.data.result.records as RawFacility[];
      const filteredRaw = raws.filter((f) => f["רשות מקומית"] === cityQuery);
      return filteredRaw.map((f) => {
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
          schoolServed: Boolean(f["משרת בית ספר"]),
          availability: f["פנוי לפעילות"],
          accessibility: Boolean(f["נגישות לנכים"]),
          status: f["מצב המתקן"],
        };
      });
    },
    enabled: false,
    staleTime: Infinity,
  });

  useEffect(() => {
    console.error(error);
    if (error) {
      const msg =
        "אופס! נראה שיש לנו בעיה בקבלת הנתונים כרגע אנא נסה/נסי שוב מאוחר יותר.";
      toast.error(msg);
    }
  }, [error]);

  useEffect(() => {
    if (data) {
      setAllFacilities(data);
      if (data.length > 0) {
        setIsListOpen(true);
      } else {
        toast.info("לא נמצאו מתקנים ברשות המקומית שהזנת");
      }
      setErrorMessage("");
    }
  }, [data]);

  useEffect(() => {
    if (allFacilities.length > 0) {
      const filtered =
        typeFilter.length === 0
          ? allFacilities
          : allFacilities.filter((f) =>
              typeFilter.some((t) => f.type?.includes(t))
            );
      setFacilities(filtered);
    }
  }, [typeFilter, allFacilities]);

  const handleSearch = async () => {
    if (!isValidHebrewInput(cityQuery) || !cityQuery.trim()) {
      toast.warning("יש להזין עד 50 תווים בעברית בלבד");
      return;
    }

    const cached = qc.getQueryData<Facility[]>(queryKey);

    if (cached) {
      setAllFacilities(cached);
      setFacilities(cached);
      setIsListOpen(cached.length > 0);
      return;
    }

    if (cityQuery !== previousCityQuery) {
      setPreviousCityQuery(cityQuery);
      setSelectedFacility(null);
      setTypeFilter([]);
    }
    setErrorMessage("");
    refetch();
  };

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

  const isValidHebrewInput = (text: string): boolean => {
    const hebrewRegex = /^[\u0590-\u05FF\s]+$/;
    return hebrewRegex.test(text.trim()) && text.trim().length <= 50;
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
