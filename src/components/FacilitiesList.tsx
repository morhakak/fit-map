import { useEffect, useState } from "react";
import axios from "axios";
import { APIProvider } from "@vis.gl/react-google-maps";
import type { Facility } from "../types/facility";
import { toast } from "sonner";
import { useUserLocation } from "@/hooks/useUserLocation";
import { fromITMtoWGS84 } from "@/utils/projection";
import FacilitySearchUI from "@/components/FacilitySearchUI";
import FacilityListPanel from "./FacilityListPanel";
import FacilityMap from "./FacilityMap";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CityQuerySchema, FacilitiesApiResponse } from "@/schemas/facilities";
import { devLog } from "@/utils/logger";

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
    queryFn: () => fetchFacilities(cityQuery),
    enabled: false,
    staleTime: Infinity,
  });

  const fetchFacilities = async (city: string): Promise<Facility[]> => {
    const response = await axios.get("/api/facilities", {
      params: { q: city },
    });

    const parsed = FacilitiesApiResponse.safeParse(response.data);
    if (!parsed.success) {
      devLog("Bad API shape:", parsed.error.format());
      throw new Error("נתוני השרת חזרו בפורמט לא תקין");
    }

    return parsed.data.result.records
      .filter((f) => f["רשות מקומית"] === city)
      .map((f) => {
        const { lat, lng } = fromITMtoWGS84(f["ציר X"], f["ציר Y"]);
        return {
          id: Number(f._id),
          name: f["שם המתקן"],
          lat,
          lng,
          street: f.רחוב,
          houseNumber: f["מספר בית"],
          type: f["סוג מתקן"],
          schoolServed: Boolean(f["משרת בית ספר"]),
          availability: f["פנוי לפעילות"],
          accessibility: Boolean(f["נגישות לנכים"]),
          status: f["מצב המתקן"],
        };
      });
  };

  useEffect(() => {
    devLog("Bad API shape:", error);
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
    const result = CityQuerySchema.safeParse(cityQuery);

    if (!result.success) {
      setErrorMessage(result.error.errors[0].message);
      toast.error(result.error.errors[0].message);
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
        className="relative w-full h-screen flex flex-col "
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
