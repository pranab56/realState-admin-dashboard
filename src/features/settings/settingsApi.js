import { baseApi } from "../../utils/apiBaseQuery";


export const settingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    getSettings: builder.query({
      query: ({ page = 1 }) => ({
        url: `/settings?page=${page}`,
        method: "GET",
      }),
      providesTags: ["settings"],
    }),

    createAndUpdateSettings: builder.mutation({
      query: (data) => ({
        url: `/settings`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["settings"],
    }),
  }),
});

export const {
  useGetSettingsQuery,
  useCreateAndUpdateSettingsMutation,
} = settingsApi;
