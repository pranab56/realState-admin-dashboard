"use client";

import { useGetAdvertisementsQuery } from "@/features/advertisement/advertisementApi";
import { useGetBlogsQuery } from "@/features/blog/blogApi";
import { useGetCustomarQuery } from "@/features/customar/customarApi";
import { useGetInquiriesQuery } from "@/features/inquiries/inquiriesApi";
import {
  useGetManageHotelsQuery,
  useGetManageListingQuery,
} from "@/features/manageProperty/managePropertyApi";
import { useGetNewsLetterQuery } from "@/features/newsletter/newsletterApi";
import { useGetPartnerQuery } from "@/features/partner/partnerApi";
import { useGetPoaQuery } from "@/features/poa/poaApi";
import { useGetReservationQuery } from "@/features/reservation/reservationApi";
import { useGetRevenueQuery } from "@/features/revenue/revenueApi";
import { useGetReviewsQuery } from "@/features/review/reviewApi";
import { useGetTransportationQuery } from "@/features/transportation/transportationApi";
import { useNewDataWatcher } from "@/hooks/useNewDataWatcher";

const POLL_MS = 10000;

/**
 * Mounted once at the app shell. Polls every management list's total
 * count in the background so the header notification badge stays
 * accurate even when the admin isn't looking at that specific page.
 */
export default function GlobalNewDataWatcher() {
  const { data: reservation } = useGetReservationQuery({ page: 1 }, { pollingInterval: POLL_MS });
  const { data: inquiries } = useGetInquiriesQuery({ page: 1 }, { pollingInterval: POLL_MS });
  const { data: newsletter } = useGetNewsLetterQuery({ page: 1 }, { pollingInterval: POLL_MS });
  const { data: customer } = useGetCustomarQuery({ page: 1, limit: 10 }, { pollingInterval: POLL_MS });
  const { data: partner } = useGetPartnerQuery({ page: 1, limit: 10 }, { pollingInterval: POLL_MS });
  const { data: review } = useGetReviewsQuery({ page: 1 }, { pollingInterval: POLL_MS });
  const { data: blog } = useGetBlogsQuery({ page: 1 }, { pollingInterval: POLL_MS });
  const { data: transportation } = useGetTransportationQuery({ page: 1 }, { pollingInterval: POLL_MS });
  const { data: poa } = useGetPoaQuery({ page: 1 }, { pollingInterval: POLL_MS });
  const { data: revenue } = useGetRevenueQuery({ page: 1 }, { pollingInterval: POLL_MS });
  const { data: propertyListing } = useGetManageListingQuery({ page: 1, limit: 10 }, { pollingInterval: POLL_MS });
  const { data: propertyHotel } = useGetManageHotelsQuery({ page: 1, limit: 10 }, { pollingInterval: POLL_MS });
  const { data: advertisement } = useGetAdvertisementsQuery({ page: 1 }, { pollingInterval: POLL_MS });

  useNewDataWatcher("reservation", "reservation", reservation?.pagination?.total);
  useNewDataWatcher("inquiries", "inquiry", inquiries?.pagination?.total);
  useNewDataWatcher("newsletter", "newsletter subscriber", newsletter?.pagination?.total);
  useNewDataWatcher("customer", "customer", customer?.pagination?.total);
  useNewDataWatcher("partner", "partner", partner?.pagination?.total);
  useNewDataWatcher("review", "review", review?.pagination?.total);
  useNewDataWatcher("blog", "blog post", blog?.pagination?.total);
  useNewDataWatcher("transportation", "ride", transportation?.pagination?.total);
  useNewDataWatcher("poa", "consultation", poa?.pagination?.total);
  useNewDataWatcher("revenue", "transaction", revenue?.pagination?.total);
  useNewDataWatcher("propertyListing", "property listing", propertyListing?.pagination?.total);
  useNewDataWatcher("propertyHotel", "hotel", propertyHotel?.pagination?.total);
  useNewDataWatcher("advertisement", "advertisement", advertisement?.data?.length);

  return null;
}
