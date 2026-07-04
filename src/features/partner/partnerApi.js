import { baseApi } from "../../utils/apiBaseQuery";


export const partnerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    getPartner: builder.query({
      query: ({ page = 1, limit = 10, searchTerm, status }) => {
        const params = new URLSearchParams();
        params.append("role", "host");
        params.append("page", String(page));
        params.append("limit", String(limit));
        if (searchTerm) params.append("searchTerm", searchTerm);
        if (status && status !== "all") params.append("status", status);

        return {
          url: `/users/all?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["partner"],
    }),
  }),
});

export const {
  useGetPartnerQuery,
} = partnerApi;
