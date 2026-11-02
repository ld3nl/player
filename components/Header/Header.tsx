import { Field, Input, Label, Select } from "@headlessui/react";
import { MagnifyingGlassIcon, XIcon } from "@phosphor-icons/react";
import { cn } from "cnfast";
import { decode } from "he";
import Button from "@/components/Button/Button";
import { ROOT_CATEGORY_ID } from "@/lib/constants";
import type { HeaderProps } from "@/lib/types";

// Controlled filters make clearing a search and switching collections predictable.
const Header = ({
  search,
  category,
  categories,
  change_search,
  change_category,
}: HeaderProps) => {
  // The source splits a single category into several synonyms with the same ID.
  const grouped_categories = Array.from(
    categories.reduce((groups, item) => {
      if (item.id === ROOT_CATEGORY_ID) return groups;
      const names = groups.get(item.id) ?? new Set<string>();
      names.add(decode(item.name));
      groups.set(item.id, names);
      return groups;
    }, new Map<number, Set<string>>()),
  );

  return (
    <search
      aria-label="Filter talks"
      className={cn(
        "sticky top-0 z-20 -mx-4 border-y border-slate-200 bg-slate-50/95 px-4 py-4 backdrop-blur-lg sm:mx-0 sm:px-0",
      )}
    >
      <div
        className={cn(
          "grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] sm:gap-4",
        )}
      >
        <Field className={cn("min-w-0")}>
          <Label
            className={cn("mb-2 block text-sm font-medium text-slate-600")}
          >
            Search talks
          </Label>
          <div className={cn("relative")}>
            <MagnifyingGlassIcon
              size={20}
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute left-4 top-3 text-slate-500",
              )}
            />
            <Input
              id="search"
              type="search"
              name="search"
              value={search}
              onChange={(event) => change_search(event.target.value)}
              placeholder="What would you like to explore?"
              className={cn(
                "catalog-field appearance-none py-2 pl-11 pr-12 [&::-webkit-search-cancel-button]:appearance-none",
              )}
            />
            {search && (
              <Button
                ariaLabel="Clear search"
                onClick={() => change_search("")}
                className={cn("absolute right-0 top-0")}
              >
                <XIcon size={18} aria-hidden="true" />
              </Button>
            )}
          </div>
        </Field>
        <Field className={cn("min-w-0")}>
          <Label
            className={cn("mb-2 block text-sm font-medium text-slate-600")}
          >
            Category
          </Label>
          <Select
            id="categories"
            name="category"
            value={category ?? "all"}
            onChange={(event) =>
              change_category(
                event.target.value === "all"
                  ? null
                  : Number(event.target.value),
              )
            }
            className={cn(
              "catalog-field py-2 pl-4 pr-10 transition-colors data-hover:border-slate-400 data-focus:border-purple-600 motion-reduce:transition-none",
            )}
          >
            <option value="all">All categories</option>
            {grouped_categories.map(([id, names]) => (
              <option key={id} value={id}>
                {Array.from(names).join(" / ")}
              </option>
            ))}
          </Select>
        </Field>
      </div>
    </search>
  );
};

export default Header;
