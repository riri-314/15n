// library of tools for sales and stock management

// return formatted timestamp in human readable format
// adjust the date if it's before 6 AM, to get the previous day. For example, if the current date is 01-02-2024 05:00:00, the function will return 31_01_2022
export function getFormattedTimestamp(timestamp: Date = new Date()): string {
  const localDate = new Date(timestamp);

  // Adjust the date if it's before 6 AM
  if (localDate.getHours() < 6) {
    localDate.setDate(localDate.getDate() - 1);
  }

  const day = localDate.getDate().toString().padStart(2, "0");
  const month = (localDate.getMonth() + 1).toString().padStart(2, "0");
  const year = localDate.getFullYear().toString();

  return `${day}_${month}_${year}`;
}

// return formatted time in human readable format. Example: 23_59
export function getRoundedTime(roundingInterval: number = 5): string {
  const date = new Date();
  const minutes = date.getMinutes();
  let roundedMinutes = Math.ceil(minutes / roundingInterval) * roundingInterval;
  let hours = date.getHours();

  if (roundedMinutes == 60) {
    roundedMinutes = 0;
    if (hours == 23) {
      hours = 0;
    }
  } else if (roundedMinutes == 0) {
    roundedMinutes = 5;
  }

  const formattedTime = `${hours.toString().padStart(2, "0")}_${roundedMinutes
    .toString()
    .padStart(2, "0")}`;

  return formattedTime;
}

// sort the days in the articleTransactions object. The days are in the format "day_month_year"
export function sortDays(articleTransactions: any) {
  const sortedDays = Object.keys(articleTransactions).sort((a, b) => {
    const [dayA, monthA, yearA] = a.split("_").map((part) => parseInt(part));
    const [dayB, monthB, yearB] = b.split("_").map((part) => parseInt(part));

    // Compare the years first
    if (yearA !== yearB) {
      return yearA - yearB;
    }

    // Compare the months next
    if (monthA !== monthB) {
      return monthA - monthB;
    }

    // Compare the days last
    return dayA - dayB;
  });
  return sortedDays;
}

// Is it ugly? Yes. Does it work? Yes. Will I refactor it? No.
// Merge and sort the days from the articleTransactions object and the sortedDays array
export function mergeAndSortArrays(
  articleTransactions: any,
  sortedDays: any[] | null
) {
  const sortedDays2 = Object.keys(articleTransactions).sort((a, b) => {
    const [dayA, monthA, yearA] = a.split("_").map((part) => parseInt(part));
    const [dayB, monthB, yearB] = b.split("_").map((part) => parseInt(part));

    // Compare the years first
    if (yearA !== yearB) {
      return yearA - yearB;
    }

    // Compare the months next
    if (monthA !== monthB) {
      return monthA - monthB;
    }

    // Compare the days last
    return dayA - dayB;
  });

  //  const mergedSortedDays = [...sortedDays, ...sortedDays2];
  const mergedSortedDays = sortedDays
    ? [...sortedDays, ...sortedDays2]
    : sortedDays2;

  const uniqueSortedDays = Array.from(new Set(mergedSortedDays));

  const finalSortedDays = uniqueSortedDays.sort((a, b) => {
    const [dayA, monthA, yearA] = a
      .split("_")
      .map((part: any) => parseInt(part));
    const [dayB, monthB, yearB] = b
      .split("_")
      .map((part: any) => parseInt(part));

    // Compare the years first
    if (yearA !== yearB) {
      return yearA - yearB;
    }

    // Compare the months next
    if (monthA !== monthB) {
      return monthA - monthB;
    }

    // Compare the days last
    return dayA - dayB;
  });
  return finalSortedDays;
}

// sort the hours in the dayTransactions object. The hours are in the format "hour_minute"
export function sortHours(dayTransactions: any) {
  const sortedHours = Object.keys(dayTransactions).sort((a, b) => {
    const [hourA, minuteA] = a.split("_").map((part) => parseInt(part));
    const [hourB, minuteB] = b.split("_").map((part) => parseInt(part));

    if (hourA >= 0 && hourA < 6) {
      // Hour A is between midnight and 6 am, so it should come after midnight
      if (hourB >= 0 && hourB < 6) {
        // Both hour A and hour B are between midnight and 6 am, compare hours and minutes
        if (hourA === hourB) {
          return minuteA - minuteB;
        } else {
          return hourA - hourB;
        }
      } else {
        // Hour B is after 6 am, so hour A should come after hour B
        return 1;
      }
    } else if (hourB >= 0 && hourB < 6) {
      // Hour A is after 6 am, but hour B is between midnight and 6 am
      return -1;
    } else {
      // Both hours are after 6 am, compare hours and minutes
      if (hourA === hourB) {
        return minuteA - minuteB;
      } else {
        return hourA - hourB;
      }
    }
  });
  return sortedHours;
}

// parse the date string in the format "day_month_year" and return a Date object
export function parseDate(dateString: string) {
  const dateParts = dateString.split("_");

  // Note: The month - 1 because months are zero-indexed in JavaScript Date.
  const dateObject = new Date(
    Number(dateParts[2]),
    // Note: The month - 1 because months are zero-indexed in JavaScript Date.
    Number(dateParts[1]) - 1,
    Number(dateParts[0])
  );
  return dateObject;
}

