"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import {
  useCreateAndUpdateSettingsMutation,
  useGetSettingsQuery,
} from "@/features/settings/settingsApi";
import { CustomLoading } from "@/hooks/CustomLoading";
import {
  Disc,
  Facebook,
  Hash,
  Instagram,
  Linkedin,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Music2,
  Pencil,
  Phone,
  Send,
  Twitter,
  Youtube,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

const inputCls =
  "h-11 rounded-sm border text-sm px-4 focus-visible:ring-1 focus-visible:ring-[#F1913D] focus-visible:border-[#F1913D]";
const inputStyle = { borderColor: "#F2F2F2", color: "#2C2E33", backgroundColor: "#FAFAFA" };

/* ── Form state shape ──────────────────────────────────────────── */
interface SettingsFormState {
  platformFeePercentage: string;
  contactInfo: {
    email: string;
    phone: string;
    whatsApp: string;
    address: string;
    latitude: string;
    longitude: string;
  };
  socialLinks: {
    facebook: string;
    instagram: string;
    twitter: string;
    linkedin: string;
    youtube: string;
    tiktok: string;
    reddit: string;
    weChat: string;
    discord: string;
    telegram: string;
  };
}

const EMPTY_FORM: SettingsFormState = {
  platformFeePercentage: "",
  contactInfo: { email: "", phone: "", whatsApp: "", address: "", latitude: "", longitude: "" },
  socialLinks: {
    facebook: "", instagram: "", twitter: "", linkedin: "", youtube: "",
    tiktok: "", reddit: "", weChat: "", discord: "", telegram: "",
  },
};

const SOCIAL_FIELDS: { key: keyof SettingsFormState["socialLinks"]; label: string; icon: typeof Facebook }[] = [
  { key: "facebook", label: "Facebook", icon: Facebook },
  { key: "instagram", label: "Instagram", icon: Instagram },
  { key: "twitter", label: "Twitter / X", icon: Twitter },
  { key: "linkedin", label: "LinkedIn", icon: Linkedin },
  { key: "youtube", label: "YouTube", icon: Youtube },
  { key: "tiktok", label: "TikTok", icon: Music2 },
  { key: "reddit", label: "Reddit", icon: Disc },
  { key: "weChat", label: "WeChat", icon: MessageCircle },
  { key: "discord", label: "Discord", icon: Hash },
  { key: "telegram", label: "Telegram", icon: Send },
];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-sm font-semibold" style={{ color: "#2C2E33" }}>
        {label}
      </Label>
      {children}
    </div>
  );
}

