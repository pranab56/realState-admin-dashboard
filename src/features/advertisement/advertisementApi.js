import { baseApi } from "../../utils/apiBaseQuery";


export const advertisementApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    createAdvertisement: builder.mutation({
      query: (formData) => ({
        url: "/advertisements/create",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["advertisement"],
    }),

    updateAdvertisement: builder.mutation({
      query: ({ advertisementId, formData }) => ({
        url: `/advertisements/${advertisementId}`,
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: ["advertisement"],
    }),

    deleteAdvertisement: builder.mutation({
      query: ({ advertisementId }) => ({
        url: `/advertisements/${advertisementId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["advertisement"],
    }),

    getAdvertisements: builder.query({
      query: ({ page = 1 }) => ({
        url: `/advertisements?page=${page}`,
        method: "GET",
      }),
      providesTags: ["advertisement"],
    }),

    getActiveAdvertisement: builder.query({
      query: () => ({
        url: `/advertisements/active`,
        method: "GET",
      }),
      providesTags: ["advertisement"],
    }),

  }),
});

// Export hooks
export const {
  useCreateAdvertisementMutation,
  useUpdateAdvertisementMutation,
  useDeleteAdvertisementMutation,
  useGetAdvertisementsQuery,
  useGetActiveAdvertisementQuery,
} = advertisementApi;
