import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";

export const useUserLocation = () => {
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [resolvedCity, setResolvedCity] = useState("");

  useEffect(() => {
    if (!navigator.geolocation) {
      setUserLocation({ lat: 31.877, lng: 34.738 });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });

        try {
          const res = await axios.get(import.meta.env.VITE_NOMINATIM_API_BASE, {
            params: {
              lat: latitude,
              lon: longitude,
              format: "json",
              "accept-language": "he",
            },
          });
          const cityName =
            res.data?.address?.city ||
            res.data?.address?.town ||
            res.data?.address?.village;
          if (cityName) setResolvedCity(cityName);
        } catch {
          console.warn("לא הצלחנו לשחזר את שם העיר מהמיקום");
        }
      },
      (error) => {
        setUserLocation({ lat: 31.877, lng: 34.738 });
        if (error.code === error.PERMISSION_DENIED) {
          toast.info(
            "לא ניתן לגשת למיקום שלך. הפעל הרשאות מיקום או הזן עיר ידנית."
          );
        }
      }
    );
  }, []);

  return { userLocation, resolvedCity };
};
