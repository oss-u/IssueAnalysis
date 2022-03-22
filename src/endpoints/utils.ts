export const API_BASE_ROUTE =
  "https://issue-analysis-backend.herokuapp.com/api";

export const makeRequestURL = (
  routeExtension: string,
  queryParams?: { [name: string]: string }
): RequestInfo => {
  const baseURL: string = API_BASE_ROUTE + routeExtension;
  const url = new URL(baseURL);
  if (queryParams) {
    Object.keys(queryParams).forEach((key) => {
      url.searchParams.set(key, queryParams[key]);
    });
  }
  return url.toString();
};

export const makeRequestArguments = (
  method: string,
  body?: any
): RequestInit => ({
  method,
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(body) || null,
});
