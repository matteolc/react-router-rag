import { useLocales } from "remix-utils/locales/react";

const Timestamp = ({
  timestamp,
  showTime = true,
}: {
  timestamp: string | null;
  showTime?: boolean;
}) => {
  const locales = useLocales();
  if (!timestamp) return null;

  const date = new Date(timestamp);
  const dateTime = date.toISOString();
  const formattedDateTime = date.toLocaleString(locales, {
    dateStyle: "short",
    timeStyle: showTime ? "short" : undefined,
  });
  return <time dateTime={dateTime}>{formattedDateTime}</time>;
};

export { Timestamp };
