// Simple test to verify API behavior
const API_URL = "http://localhost:8080";

async function testAccountAvailable() {
  try {
    console.log("Testing /api/account-available endpoint...");

    const response = await fetch(`${API_URL}/api/account-available?account=test@example.com`, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log("Response status:", response.status);
    console.log("Response headers:", Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response:", errorText);
      return;
    }

    const result = await response.json();
    console.log("Success response:", result);

  } catch (error) {
    console.error("Network error:", error);
  }
}

testAccountAvailable();