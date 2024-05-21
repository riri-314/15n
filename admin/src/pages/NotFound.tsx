import NotFoundView from "../sections/error/NotFoundView";
import { useEffect } from "react";

// ----------------------------------------------------------------------

export default function NotFoundPage() {
  useEffect(() => {
    // Save original body style
    const originalBodyStyle = document.body.style.cssText;

    // Override body styles
    document.body.style.cssText = "all: unset";

    // Cleanup function to restore original body styles
    return () => {
      document.body.style.cssText = originalBodyStyle;
    };
  }, []);
  return (
    <div id="not-found">
      <NotFoundView />
    </div>
  );
}
