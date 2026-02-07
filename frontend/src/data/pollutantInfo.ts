export const pollutantInfo = {
  "PM2.5": {
    name: "Fine Particulate Matter",
    source: "Vehicle exhaust, burning fuels, industrial emissions.",
    effect:
      "Penetrates deep into lungs and bloodstream. Causes asthma, heart attacks, and respiratory issues.",
    limit: "15 µg/m³ (24-hour mean)",
  },
  PM10: {
    name: "Coarse Particulate Matter",
    source: "Dust from roads, farms, construction sites, and pollen.",
    effect:
      "Irritates eyes, nose, and throat. Aggravates asthma and lung diseases.",
    limit: "45 µg/m³ (24-hour mean)",
  },
  NO2: {
    name: "Nitrogen Dioxide",
    source: "Burning of fuel (cars, trucks, buses, power plants).",
    effect: "Inflames lining of lungs, reduces immunity to lung infections.",
    limit: "25 µg/m³ (24-hour mean)",
  },
  Ozone: {
    name: "Ground-Level Ozone",
    source:
      "Chemical reaction between sunlight and pollutants from cars/industry.",
    effect:
      "Causes chest pain, coughing, throat irritation. Worsens bronchitis.",
    limit: "100 µg/m³ (8-hour mean)",
  },
  SO2: {
    name: "Sulfur Dioxide",
    source:
      "Burning fossil fuels (coal/oil) by power plants and industrial facilities.",
    effect:
      "Harms the respiratory system, causes coughing and mucus secretion.",
    limit: "40 µg/m³ (24-hour mean)",
  },
  CO: {
    name: "Carbon Monoxide",
    source: "Incomplete combustion of fuel (cars, stoves, fireplaces).",
    effect:
      "Reduces oxygen delivery to body's organs (like the heart and brain).",
    limit: "4 mg/m³ (24-hour mean)",
  },
};
