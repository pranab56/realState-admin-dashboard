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
import { useSelector } from "react-redux";

const POLL_MS = 10000;

export default function GlobalNewDataWatcher() {
  const role = useSelector((s: { auth: { role: string | null } }) => s.auth.role);
  const permissions = useSelector((s: { auth: { permissions: string[] } }) => s.auth.permissions);

  const can = (key: string) => role === "super_admin" || permissions.includes(key);

  const { data: reservation }    = useGetReservationQuery({ page: 1 }, { pollingInterval: POLL_MS, skip: !can("reservation") });
  const { data: inquiries }      = useGetInquiriesQuery({ page: 1 }, { pollingInterval: POLL_MS, skip: !can("inquiries") });
  const { data: newsletter }     = useGetNewsLetterQuery({ page: 1 }, { pollingInterval: POLL_MS, skip: !can("newsletter") });
  const { data: customer }       = useGetCustomarQuery({ page: 1, limit: 10 }, { pollingInterval: POLL_MS, skip: !can("customer") });
  const { data: partner }        = useGetPartnerQuery({ page: 1, limit: 10 }, { pollingInterval: POLL_MS, skip: !can("partner") });
  const { data: review }         = useGetReviewsQuery({ page: 1 }, { pollingInterval: POLL_MS, skip: !can("review") });
  const { data: blog }           = useGetBlogsQuery({ page: 1 }, { pollingInterval: POLL_MS, skip: !can("blog") });
  const { data: transportation } = useGetTransportationQuery({ page: 1 }, { pollingInterval: POLL_MS, skip: !can("transportation") });
  const { data: poa }            = useGetPoaQuery({ page: 1 }, { pollingInterval: POLL_MS, skip: !can("poa") });
  const { data: revenue }        = useGetRevenueQuery({ page: 1 }, { pollingInterval: POLL_MS, skip: !can("revenue") });
  const { data: propertyListing }= useGetManageListingQuery({ page: 1, limit: 10 }, { pollingInterval: POLL_MS, skip: !can("propertyListing") });
  const { data: propertyHotel }  = useGetManageHotelsQuery({ page: 1, limit: 10 }, { pollingInterval: POLL_MS, skip: !can("propertyHotel") });
  const { data: advertisement }  = useGetAdvertisementsQuery({ page: 1 }, { pollingInterval: POLL_MS, skip: !can("advertisement") });

  useNewDataWatcher("reservation",     "reservation",            reservation?.pagination?.total);
  useNewDataWatcher("inquiries",       "inquiry",                inquiries?.pagination?.total);
  useNewDataWatcher("newsletter",      "newsletter subscriber",  newsletter?.pagination?.total);
  useNewDataWatcher("customer",        "customer",               customer?.pagination?.total);
  useNewDataWatcher("partner",         "partner",                partner?.pagination?.total);
  useNewDataWatcher("review",          "review",                 review?.pagination?.total);
  useNewDataWatcher("blog",            "blog post",              blog?.pagination?.total);
  useNewDataWatcher("transportation",  "ride",                   transportation?.pagination?.total);
  useNewDataWatcher("poa",             "consultation",           poa?.pagination?.total);
  useNewDataWatcher("revenue",         "transaction",            revenue?.pagination?.total);
  useNewDataWatcher("propertyListing", "property listing",       propertyListing?.pagination?.total);
  useNewDataWatcher("propertyHotel",   "hotel",                  propertyHotel?.pagination?.total);
  useNewDataWatcher("advertisement",   "advertisement",          advertisement?.data?.length);

  return null;
}
