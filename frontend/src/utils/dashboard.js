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

export function statusSplit(trips, key, uploadedValue) {
  const uploaded = trips.filter(t => t[key] === uploadedValue).length;
  const pending = trips.length - uploaded;

  return [
    { name: "Uploaded", value: uploaded },
    { name: "Pending", value: pending }
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
