import { ForecastPoint } from "./api";

const QUICKCHART_URL = "https://quickchart.io/chart";

export async function generatePollutantChart(
  pollutant: string,
  data: ForecastPoint[],
  width = 800,
  height = 400,
): Promise<ArrayBuffer> {
  const labels = data.map((point) =>
    new Date(point.time * 1000).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  );

  const values = data.map((point) => {
    const pollutants = point.pollutants as unknown as Record<string, number>;
    return pollutants[pollutant] || 0;
  });

  const chartConfig = {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: `${pollutant} (µg/m³)`,
          data: values,
          borderColor: "#38bdf8", // sky-400
          backgroundColor: "rgba(56, 189, 248, 0.1)",
          borderWidth: 2,
          pointRadius: 0,
          fill: true,
          tension: 0.4,
        },
      ],
    },
    options: {
      title: {
        display: true,
        text: `${pollutant} Forecast (24 Hours)`,
        fontColor: "#94a3b8",
        fontSize: 16,
      },
      legend: {
        display: false,
      },
      scales: {
        xAxes: [
          {
            gridLines: {
              color: "rgba(148, 163, 184, 0.1)",
            },
            ticks: {
              fontColor: "#94a3b8",
            },
          },
        ],
        yAxes: [
          {
            gridLines: {
              color: "rgba(148, 163, 184, 0.1)",
            },
            ticks: {
              fontColor: "#94a3b8",
            },
          },
        ],
      },
    },
  };

  const response = await fetch(QUICKCHART_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      width,
      height,
      backgroundColor: "transparent",
      format: "png",
      chart: chartConfig,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to generate chart for ${pollutant}`);
  }

  return await response.arrayBuffer();
}
