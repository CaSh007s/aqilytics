import { NextRequest, NextResponse } from "next/server";
import { fetchAQI, fetchForecast } from "@/services/api";
import { generateReportPDF } from "@/services/report-generator";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const city = searchParams.get("city");

  if (!city) {
    return NextResponse.json(
      { error: "City parameter is required" },
      { status: 400 },
    );
  }

  try {
    const [aqiData, forecastData] = await Promise.all([
      fetchAQI(city),
      fetchForecast(city),
    ]);

    const pdfBuffer = await generateReportPDF([
      {
        city: aqiData.city,
        data: aqiData,
        forecast: forecastData,
      },
    ]);

    const filename = `AQI_Report_${city}_${new Date().toISOString().split("T")[0]}.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("PDF generation failed:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 },
    );
  }
}
