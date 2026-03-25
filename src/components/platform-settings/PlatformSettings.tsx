"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

const inputCls =
  "h-11 rounded-sm border text-sm px-4 focus-visible:ring-1 focus-visible:ring-[#F1913D] focus-visible:border-[#F1913D]";
const inputStyle = { borderColor: "#F2F2F2", color: "#2C2E33", backgroundColor: "#FAFAFA" };

/* ── Section wrapper ────────────────────────────────────────── */
function Section({
  title,
  children,
  delay = 0,
}: {
  title: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-xl shadow-sm p-6 space-y-5"
    >
      <div className="border-b pb-4" style={{ borderColor: "#F2F2F2" }}>
        <h2 className="text-lg font-bold" style={{ color: "#2C2E33" }}>
          {title}
        </h2>
      </div>
      <div className="space-y-6 pt-1">
        {children}
      </div>
    </motion.div>
  );
}

/* ── Field wrapper ──────────────────────────────────────────── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 flex-1">
      <Label className="text-sm font-semibold" style={{ color: "#2C2E33" }}>
        {label}
      </Label>
      {children}
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────── */
export default function PlatformSettings() {
  const handleSave = () => {
    toast.success("Settings saved successfully!");
  };

  return (
    <div className="max-w-4xl space-y-6 pb-5">

      {/* ── Commission Rates ── */}
      <Section title="Commission Rates" delay={0.05}>
        <Field label="Standard Marketplace Fee (%)">
          <Input className={inputCls} style={inputStyle} placeholder="$12.5" />
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Processing Surcharge (Flat)">
            <Input className={inputCls} style={inputStyle} placeholder="$0.30" />
          </Field>
          <Field label="Premium Vendor Fee (%)">
            <Input className={inputCls} style={inputStyle} placeholder="$8.0" />
          </Field>
        </div>
      </Section>

      {/* ── Localization & Currencies ── */}
      <Section title="Localization & Currencies" delay={0.1}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Default Base Currency">
            <Select defaultValue="USD">
              <SelectTrigger className="h-11 w-full rounded-sm py-5 border" style={inputStyle}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD - United States Dollar</SelectItem>
                <SelectItem value="EUR">EUR - Euro</SelectItem>
                <SelectItem value="ETB">ETB - Ethiopian Birr</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field label="System Default Language">
            <Select defaultValue="EN">
              <SelectTrigger className="h-11 w-full rounded-sm py-5 border" style={inputStyle}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EN">English (United States)</SelectItem>
                <SelectItem value="AR">Arabic</SelectItem>
                <SelectItem value="ES">Spanish</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold" style={{ color: "#2C2E33" }}>
            Supported Settlement Currencies
          </Label>
          <div className="flex flex-wrap gap-3">
            {["USD", "EUR", "ETB"].map((curr) => (
              <label
                key={curr}
                className="flex items-center gap-2 px-4 py-2.5 rounded-sm border cursor-pointer select-none transition-colors"
                style={{ backgroundColor: "#FAFAFA", borderColor: "#F2F2F2" }}
              >
                <Checkbox
                  defaultChecked
                  className="border-[#F1913D] data-[state=checked]:bg-[#F1913D] data-[state=checked]:border-[#F1913D]"
                />
                <span className="text-sm font-medium" style={{ color: "#2C2E33" }}>{curr}</span>
              </label>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Security Protocols ── */}
      <Section title="Security Protocols" delay={0.15}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Admin Session Timeout">
            <Select defaultValue="30">
              <SelectTrigger className="h-11 w-full rounded-sm py-5 border" style={inputStyle}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">60 minutes</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field label="Password Rotation Frequency">
            <Select defaultValue="90">
              <SelectTrigger className="h-11 w-full rounded-sm py-5 border" style={inputStyle}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="90">Every 90 days</SelectItem>
                <SelectItem value="180">Every 180 days</SelectItem>
                <SelectItem value="365">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>

        <Field label="IP Whitelist Enforcement">
          <Textarea
            className="rounded-sm border text-sm p-4 min-h-[120px] resize-none"
            style={inputStyle}
            placeholder="Enter IP addresses separated by commas..."
          />
        </Field>
      </Section>

      {/* ── Action Buttons ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex items-center justify-end gap-3 pt-6"
      >
        <Button
          variant="outline"
          className="h-11 px-8 rounded-sm font-semibold border"
          style={{ borderColor: "#F2F2F2", backgroundColor: "#FAFAFA", color: "#2C2E33" }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          className="h-11 px-8 rounded-sm font-semibold text-white"
          style={{ backgroundColor: "#F1913D" }}
        >
          Save Configuration
        </Button>
      </motion.div>

    </div>
  );
}
