export default function formatDate(inputDate) {
  let date = new Date(inputDate);
  let day =
    date.getUTCDate() < 10 ? "0" + date.getUTCDate() : date.getUTCDate();

  let month =
    date.getUTCMonth() < 10 ? "0" + date.getUTCMonth() : date.getUTCMonth();
  let year =
    date.getUTCFullYear() < 10
      ? "0" + date.getUTCFullYear()
      : date.getUTCFullYear();
  let hours =
    date.getUTCHours() < 10 ? "0" + date.getUTCHours() : date.getUTCHours();
  let minutes =
    date.getUTCMinutes() < 10
      ? "0" + date.getUTCMinutes()
      : date.getUTCMinutes();
  let seconds =
    date.getUTCSeconds() < 10
      ? "0" + date.getUTCSeconds()
      : date.getUTCSeconds();

  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
}
