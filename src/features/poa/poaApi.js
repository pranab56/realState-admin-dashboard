import { baseApi } from "../../utils/apiBaseQuery";


export const poaApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    getPoa: builder.query({
      query: ({ page = 1 }) => ({
        url: `/consultations?page=${page}`,
        method: "GET",
      }),
      providesTags: ["poa"],
    }),
  }),
});

export const {
  useGetPoaQuery,
} = poaApi;