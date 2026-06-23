import { baseApi } from "../../utils/apiBaseQuery";


export const newsletterApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    getNewsLetter: builder.query({
      query: ({ page = 1 }) => ({
        url: `/newsletters?page=${page}`,
        method: "GET",
      }),
      providesTags: ["newsletter"],
    }),
  }),
});

export const {
  useGetNewsLetterQuery,
} = newsletterApi;
