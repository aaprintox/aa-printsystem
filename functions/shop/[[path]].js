
const WORKER_URL = "https://aa-printsystem-api.aaprintox.workers.dev";

export async function onRequest(context) {
  const incomingUrl = new URL(context.request.url);

  const targetUrl = new URL(
    incomingUrl.pathname + incomingUrl.search,
    WORKER_URL
  );

  const request = new Request(targetUrl.toString(), context.request);

  return fetch(request);
}
