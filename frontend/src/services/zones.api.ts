import axios from "@/app/Axios";
import { ShippingRateZone } from "@/types/shipping";

export interface ZoneCoverageInfo {
  zone: ShippingRateZone;
  label: string;
  description: string;
  postal_codes?: string;
  localities: string[];
}

export interface ZoneCoverageResponse {
  zones: ZoneCoverageInfo[];
}

export const fetchZoneCoverage = async (): Promise<ZoneCoverageResponse> => {
  const { data } = await axios.get<ZoneCoverageResponse>("/zones/coverage");

  return data;
};
