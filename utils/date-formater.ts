import dateFormat from "dateformat";

export const formattedDate = (item: string | number | Date) => {
  const date = new Date(item);
  const bdTime = date.toLocaleString("en-US", { timeZone: "Asia/Dhaka" });
  return dateFormat(new Date(bdTime), "dddd, mmmm dS, yyyy, h:MM:ss TT");
};
