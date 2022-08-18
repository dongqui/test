function nth(date: number) {
  if (date > 3 && date < 21) return 'th';
  switch (date % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
}

export default function dateFormat(dateStr: string) {
  if (!dateStr) {
    return '';
  }

  const dateObj = new Date(dateStr);
  const date = dateObj.getDate();
  const month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][dateObj.getMonth()];
  const year = dateObj.getFullYear();

  return `${date + nth(date)} ${month} ${year}`;
}