export default function SettingsManagement() {
  const { data, isLoading, isError } = useGetSettingsQuery({});
  const [updateSettings, { isLoading: isSaving }] = useCreateAndUpdateSettingsMutation();

  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<SettingsFormState>(EMPTY_FORM);

  const settings = data?.data;

  useEffect(() => {
    if (isOpen && settings) {
      setForm({
        platformFeePercentage: String(settings.platformFeePercentage ?? ""),
        contactInfo: {
          email: settings.contactInfo?.email ?? "",
          phone: settings.contactInfo?.phone ?? "",
          whatsApp: settings.contactInfo?.whatsApp ?? "",
          address: settings.contactInfo?.address ?? "",
          longitude: String(settings.contactInfo?.location?.coordinates?.[0] ?? ""),
          latitude: String(settings.contactInfo?.location?.coordinates?.[1] ?? ""),
        },
        socialLinks: {
          facebook: settings.socialLinks?.facebook ?? "",
          instagram: settings.socialLinks?.instagram ?? "",
          twitter: settings.socialLinks?.twitter ?? "",
          linkedin: settings.socialLinks?.linkedin ?? "",
          youtube: settings.socialLinks?.youtube ?? "",
          tiktok: settings.socialLinks?.tiktok ?? "",
          reddit: settings.socialLinks?.reddit ?? "",
          weChat: settings.socialLinks?.weChat ?? "",
          discord: settings.socialLinks?.discord ?? "",
          telegram: settings.socialLinks?.telegram ?? "",
        },
      });
    }
  }, [isOpen, settings]);

  const handleSave = async () => {
    const payload = {
      platformFeePercentage: Number(form.platformFeePercentage) || 0,
      contactInfo: {
        email: form.contactInfo.email,
        phone: form.contactInfo.phone,
        whatsApp: form.contactInfo.whatsApp,
        address: form.contactInfo.address,
        location: {
          type: "Point",
          coordinates: [Number(form.contactInfo.longitude) || 0, Number(form.contactInfo.latitude) || 0],
        },
      },
      socialLinks: { ...form.socialLinks },
    };

    try {
      await updateSettings(payload).unwrap();
      toast.success("Settings updated successfully!");
      setIsOpen(false);
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      toast.error(err?.data?.message || "Failed to update settings");
    }
  };

  if (isLoading) return <CustomLoading />;
  if (isError) return <div className="p-10 text-center text-red-500">Failed to load settings</div>;

  const ROWS: { label: string; value: string }[] = [
    { label: "Platform Fee", value: `${settings?.platformFeePercentage ?? "—"}%` },
    { label: "Support Email", value: settings?.contactInfo?.email || "—" },
    { label: "Phone", value: settings?.contactInfo?.phone || "—" },
    { label: "WhatsApp", value: settings?.contactInfo?.whatsApp || "—" },
    { label: "Address", value: settings?.contactInfo?.address || "—" },
    { label: "Facebook", value: settings?.socialLinks?.facebook || "—" },
    { label: "Instagram", value: settings?.socialLinks?.instagram || "—" },
    { label: "Twitter / X", value: settings?.socialLinks?.twitter || "—" },
    { label: "LinkedIn", value: settings?.socialLinks?.linkedin || "—" },
    { label: "YouTube", value: settings?.socialLinks?.youtube || "—" },
    { label: "TikTok", value: settings?.socialLinks?.tiktok || "—" },
    { label: "Reddit", value: settings?.socialLinks?.reddit || "—" },
    { label: "WeChat", value: settings?.socialLinks?.weChat || "—" },
    { label: "Discord", value: settings?.socialLinks?.discord || "—" },
    { label: "Telegram", value: settings?.socialLinks?.telegram || "—" },
  ];

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="text-base font-bold" style={{ color: "#2C2E33" }}>
            Platform Settings
          </h2>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <Button
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-2 h-10 px-5 rounded-sm text-sm font-semibold text-white cursor-pointer transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#F1913D" }}
            >
              <Pencil className="w-4 h-4" /> Update Settings
            </Button>

            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold" style={{ color: "#2C2E33" }}>
                  Update Settings
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 pt-1">
                {/* Platform Fee */}
                <Field label="Platform Fee Percentage (%)">
                  <Input
                    type="number"
                    className={inputCls}
                    style={inputStyle}
                    value={form.platformFeePercentage}
                    onChange={(e) => setForm((f) => ({ ...f, platformFeePercentage: e.target.value }))}
                    placeholder="10"
                  />
                </Field>

                {/* Contact Info */}
                <div className="space-y-4">
                  <p className="text-sm font-bold" style={{ color: "#2C2E33" }}>Contact Information</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Email">
                      <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#6C757D" }} />
                        <Input
                          className={`${inputCls} pl-10`}
                          style={inputStyle}
                          value={form.contactInfo.email}
                          onChange={(e) => setForm((f) => ({ ...f, contactInfo: { ...f.contactInfo, email: e.target.value } }))}
                          placeholder="support@zilahomes.com"
                        />
                      </div>
                    </Field>

                    <Field label="Phone">
                      <div className="relative">
                        <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#6C757D" }} />
                        <Input
                          className={`${inputCls} pl-10`}
                          style={inputStyle}
                          value={form.contactInfo.phone}
                          onChange={(e) => setForm((f) => ({ ...f, contactInfo: { ...f.contactInfo, phone: e.target.value } }))}
                          placeholder="+1-555-0199"
                        />
                      </div>
                    </Field>

                    <Field label="WhatsApp">
                      <div className="relative">
                        <MessageCircle className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#6C757D" }} />
                        <Input
                          className={`${inputCls} pl-10`}
                          style={inputStyle}
                          value={form.contactInfo.whatsApp}
                          onChange={(e) => setForm((f) => ({ ...f, contactInfo: { ...f.contactInfo, whatsApp: e.target.value } }))}
                          placeholder="+1-555-0199"
                        />
                      </div>
                    </Field>

                    <Field label="Address">
                      <div className="relative">
                        <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#6C757D" }} />
                        <Input
                          className={`${inputCls} pl-10`}
                          style={inputStyle}
                          value={form.contactInfo.address}
                          onChange={(e) => setForm((f) => ({ ...f, contactInfo: { ...f.contactInfo, address: e.target.value } }))}
                          placeholder="123 Realty Boulevard, Suite 400, New York, NY"
                        />
                      </div>
                    </Field>

                  </div>
                </div>

                {/* Social Links */}
                <div className="space-y-4">
                  <p className="text-sm font-bold" style={{ color: "#2C2E33" }}>Social Links</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {SOCIAL_FIELDS.map(({ key, label, icon: Icon }) => (
                      <Field key={key} label={label}>
                        <div className="relative">
                          <Icon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#6C757D" }} />
                          <Input
                            className={`${inputCls} pl-10`}
                            style={inputStyle}
                            value={form.socialLinks[key]}
                            onChange={(e) =>
                              setForm((f) => ({ ...f, socialLinks: { ...f.socialLinks, [key]: e.target.value } }))
                            }
                            placeholder={`https://${key}.com/zilahomes`}
                          />
                        </div>
                      </Field>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                    className="h-11 px-6 rounded-sm font-semibold border"
                    style={{ borderColor: "#F2F2F2", backgroundColor: "#FAFAFA", color: "#2C2E33" }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="h-11 px-6 rounded-sm font-semibold text-white flex items-center gap-2"
                    style={{ backgroundColor: "#F1913D" }}
                  >
                    {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Settings Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableBody>
              {ROWS.map((row) => (
                <TableRow key={row.label} style={{ borderColor: "#F2F2F2" }} className="hover:bg-gray-50/60 transition-colors">
                  <TableCell className="pl-6 w-1/3">
                    <p className="text-sm font-semibold" style={{ color: "#2C2E33" }}>{row.label}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm break-all" style={{ color: "#6C757D" }}>{row.value}</p>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
