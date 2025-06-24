import type { ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Filter } from "lucide-react";
import { ImSpinner2 } from "react-icons/im";
import { allTypes, getFacilityEmoji } from "@/constants";
import { isValidInput } from "@/utils/validation";

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
  errorMessage,
  setErrorMessage,
}: Props) {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex-col sm:flex items-center space-y-2 gap-2 sm:space-y-0 bg-white p-2 rounded-lg shadow max-w-[95%]">
      <Input
        type="text"
        value={cityQuery}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          const value = e.target.value;
          setCityQuery(value);
          if (!isValidInput(value)) {
            setErrorMessage("יש להזין עד 50 תווים בעברית בלבד");
          } else {
            setErrorMessage("");
          }
        }}
        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        aria-label="חיפוש לפי עיר או רשות מקומית"
        placeholder="חפש לפי רשות מקומית..."
        className="w-full sm:w-[250px] p-2 rounded-lg border text-right outline-0 placeholder:text-gray-500"
      />
      {errorMessage && (
        <div className="text-red-500 text-sm mt-1 text-right">
          {errorMessage}
        </div>
      )}

      <div className="flex gap-2">
        <Button
          onClick={handleSearch}
          className="px-4 py-1 bg-blue-500 text-white rounded hover:cursor-pointer hover:bg-blue-600 disabled:bg-blue-500"
          disabled={isLoading || !cityQuery || !isValidInput(cityQuery)}
          aria-label="בצע חיפוש"
        >
          חפש
          {isLoading && (
            <ImSpinner2 className="animate-spin text-gray-200 ml-2" size={20} />
          )}
        </Button>

        <Popover>
          <PopoverTrigger asChild role="dialog">
            <Button variant="outline" className="hover:cursor-pointer">
              סנן
              <Filter className="ml-1" />
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
  );
}
