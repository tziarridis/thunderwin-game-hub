
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

// Simplified provider endpoint mapping. In a real scenario, this might come from a shared config or database.
const providerApiEndpoints: Record<string, string> = {
  ppeur: "demo.pragmaticplay.net",
  ppusd: "demo.pragmaticplay.net",
  gspeur: "api.gitslotpark.com",
  infineur: "infinapi-docs.axis-stage.infingame.com",
  // Add other providers here if needed
};

// Define a default health path, can be overridden if providers use different paths
const defaultHealthPath = "/health";

interface HealthCheckResult {
  providerId: string;
  status: "online" | "offline" | "error" | "timeout";
  error?: string;
  statusCode?: number;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { providerIds } = await req.json();

    if (!Array.isArray(providerIds) || providerIds.some(id => typeof id !== 'string')) {
      return new Response(JSON.stringify({ error: "Invalid input: providerIds must be an array of strings" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const healthCheckPromises = providerIds.map(async (id: string): Promise<HealthCheckResult> => {
      const apiEndpoint = providerApiEndpoints[id];
      if (!apiEndpoint) {
        return { providerId: id, status: "error", error: "Unknown provider ID" };
      }

      const healthUrl = `https://${apiEndpoint}${defaultHealthPath}`;
      
      try {
        console.log(`[check-provider-health] Checking ${id} at ${healthUrl}`);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const response = await fetch(healthUrl, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (response.ok) {
          return { providerId: id, status: "online", statusCode: response.status };
        } else {
          return { providerId: id, status: "offline", statusCode: response.status, error: `HTTP error: ${response.status}` };
        }
      } catch (error) {
        console.error(`[check-provider-health] Error checking ${id} at ${healthUrl}:`, error.message);
        if (error.name === 'AbortError' || error.message.includes('timed out')) {
          return { providerId: id, status: "timeout", error: "Request timed out" };
        }
        return { providerId: id, status: "error", error: error.message };
      }
    });

    const results = await Promise.all(healthCheckPromises);

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("[check-provider-health] General error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

