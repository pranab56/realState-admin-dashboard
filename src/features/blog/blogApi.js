import { baseApi } from "../../utils/apiBaseQuery";


export const blogApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    createBlog: builder.mutation({
      query: (formData) => ({
        url: "/blogs/create",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["blog"],
    }),

    updateBlog: builder.mutation({
      query: ({ blogId, formData }) => ({
        url: `/blogs/${blogId}`,
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: ["blog"],
    }),

    deleteBlog: builder.mutation({
      query: ({ blogId }) => ({
        url: `/blogs/${blogId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["blog"],
    }),

    getBlogs: builder.query({
      query: ({ page = 1 }) => ({
        url: `/blogs?page=${page}`,
        method: "GET",
      }),
      providesTags: ["blog"],
    }),

    getSingleBlog: builder.query({
      query: ({ blogId }) => ({
        url: `/blogs/${blogId}`,
        method: "GET",
      }),
      providesTags: ["blog"],
    }),

    getAllCategory: builder.query({
      query: () => ({
        url: `/blogs/categories`,
        method: "GET",
      }),
    }),

  }),
});

// Export hooks
export const {
  useGetBlogsQuery,
  useGetSingleBlogQuery,
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
  useGetAllCategoryQuery,
} = blogApi;
