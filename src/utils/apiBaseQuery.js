import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { logout } from '../features/auth/authSlice';
import { baseURL } from './BaseURL';
import { getToken } from './storage';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: `${baseURL}/api/v1`,
  prepareHeaders: (headers) => {
    const token = getToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

// Wraps every request: if the backend ever responds 401 (expired/invalid
// token), force a logout and send the admin back to the login page —
// regardless of which page triggered the call. Auth endpoints are excluded
// since a 401 there means "wrong credentials", not "session expired".
const baseQueryWithReauth = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  const url = typeof args === "string" ? args : args?.url;
  const isAuthEndpoint = url?.startsWith("/auth/");

  if (result.error?.status === 401 && !isAuthEndpoint) {
    api.dispatch(logout());
    api.dispatch(baseApi.util.resetApiState());
    if (typeof window !== "undefined") {
      window.location.href = "/auth/login";
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: baseQueryWithReauth,
  endpoints: () => ({}),
  tagTypes: ["overview", "revenue", "blog", "profile", "customar", "partner", "property", "inquiries", "reviews", "transportation", "poa", "newsletter", "reservation", "advertisement"],
});
