import { ReactNode, useEffect, useState } from "react";
import tokens from "@nimbus-ds/tokens/dist/js/tokens";

import { useWindowWidth } from "@/hooks";

interface IResponsive {
  mobileContent: ReactNode;
  desktopContent: ReactNode;
}

const Responsive = ({ mobileContent, desktopContent }: IResponsive) => {
  const windowWidth = useWindowWidth();
  const [isMounted, setIsMounted] = useState(false);
  const breakpointMd = tokens.breakpoint.md.value.replace("px", "");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  if (windowWidth !== null && windowWidth <= Number(breakpointMd)) {
    return <>{mobileContent}</>;
  }

  return <>{desktopContent}</>;
};

export default Responsive;
