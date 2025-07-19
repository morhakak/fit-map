import { useState, type ChangeEvent } from "react";
import { allTypes, getFacilityEmoji } from "@/constants";
import { MdLocationOn, MdSearch } from "react-icons/md";
import { isValidInput } from "@/utils/validation";
import { LucideFilter } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { FaSpinner } from "react-icons/fa";

type Props = {
  cityQuery: string;
  setCityQuery: (val: string) => void;
  handleSearch: () => void;
  isLoading: boolean;
  typeFilter: string[];
  toggleType: (type: string) => void;
  errorMessage: string;
  setErrorMessage: (msg: string) => void;
};

export default function FacilitySearchUI({
  cityQuery,
  setCityQuery,
  handleSearch,
  isLoading,
  typeFilter,
  toggleType,
  setErrorMessage,
}: Props) {
  const [toggleFilter, setToggleFilter] = useState(false);
  return (
    <div className="flex flex-col gap-4 border border-blue-600">
      <div
        className="
      absolute left-1/2 -translate-x-1/2 z-10
      flex flex-row items-center justify-center gap-2
      p-2 w-[90%]"
      >
        <div className="relative bg-white shadow-lg rounded-lg w-full sm:w-[300px]">
          <button
            onClick={handleSearch}
            aria-label="חפש"
            disabled={!cityQuery}
            className="
          absolute left-0 top-1/2 -translate-y-1/2
          p-2 text-gray-600 hover:text-gray-800 hover:cursor-pointer disabled:text-gray-400"
          >
            {isLoading ? (
              <FaSpinner
                className="animate-spin text-gray-500 ml-2"
                size={20}
              />
            ) : (
              <MdSearch size={20} />
            )}
          </button>
          <div
            className="
          absolute right-0 top-1/2 -translate-y-1/2
          p-2 text-gray-400 pointer-events-none
        "
          >
            <MdLocationOn size={20} color="red" />
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={cityQuery}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const value = e.target.value;
                setCityQuery(value);
                setErrorMessage(
                  !isValidInput(value) ? "יש להזין עד 50 תווים בעברית בלבד" : ""
                );
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="חפש לפי רשות מקומית..."
              aria-label="חיפוש לפי עיר או רשות מקומית"
              className="
            w-full pr-10 pl-10 p-2 rounded-lg border
            text-right placeholder-gray-500 focus:outline-none
                  "
            />
          </div>
        </div>
        <Button
          variant="ghost"
          onClick={() => setToggleFilter((f) => !f)}
          aria-pressed={toggleFilter}
          className={cn(
            "relative flex items-center justify-center ",
            "w-10 h-10 p-0 overflow-hidden",
            "transition-colors duration-200 ease-in-out bg-white text-gray-800 shadow-lg",
            toggleFilter ? "border border-gray-500" : "border-0"
          )}
        >
          <LucideFilter size={16} className={cn("pointer-events-none")} />
        </Button>
      </div>
      {toggleFilter && (
        <div
          className={
            "absolute left-1/2 -translate-x-1/2 z-10 flex justify-center w-[100%] top-16 gap-2 px-2 flex-wrap"
          }
        >
          {allTypes.map((type) => {
            const active = typeFilter.includes(type);
            return (
              <Button
                key={type}
                onClick={() => toggleType(type)}
                className={`
            flex items-center gap-1 flex-shrink-0
            px-3 py-1 text-sm rounded-full transition
            border bg-white hover:bg-accent shadow-xl text-gray-900
            ${active ? "border-gray-500" : "border-transparent"}
          `}
              >
                <span>{getFacilityEmoji(type)}</span>
                <span>{type}</span>
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
}
