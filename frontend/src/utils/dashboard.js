export function groupByDate(trips) {
  const map = {};

  trips.forEach(t => {
    const d = new Date(t.loading_date);
    const key = d.toISOString().split("T")[0]; // YYYY-MM-DD

    map[key] = (map[key] || 0) + 1;
  });

  return Object.entries(map)
    .sort((a, b) => new Date(a[0]) - new Date(b[0])) // ✅ OLD → NEW
    .map(([date, count]) => ({
      date,
      count
    }));
}

export function getWeeklyTrips(trips) {
  const dayMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const counts = { "Mon": 0, "Tue": 0, "Wed": 0, "Thu": 0, "Fri": 0, "Sat": 0, "Sun": 0 };

  // Calculate start (Monday) and end (Sunday) of current week
  const now = new Date();
  const monday = new Date(now);
  const currentDay = now.getDay();
  // Adjust to Monday: if Sunday (0), go back 6 days; if others, go to day 1.
  const diffToMonday = now.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
  monday.setDate(diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  trips.forEach(t => {
    const d = new Date(t.loading_date);
    if (d >= monday && d <= sunday) {
      const day = dayMap[d.getDay()];
      if (counts[day] !== undefined) {
        counts[day]++;
      }
    }
  });

  // Return in specific order Mon -> Sun
  return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => ({
    day,
    count: counts[day]
  }));
}

export function statusSplit(trips, key, successValues, labels = ["Completed", "Pending"]) {
  const values = Array.isArray(successValues) ? successValues : [successValues];
  const success = trips.filter(t => values.includes(t[key])).length;
  const pending = trips.length - success;

  return [
    { name: labels[0], value: success },
    { name: labels[1], value: pending }
  ];
}

export function monthlyProfit(trips) {
  const map = {};

  trips.forEach(t => {
    const d = new Date(t.loading_date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

    map[key] = (map[key] || 0) + Number(t.profit || 0);
  });

  return Object.entries(map)
    .sort((a, b) => new Date(a[0]) - new Date(b[0])) // ✅ OLD → NEW
    .map(([month, profit]) => ({
      month,
      profit
    }));
}
