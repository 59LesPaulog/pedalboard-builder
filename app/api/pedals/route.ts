export async function GET() {
  const apiUrl = "https://guitar-pedal-api.vercel.app/pedals";
  const fallbackUrl =
    "https://raw.githubusercontent.com/brianmaierjr/guitar-pedal-api/main/all-pedals.json";

  try {
    const response = await fetch(apiUrl, {
      cache: "no-store",
    });

    if (response.ok) {
      const data = await response.json();
      return Response.json(data);
    }

    console.warn("Primary API failed. Trying fallback JSON.");
  } catch (error) {
    console.warn("Primary API unavailable. Trying fallback JSON.", error);
  }

  try {
    const fallbackResponse = await fetch(fallbackUrl, {
      cache: "no-store",
    });

    if (!fallbackResponse.ok) {
      return Response.json(
        {
          error: "Both primary API and fallback JSON failed",
          status: fallbackResponse.status,
        },
        { status: 500 }
      );
    }

    const fallbackData = await fallbackResponse.json();
    return Response.json(fallbackData);
  } catch (error) {
    console.error("Fallback pedal data failed:", error);

    return Response.json(
      {
        error: "Could not load pedal data",
      },
      { status: 500 }
    );
  }
}