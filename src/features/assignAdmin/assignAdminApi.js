import { baseApi } from "../../utils/apiBaseQuery";


export const assignAdminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    getAllAdmin: builder.query({
      query: ({ page } = {}) => ({
        url: `/users/all?role=admin&page=${page}`,
        method: "GET",
      }),
      providesTags: ["assignAdmin"],
    }),

    assignAdmin: builder.mutation({
      query: (formData) => ({
        url: "/admins/create",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["assignAdmin"],
    }),

    updateAssignUser: builder.mutation({
      query: ({ userId, formData }) => ({
        url: `/admins/${userId}`,
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: ["assignAdmin"],
    }),

  }),
});

// Export hooks
export const {
  useGetAllAdminQuery,
  useAssignAdminMutation,
  useUpdateAssignUserMutation,
} = assignAdminApi;
