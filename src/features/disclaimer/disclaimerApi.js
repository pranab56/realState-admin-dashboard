import { baseApi } from "../../utils/apiBaseQuery";

export const disclaimerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    getDisclaimer: builder.query({
      query: (type) => ({
        url: `/disclaimers/${type}`,
        method: "GET",
      }),
      providesTags: ["disclaimer"],
    }),

    updateDisclaimer: builder.mutation({
      query: ({ type, content }) => ({
        url: `/disclaimers`,
        method: "POST",
        body: { type, content },
      }),
      invalidatesTags: ["disclaimer"],
    }),

  }),
});

export const {
  useGetDisclaimerQuery,
  useUpdateDisclaimerMutation,
} = disclaimerApi;
