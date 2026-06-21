import { baseApi } from "../../utils/apiBaseQuery";


export const profileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    getMyProfile: builder.query({
      query: () => ({
        url: "/users/profile",
        method: "GET",
      }),
      providesTags: ["profile"],
    }),

    updateMyProfile: builder.mutation({
      query: (formData) => ({
        url: "/users/profile",
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: ["profile"],
    }),


    changePassword: builder.mutation({
      query: (data) => ({
        url: "/auth/change-password",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["profile"],
    }),

  }),
});

// Export hooks
export const {
  useGetMyProfileQuery,
  useUpdateMyProfileMutation,
  useChangePasswordMutation,
} = profileApi;
