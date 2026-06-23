import { baseApi } from "../../utils/apiBaseQuery";


export const reservationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    getReservation: builder.query({
      query: ({ page = 1 }) => ({
        url: `/reservations?page=${page}`,
        method: "GET",
      }),
      providesTags: ["reservation"],
    }),

    getSingleReservation: builder.query({
      query: (id) => ({
        url: `/reservations/${id}`,
        method: "GET",
      }),
      providesTags: ["reservation"],
    }),

    updateReservation: builder.mutation({
      query: ({ reservationId, data }) => ({
        url: `/reservations/${reservationId}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["reservation"],
    }),

    deleteReservation: builder.mutation({
      query: (reservationId) => ({
        url: `/reservations/${reservationId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["reservation"],
    }),

  }),
});

export const {
  useGetReservationQuery,
  useGetSingleReservationQuery,
  useUpdateReservationMutation,
  useDeleteReservationMutation,
} = reservationApi;
