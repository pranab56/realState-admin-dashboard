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

    verificationKyc: builder.mutation({
      query: ({ id, data }) => ({
        url: `/users/kyc/${id}/review`,
        method: "PATCH",
        body: data
      }),
      invalidatesTags: ["customar", "partner"],
    }),
  }),
});

export const {
  useGetCustomarQuery,
  useVerificationKycMutation,
} = customerApi;
