import { baseApi } from "../../utils/apiBaseQuery";


export const reviewApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    getReviews: builder.query({
      query: ({ page = 1 }) => ({
        url: `/reviews?page=${page}`,
        method: "GET",
      }),
      providesTags: ["reviews"],
    }),
  }),
});

export const {
  useGetReviewsQuery,
} = reviewApi;
