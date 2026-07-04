import { baseApi } from "../../utils/apiBaseQuery";


export const customerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    getCustomar: builder.query({
      query: ({ page = 1, limit = 10, searchTerm, status }) => {
        const params = new URLSearchParams();
        params.append("role", "customer");
        params.append("page", String(page));
        params.append("limit", String(limit));
        if (searchTerm) params.append("searchTerm", searchTerm);
        if (status && status !== "all") params.append("status", status);

        return {
          url: `/users/all?${params.toString()}`,
          method: "GET",
        };
      },
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

    updateStatus: builder.mutation({
      query: ({ userId, data }) => ({
        url: `/users/status/${userId}`,
        method: "PATCH",
        body: data
      }),
      invalidatesTags: ["customar", "partner"],
    }),


    deleteAccount: builder.mutation({
      query: ({ userId }) => ({
        url: `/users/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["customar", "partner"],
    }),

  }),
});

export const {
  useGetCustomarQuery,
  useVerificationKycMutation,
  useUpdateStatusMutation,
  useDeleteAccountMutation
} = customerApi;
