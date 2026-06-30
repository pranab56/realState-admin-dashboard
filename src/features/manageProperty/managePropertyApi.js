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

    updateManageProperty: builder.mutation({
      query: ({ propertyId, formData }) => ({
        url: `/properties/listing/${propertyId}`,
        method: "PATCH",
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

    deleteProperty: builder.mutation({
      query: (propertyId) => ({
        url: `/properties/${propertyId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["property"],
    }),

    updateStatus: builder.mutation({
      query: ({ propertyId, data }) => ({
        url: `/properties/${propertyId}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["property"],
    }),

  }),
  overrideExisting: true,
});

// Export hooks
export const {
  useCreateManagePropertyMutation,
  useUpdateManagePropertyMutation,
  useGetManageListingQuery,
  useGetManageHotelsQuery,
  useDeletePropertyMutation,
  useUpdateStatusMutation
} = managePropertyApi;
