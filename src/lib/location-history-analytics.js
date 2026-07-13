const MS_PER_DAY = 24 * 60 * 60 * 1000;

function average(values) {
  const numbers = values.filter((value) => Number.isFinite(value));
  if (!numbers.length) {
    return null;
  }

  return numbers.reduce((sum, value) => sum + value, 0) / numbers.length;
}

function round(value, digits = 1) {
  if (!Number.isFinite(value)) {
    return null;
  }

  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function difference(current, comparison) {
  if (!Number.isFinite(current) || !Number.isFinite(comparison)) {
    return null;
  }

  return round(current - comparison);
}

function isoDaysAgo(days, referenceDate = new Date()) {
  return new Date(referenceDate.getTime() - days * MS_PER_DAY).toISOString();
}

function yearAgoWindow(referenceDate = new Date()) {
  const center = new Date(referenceDate);
  center.setUTCFullYear(center.getUTCFullYear() - 1);

  const from = new Date(center);
  from.setUTCDate(from.getUTCDate() - 3);

  const to = new Date(center);
  to.setUTCDate(to.getUTCDate() + 3);

  return {
    from: from.toISOString(),
    to: to.toISOString(),
  };
}

function filterObservationsByRange(observations, fromIso, toIso) {
  const fromMs = Date.parse(fromIso);
  const toMs = Date.parse(toIso);

  return observations.filter((observation) => {
    const observedMs = Date.parse(observation.observedAt);
    return observedMs >= fromMs && observedMs <= toMs;
  });
}

export function buildLocationHistoryInsights({
  observations = [],
  referenceDate = new Date(),
}) {
  const sorted = [...observations].sort(
    (left, right) => Date.parse(right.observedAt) - Date.parse(left.observedAt),
  );
  const latest = sorted[0] ?? null;
  const currentTemperature = latest?.temperature ?? null;
  const currentHumidity = latest?.humidity ?? null;

  const last30Days = filterObservationsByRange(
    sorted,
    isoDaysAgo(30, referenceDate),
    referenceDate.toISOString(),
  );
  const lastYearWindow = yearAgoWindow(referenceDate);
  const sameTimeLastYear = filterObservationsByRange(
    sorted,
    lastYearWindow.from,
    lastYearWindow.to,
  );

  const avg30DayTemperature = round(average(last30Days.map((row) => row.temperature)));
  const avg30DayHumidity = round(average(last30Days.map((row) => row.humidity)));
  const avgLastYearTemperature = round(average(sameTimeLastYear.map((row) => row.temperature)));
  const avgLastYearHumidity = round(average(sameTimeLastYear.map((row) => row.humidity)));
  const allTimeAvgTemperature = round(average(sorted.map((row) => row.temperature)));

  return {
    current: {
      observedAt: latest?.observedAt ?? null,
      temperature: currentTemperature,
      humidity: currentHumidity,
      description: latest?.description ?? latest?.condition ?? null,
    },
    averages: {
      last30Days: {
        temperature: avg30DayTemperature,
        humidity: avg30DayHumidity,
        sampleSize: last30Days.length,
      },
      allTime: {
        temperature: allTimeAvgTemperature,
        sampleSize: sorted.length,
      },
      sameTimeLastYear: {
        temperature: avgLastYearTemperature,
        humidity: avgLastYearHumidity,
        sampleSize: sameTimeLastYear.length,
        windowStart: lastYearWindow.from,
        windowEnd: lastYearWindow.to,
      },
    },
    comparisons: {
      currentVs30DayAverage: difference(currentTemperature, avg30DayTemperature),
      currentVsSameTimeLastYear: difference(currentTemperature, avgLastYearTemperature),
      last30DaysVsSameTimeLastYear: difference(avg30DayTemperature, avgLastYearTemperature),
    },
    hasEnoughDataForPublicInsights: sorted.length >= 30 && sameTimeLastYear.length >= 3,
  };
}
