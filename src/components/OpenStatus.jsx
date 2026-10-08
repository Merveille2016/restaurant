import { useEffect, useState } from "react";
import { useLang } from "../lang-context.js";
import { isOpenNow } from "../data/site.js";

/** "Ouvert · ferme à 23h" / "Fermé · ouvre à 7h", in Yaoundé time. */
export default function OpenStatus({ className = "" }) {
  const { t } = useLang();
  const [open, setOpen] = useState(() => isOpenNow());

  useEffect(() => {
    const timer = setInterval(() => setOpen(isOpenNow()), 60_000);
    return () => clearInterval(timer);
  }, []);

  return (
    <span className={`open-status ${open ? "is-open" : "is-closed"} ${className}`.trim()}>
      <span className="open-dot" aria-hidden="true" />
      {open ? t("status.open") : t("status.closed")}
    </span>
  );
}
