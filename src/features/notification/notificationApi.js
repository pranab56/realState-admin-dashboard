import { baseApi } from '../../utils/apiBaseQuery';

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    getAllNotification: builder.query({
      query: ({ page }) => ({
        url: `/notifications/me?page=${page}`,
        method: "GET",
      }),
      providesTags: ["Notification"],
    }),

    readNotification: builder.mutation({
      query: ({ notificationId }) => ({
        url: `/notifications/read/${notificationId}`,
        method: "PATCH",
      }),
      invalidatesTags: ["Notification"],
    }),

    readAllNotification: builder.mutation({
      query: () => ({
        url: `/notifications/read-all`,
        method: "PATCH",
      }),
      invalidatesTags: ["Notification"],
    }),

  }),
});
// Export hooks
export const {
  useGetAllNotificationQuery,
  useReadNotificationMutation,
  useReadAllNotificationMutation,
} = notificationApi;
