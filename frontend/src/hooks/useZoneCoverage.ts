import { useCallback, useEffect, useState } from "react";

import { fetchZoneCoverage, ZoneCoverageInfo } from "@/services/zones.api";
import { ShippingRateZone } from "@/types/shipping";

export const useZoneCoverage = () => {
  const [zones, setZones] = useState<ZoneCoverageInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCoverage = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchZoneCoverage();
      setZones(data.zones);
    } catch {
      setError("No se pudo cargar la cobertura por barrio.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCoverage();
  }, [loadCoverage]);

  const getZoneCoverage = useCallback(
    (zone: ShippingRateZone): ZoneCoverageInfo | undefined =>
      zones.find((entry) => entry.zone === zone),
    [zones]
  );

  return {
    zones,
    loading,
    error,
    getZoneCoverage,
    reloadCoverage: loadCoverage,
  };
};
