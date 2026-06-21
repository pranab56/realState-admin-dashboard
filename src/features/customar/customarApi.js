import { baseApi } from "../../utils/apiBaseQuery";


export const customerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    getCustomar: builder.query({
      query: ({ page = 1, limit = 10 }) => ({
        url: `/users/all?role=customer&page=${page}&limit=${limit}`,
        method: "GET",
      }),
      providesTags: ["customar"],
    }),
  }),
});

export const {
  useGetCustomarQuery,
} = customerApi;
