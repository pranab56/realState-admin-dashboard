import { baseApi } from "../../utils/apiBaseQuery";


export const managePropertyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    createManageProperty: builder.mutation({
      query: (formData) => ({
        url: "/properties/listing/create",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["property"],
    }),

    getManageListing: builder.query({
      query: (params) => ({
        url: `/properties?category=listing`,
        method: "GET",
        params: params,
      }),
      providesTags: ["property"],
    }),

    getManageHotels: builder.query({
      query: (params) => ({
        url: `/properties?category=accommodation`,
        method: "GET",
        params: params,
      }),
      providesTags: ["property"],
    }),

  }),
});

// Export hooks
export const {
  useCreateManagePropertyMutation,
  useGetManageListingQuery,
  useGetManageHotelsQuery,
} = managePropertyApi;
