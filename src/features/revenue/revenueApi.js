import { baseApi } from "../../utils/apiBaseQuery";


export const revenueApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    getRevenue: builder.query({
      query: ({ page = 1 }) => ({
        url: `/transactions?page=${page}`,
        method: "GET",
      }),
      providesTags: ["revenue"],
    }),

  }),
});

// Export hooks
export const {
  useGetRevenueQuery,
} = revenueApi;
