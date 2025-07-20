import { useState, type ChangeEvent } from "react";
import { allTypes, getFacilityEmoji } from "@/constants";
import { MdLocationOn, MdSearch } from "react-icons/md";
import { isValidInput } from "@/utils/validation";
import { LucideFilter } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { FaSpinner } from "react-icons/fa";
import { motion, type Variants, AnimatePresence } from "framer-motion";

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

const boxVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: "easeIn",
    },
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
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
    <div className="flex flex-col gap-4 border rounded-xl">
      <div
        className="
      absolute left-1/2 -translate-x-1/2 z-10
      flex flex-row items-center justify-center gap-2
      p-2 w-[90%] rounded-xl"
      >
        <div className="relative bg-white shadow-lg rounded-xl w-full sm:w-[300px]">
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
          p-2 text-gray-400 pointer-events-none rounded-xl
        "
          >
            <MdLocationOn size={20} color="red" />
          </div>
          <div className="flex gap-2 rounded-xl">
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
            w-full pr-10 pl-10 p-2 rounded-xl border
            text-right placeholder-gray-500 focus:outline-none"
            />
          </div>
        </div>
        <Button
          variant="ghost"
          onClick={() => setToggleFilter((f) => !f)}
          aria-pressed={toggleFilter}
          className={cn(
            "relative flex items-center justify-center ",
            "w-10 h-10 p-0 overflow-hidden rounded-xl",
            "transition-colors duration-200 ease-in-out bg-white text-gray-500 shadow-lg hover:cursor-pointer",
            toggleFilter ? "border border-gray-500" : "border-0"
          )}
        >
          <LucideFilter size={16} className={cn("pointer-events-none")} />
        </Button>
      </div>
      <AnimatePresence>
        {toggleFilter && (
          <motion.div
            variants={boxVariants}
            initial="hidden"
            animate={toggleFilter ? "visible" : "hidden"}
            exit="hidden"
            className={
              "absolute left-1/2 -translate-x-1/2 z-10 flex justify-center w-full top-16 gap-2 px-2 flex-wrap"
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
            border bg-white hover:bg-accent shadow-xl text-gray-900 hover:cursor-pointer
            ${active ? "border-gray-500" : "border-transparent"}
          `}
                >
                  <span>{getFacilityEmoji(type)}</span>
                  <span>{type}</span>
                </Button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
