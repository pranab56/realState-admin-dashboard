import { baseApi } from "../../utils/apiBaseQuery";


export const inquiriesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    getInquiries: builder.query({
      query: ({ page = 1 }) => ({
        url: `/inquiries?page=${page}`,
        method: "GET",
      }),
      providesTags: ["inquiries"],
    }),
  }),
});

export const {
  useGetInquiriesQuery,
} = inquiriesApi;
