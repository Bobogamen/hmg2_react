export const formatDate = (date, language = "en") => {
  if (!date) return "";

  const parsedDate = new Date(date);

  const months = language === "bg"
    ? ["Яну", "Фев", "Мар", "Апр", "Май", "Юни", "Юли", "Авг", "Сеп", "Окт", "Ное", "Дек"]
    : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const day = String(parsedDate.getDate()).padStart(2, "0");
  const month = months[parsedDate.getMonth()];
  const year = parsedDate.getFullYear();

  return `${day}-${month}-${year}`;
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