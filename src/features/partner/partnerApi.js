import { baseApi } from "../../utils/apiBaseQuery";


export const partnerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    getPartner: builder.query({
      query: ({ page = 1, limit = 10 }) => ({
        url: `/users/all?role=host&page=${page}&limit=${limit}`,
        method: "GET",
      }),
      providesTags: ["partner"],
    }),
  }),
});

export const {
  useGetPartnerQuery,
} = partnerApi;
