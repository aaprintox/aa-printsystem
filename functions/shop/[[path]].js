
const WORKER_ORIGIN = "https://aa-printsystem-api.aaprintox.workers.dev";

export async function onRequest(context) {
  const request = context.request;
  const incomingUrl = new URL(request.url);

  const targetUrl =
    WORKER_ORIGIN + incomingUrl.pathname + incomingUrl.search;

  try {
    const headers = new Headers(request.headers);
    headers.set("Origin", WORKER_ORIGIN);
    headers.set("Cache-Control", "no-store");

    const options = {
      method: request.method,
      headers,
      redirect: "manual"
    };

    if (request.method !== "GET" && request.method !== "HEAD") {
      options.body = request.body;
    }

    const workerRequest = new Request(targetUrl, options);
    const workerResponse = await fetch(workerRequest);

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