/**
 * Calculates stock and sales data over a series of days based on article transactions.
 *
 * @param articleTransactions - An object where keys are dates (in string format) and values are objects containing transaction data for that date.
 * @param days - An array of days to consider for the calculation. Can be null.
 * @param stock_init - The initial stock count.
 * @param number_in_container - The number of items in a container.
 * @returns An array containing:
 *  - salesAndStock: An array of objects with date, stock, sales, and stockDiff.
 *  - salesDict: An object where keys are dates and values are sales numbers.
 *  - sales_tot: The total sales count.
 *  - stock: The final stock count.
 *  - addedToStock: The total number of items added to stock.
 *  - sales_tot_smart: The adjusted total sales count considering smart sales.
 *  - bacs: The number of containers needed based on sales_tot_smart and stock.
 *  - numberDaysWithNoSales: The number of days with no sales.
 */
export function calculateStockByDays(
  articleTransactions: any,
  days: any[] | null, //can be null
  stock_init: number,
  number_in_container: number
): [
  { [key: string]: number | Date }[],
  { [key: string]: number | Date },
  number,
  number,
  number,
  number,
  number,
  number
] {
  // check if articleTransactions is not empty
  if (
    articleTransactions != null &&
    Object.keys(articleTransactions).length === 0
  ) {
    // to be updated later, todo
    return [[], {}, 0, 0, 0, 0, 0, 0];
  }
  const salesDict: { [key: string]: number } = {}; //dict, key is a date, value is the sale number
  const salesAndStock: { [key: string]: number | Date }[] = []; // array of dict with date, stock and sales
  var sales_tot = 0;
  var sales_tot_smart = 0;
  var sales_fut = 0;
  let addedToStock = 0;
  var numberDaysWithSales = 0;
  var numberDaysWithNoSales = 0;

  // Iterate over each day in the articleTransactions map
  let stock: number = stock_init != null ? stock_init : 0;
  // add checks on days
  const mergedDays = mergeAndSortArrays(articleTransactions, days);

  for (const dayi in mergedDays) {
    const day = mergedDays[dayi];

    let sales = 0;
    let stockDiff = 0;
    if (Object.prototype.hasOwnProperty.call(articleTransactions, day)) {
      const dayTransactions = articleTransactions[day];

      const sortedHours = sortHours(dayTransactions);

      // Iterate over each time in the dayTransactions map
      for (const x in sortedHours) {
        const time = sortedHours[x];
        //console.log("hour: ", time)
        if (Object.prototype.hasOwnProperty.call(dayTransactions, time)) {
          const timeData = dayTransactions[time];
          const timesales = timeData.sales || 0;
          const setStock = timeData.stock !== undefined ? timeData.stock : null;

          sales += timesales;
          sales_fut += timesales;
          //console.log("set dtock: ", setStock)
          if (setStock != null) {
            if (setStock > stock) {
              addedToStock += setStock - stock;
            }
            stockDiff += setStock - stock;
            stock = setStock;
          } else {
            if (number_in_container > 24) {
              if (sales_fut >= number_in_container) {
                stock -=
                  sales_fut / number_in_container -
                  (sales_fut % number_in_container) / number_in_container;
                sales_fut = sales_fut % number_in_container;
              }
              //if sales_tot > number in container change stock and set sales_tot to the modulo
            } else {
              stock -= timesales;
            }
          }
        }
      }

      salesAndStock.push({
        date: parseDate(day),
        stock: stock,
        sales: sales,
        stockDiff: stockDiff,
      }); //stock
      //make 2 dict with day, stock and sales
      //add to dict the day and sales
      salesDict[day] = sales;
      sales_tot += sales;
      sales_tot_smart += sales;
      numberDaysWithSales += 1;
    } else {
      //make 2 dict with day and 0, 0
      //add to dict the day and 0
      salesAndStock.push({
        date: parseDate(day),
        stock: stock,
        sales: 0,
        stockDiff: 0,
      }); //stock
      salesDict[day] = 0;

      //if stock is smaller than 3 and not a fut smart_sales += sales/number of days having sales
      if (
        number_in_container <= 24 &&
        stock <= 3 &&
        days &&
        days.includes(day)
      ) {
        //and day is in days
        //sales_tot_smart += Math.round(sales_tot/numberDaysWithSales);
        numberDaysWithNoSales += 1;
      }
    }
  }
  sales_tot_smart += Math.round(
    (sales_tot / numberDaysWithSales) * numberDaysWithNoSales
  );
  //[[{date: Date, count: Int},{...},{...}],[{...},{...},{...}]], fist array of dict is stock over time, second is sales over time, return whatever if days dict is empty
  //{String (date ei: 03_08_2023): number (sales)} return a empty dict if days dict is empty
  //stock final and sales tot does not have to move
  let bacs = sales_tot_smart - stock;
  if (bacs <= 0) {
    bacs = 0;
  } else {
    bacs = Math.ceil(bacs / number_in_container);
  }

  return [
    salesAndStock,
    salesDict,
    sales_tot,
    stock,
    addedToStock,
    sales_tot_smart,
    bacs,
    numberDaysWithNoSales,
  ];
}
