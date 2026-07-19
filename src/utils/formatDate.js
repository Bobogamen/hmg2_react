export const formatDate = (date, language = "en") => {

  if (!date) return "";

  const locale = language === "bg" ? "bg-BG" : "en-GB";

  const parts = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: language === "bg" ? "long" : "short",
    year: "numeric",
  }).formatToParts(new Date(date));

  const day = parts.find(p => p.type === "day")?.value;
  const month = parts.find(p => p.type === "month")?.value;
  const year = parts.find(p => p.type === "year")?.value;

  const capitalizedMonth =
    month.charAt(0).toUpperCase() + month.slice(1);

  return `${day} ${capitalizedMonth} ${year}`;
};

export const formatTimestamp = (date, language = "en") => {

  if (!date) return {
    date: "",
    time: ""
  };


  const locale = language === "bg"
    ? "bg-BG"
    : "en-GB";


  const parsedDate = new Date(date);


  const dateParts = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).formatToParts(parsedDate);


  const day = dateParts.find(p => p.type === "day")?.value;
  const month = dateParts.find(p => p.type === "month")?.value;
  const year = dateParts.find(p => p.type === "year")?.value;


  const time = new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).format(parsedDate);


  return {
    date: `${day}/${month}/${year}`,
    time
  };
};