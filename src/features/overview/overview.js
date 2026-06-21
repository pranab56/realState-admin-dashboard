import { baseApi } from "../../utils/apiBaseQuery";


export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    getOverview: builder.query({
      query: () => ({
        url: "/analytics/overview/admin",
        method: "GET",
      }),
      providesTags: ["overview"],
    }),

  }),
});

// Export hooks
export const {
  useGetOverviewQuery,
} = authApi;
