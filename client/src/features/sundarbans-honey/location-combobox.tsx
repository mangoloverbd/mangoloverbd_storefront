import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import { searchLocations, type LocationOption } from "./location-data";

type LocationComboboxProps = {
  id: string;
  label: string;
  placeholder: string;
  searchPlaceholder: string;
  emptyLabel: string;
  options: LocationOption[];
  value: string;
  disabled?: boolean;
  error?: string;
  onChange: (id: string) => void;
};

export function LocationCombobox({
  id,
  label,
  placeholder,
  searchPlaceholder,
  emptyLabel,
  options,
  value,
  disabled = false,
  error,
  onChange,
}: LocationComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const errorId = `${id}-error`;
  const selectedOption = options.find((option) => option.id === value);
  const filteredOptions = searchLocations(options, query);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) setQuery("");
  };

  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-foreground"
      >
        {label}
      </label>

      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-haspopup="listbox"
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            disabled={disabled}
            className="min-h-11 w-full justify-between whitespace-normal px-3 py-2 text-left font-normal"
          >
            <span className={cn("truncate", !selectedOption && "text-muted-foreground")}>
              {selectedOption
                ? `${selectedOption.nameBn} · ${selectedOption.nameEn}`
                : placeholder}
            </span>
            <ChevronsUpDown className="shrink-0 opacity-50" aria-hidden="true" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          className="w-[var(--radix-popover-trigger-width)] p-0"
        >
          <Command shouldFilter={false}>
            <CommandInput
              value={query}
              onValueChange={setQuery}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              className="h-11"
            />
            <CommandList>
              <CommandEmpty>{emptyLabel}</CommandEmpty>
              {filteredOptions.map((option) => (
                <CommandItem
                  key={option.id}
                  value={option.id}
                  onSelect={() => {
                    onChange(option.id);
                    handleOpenChange(false);
                  }}
                  className="min-h-11 cursor-pointer"
                >
                  <Check
                    className={cn(
                      "shrink-0",
                      option.id === value ? "opacity-100" : "opacity-0",
                    )}
                    aria-hidden="true"
                  />
                  <span>{option.nameBn} · {option.nameEn}</span>
                </CommandItem>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {error ? (
        <p id={errorId} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
