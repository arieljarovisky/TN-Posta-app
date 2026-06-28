import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ACTION_NAVIGATE_SYNC,
  NavigateSyncResponse,
  syncPathname,
} from "@tiendanube/nexo";

import nexo from "../NexoClient";

const NexoSyncRoute = ({ children }: { children: JSX.Element }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    syncPathname(nexo, pathname);
  }, [pathname]);

  useEffect(() => {
    const unsuscribe = nexo.suscribe(
      ACTION_NAVIGATE_SYNC,
      ({ path, replace }: NavigateSyncResponse) => {
        replace ? navigate(path) : navigate(path, { replace: true });
      }
    );

    return unsuscribe;
  }, [navigate]);

  return children;
};

export default NexoSyncRoute;
