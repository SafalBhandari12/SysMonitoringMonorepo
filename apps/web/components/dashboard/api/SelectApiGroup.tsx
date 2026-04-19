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
}: {
  setGroup: (group: ApiGroup | null) => void;
}) {
  useEffect(() => {
    // Fetch API groups from the backend
    setLoading(true);
    fetch("/api/dashboard/api-groups")
      .then((response) => response.json())
      .then((data) => {
        setApiGroups(data);
        setLoading(false);
      });
  }, []);

  const [apiGroups, setApiGroups] = useState<ApiGroup[]>([]);
  const [loading, setLoading] = useState(true);

  return (
    <Combobox
      items={apiGroups}
      onValueChange={(value) => {
        const group = apiGroups.find((g) => g.name === value);
        setGroup(group || null);
      }}
    >
      <ComboboxInput placeholder="Select an API group" />
      <ComboboxContent>
        <ComboboxEmpty>No items found.</ComboboxEmpty>
        <ComboboxList>
          {loading ? (
            <div className="py-2 px-4 text-sm text-muted-foreground">
              Loading...
            </div>
          ) : (
            apiGroups.map((item) => (
              <ComboboxItem key={item.id} value={item.name}>
                {item.name}
              </ComboboxItem>
            ))
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
