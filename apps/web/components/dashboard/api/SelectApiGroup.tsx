import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { useEffect, useState } from "react";

type ApiGroup = {
  id: string;
  name: string;
};

export default function SelectApiGroup({
  setGroup,
  disabled = false,
}: {
  setGroup: (group: ApiGroup | null) => void;
  disabled?: boolean;
}) {
  const [apiGroups, setApiGroups] = useState<ApiGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearchValue, setDebouncedSearchValue] = useState("");

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearchValue(searchValue);
    }, 300);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [searchValue]);

  useEffect(() => {
    let isActive = true;

    setLoading(true);

    fetch(
      `/api/dashboard/api-groups${
        debouncedSearchValue
          ? `?q=${encodeURIComponent(debouncedSearchValue)}`
          : ""
      }`,
    )
      .then((response) => response.json())
      .then((data) => {
        if (!isActive) {
          return;
        }
        console.log("Fetched API groups:", data);
        setApiGroups(data);
        setLoading(false);
      })
      .catch(() => {
        if (!isActive) {
          return;
        }

        setLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [debouncedSearchValue]);

  return (
    <Combobox
      items={apiGroups}
      onValueChange={(value) => {
        const group = apiGroups.find((g) => g.name === value);
        setGroup(group || null);
      }}
      disabled={disabled}
    >
      <ComboboxInput
        placeholder="Select an API group"
        disabled={disabled}
        onChange={(event) => {
          setSearchValue(event.currentTarget.value);
        }}
      />
      <ComboboxContent>
        {apiGroups.length === 0 && !loading && (
          <ComboboxEmpty className="py-2 px-4 text-sm text-muted-foreground justify-start">
            No API groups found.
          </ComboboxEmpty>
        )}
        <ComboboxList>
          {loading ? (
            <div className="py-2 px-4 text-sm text-muted-foreground">
              Loading...
            </div>
          ) : (
            apiGroups.map((item) => (
              <ComboboxItem
                key={item.id}
                value={item.name}
                className={"hover:cursor-pointer"}
              >
                {item.name}
              </ComboboxItem>
            ))
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
