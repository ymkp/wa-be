export default class DateHelper {
  public static getYearYYYYdashMMdashDD(date: Date): string {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const monthString = month < 10 ? `0${month}` : month.toString();
    const dayString = day < 10 ? `0${day}` : day.toString();
    return `${date.getFullYear()}-${monthString}-${dayString};`;
  }

  public static getFirstDate0000AndLastDate2359(
    firstD: string,
    lastD: string,
  ): [Date, Date] {
    const firstDate = firstD ? new Date(firstD) : new Date(Date.now());
    const lastDate = lastD
      ? new Date(lastD)
      : firstDate
      ? new Date(firstDate)
      : new Date(Date.now());
    firstDate.setHours(0, 0, 0, 0);
    lastDate.setHours(23, 59, 59, 999);
    return [firstDate, lastDate];
  }

  public static getFirstDateAndLastDate(
    firstD: string,
    lastD: string,
  ): [Date, Date] {
    if (!firstD && !lastD) {
      return this.getFirstDate0000AndLastDate2359('', '');
    }
    const firstDate = firstD ? new Date(firstD) : new Date(Date.now());
    const lastDate = lastD
      ? new Date(lastD)
      : firstDate
      ? new Date(firstDate)
      : new Date(Date.now());

    return [firstDate, lastDate];
  }
}
