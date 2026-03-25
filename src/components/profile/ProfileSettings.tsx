"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { Camera } from "lucide-react";
import Image from "next/image";
import { toast } from "react-hot-toast";

const inputCls = "h-11 rounded-sm border text-sm px-4 focus-visible:ring-1 focus-visible:ring-[#F1913D] focus-visible:border-[#F1913D]";
const inputStyle = { borderColor: "#F2F2F2", color: "#2C2E33", backgroundColor: "#FAFAFA" };

const USER_AVATAR = "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=300&h=300&fit=crop&auto=format";

export default function ProfileSettings() {
  const handleSave = () => {
    toast.success("Profile updated successfully!");
  };

  return (
    <div className="max-w-4xl space-y-6 pb-5">

      {/* ── Personal Information Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm p-8 space-y-8"
      >
        {/* Header Section */}
        <div className="flex items-center gap-6">
          <div className="relative group">
            <div className="w-24 h-24 rounded-xl overflow-hidden relative border-4 border-white shadow-sm">
              <Image
                src={USER_AVATAR}
                alt="Rasel Parvez"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <button className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg bg-[#2C2E33] flex items-center justify-center text-white border-2 border-white shadow-sm hover:scale-105 transition-transform cursor-pointer">
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold" style={{ color: "#2C2E33" }}>Personal Information</h2>
              <p className="text-sm font-medium" style={{ color: "#6C757D" }}>
                Super Admin • Infrastructure &amp; Operations
              </p>
            </div>
            <Button
              variant="outline"
              className="h-10 rounded-sm px-4 text-xs font-semibold border cursor-pointer hover:bg-gray-50 transition-colors"
              style={{ borderColor: "#F2F2F2", color: "#2C2E33" }}
            >
              Update Profile Photo
            </Button>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          <div className="space-y-1.5 flex flex-col">
            <Label className="text-sm font-semibold" style={{ color: "#2C2E33" }}>First Name</Label>
            <Input className={inputCls} style={inputStyle} defaultValue="Rasel" />
          </div>

          <div className="space-y-1.5 flex flex-col">
            <Label className="text-sm font-semibold" style={{ color: "#2C2E33" }}>Last Name</Label>
            <Input className={inputCls} style={inputStyle} defaultValue="Parvez" />
          </div>

          <div className="space-y-1.5 flex flex-col md:col-span-2">
            <Label className="text-sm font-semibold" style={{ color: "#2C2E33" }}>Email Address</Label>
            <Input className={inputCls} style={inputStyle} defaultValue="rasel@example.com" />
          </div>

          <div className="space-y-1.5 flex flex-col">
            <Label className="text-sm font-semibold" style={{ color: "#2C2E33" }}>Phone Number</Label>
            <Input className={inputCls} style={inputStyle} defaultValue="01721879586" />
          </div>

          <div className="space-y-1.5 flex flex-col">
            <Label className="text-sm font-semibold" style={{ color: "#2C2E33" }}>Office Location</Label>
            <Select defaultValue="Madrid">
              <SelectTrigger className="h-11 py-5 w-full rounded-sm border" style={inputStyle}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Madrid">Madrid Headquarters</SelectItem>
                <SelectItem value="Dubai">Dubai Office</SelectItem>
                <SelectItem value="NewYork">New York Hub</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </motion.div>

      {/* ── Footer Action Card ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-end gap-3"
      >
        <Button
          variant="outline"
          className="h-11 px-10 rounded-sm font-semibold border bg-[#F3F4F6] border-transparent cursor-pointer hover:bg-gray-200"
          style={{ color: "#2C2E33" }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          className="h-11 px-10 rounded-sm font-semibold text-white cursor-pointer"
          style={{ backgroundColor: "#F1913D" }}
        >
          Save Changes
        </Button>
      </motion.div>

    </div>
  );
}
