
const WORKER_ORIGIN = "https://aa-printsystem-api.aaprintox.workers.dev";

export async function onRequest(context) {
  const request = context.request;
  const incomingUrl = new URL(request.url);

  // Only forward API requests.
  if (!incomingUrl.pathname.startsWith("/api/")) {
    return context.next();
  }

  try {
    const targetUrl =
      WORKER_ORIGIN + incomingUrl.pathname + incomingUrl.search;

    const headers = new Headers(request.headers);

    // The Worker validates the request origin.
    headers.set("Origin", WORKER_ORIGIN);

    // Prevent API responses from being cached.
    headers.set("Cache-Control", "no-store");

    const requestOptions = {
      method: request.method,
      headers,
      redirect: "manual"
    };

    if (request.method !== "GET" && request.method !== "HEAD") {
      requestOptions.body = request.body;
    }

    // Forward the request, including the browser's session cookie.
    const workerRequest = new Request(targetUrl, requestOptions);
    const workerResponse = await fetch(workerRequest);

    // Return the Worker response to the same website.
    // This also forwards Set-Cookie headers for browser sessions.
    const responseHeaders = new Headers(workerResponse.headers);
    responseHeaders.set("Cache-Control", "no-store");

    return new Response(workerResponse.body, {
      status: workerResponse.status,
      statusText: workerResponse.statusText,
      headers: responseHeaders
    });

  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "Unable to connect to AA PrintSystem API."
      },
      { status: 502 }
    );
  }
}
