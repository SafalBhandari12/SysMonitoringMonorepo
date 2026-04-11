import { regions } from "@repo/db";

const getRegions = (region: string) => {
  if (Object.values(regions).includes(region as any)) {
    return region as regions;
  }
  return regions.IN; // Default region
};

export default getRegions;
