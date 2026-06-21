import { baseApi } from "../../utils/apiBaseQuery";


export const transportationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    getTransportation: builder.query({
      query: ({ page = 1 }) => ({
        url: `/rides?page=${page}`,
        method: "GET",
      }),
      providesTags: ["transportation"],
    }),
  }),
});

export const {
  useGetTransportationQuery,
} = transportationApi;
