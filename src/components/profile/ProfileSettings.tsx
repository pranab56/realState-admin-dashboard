"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useChangePasswordMutation, useGetMyProfileQuery, useUpdateMyProfileMutation } from "@/features/profile/profileApi";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Camera, Eye, EyeOff, Loader2, Lock, User } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { CustomLoading } from '../../hooks/CustomLoading';
import { baseURL } from '../../utils/BaseURL';

const inputCls = "h-11 rounded-sm border text-sm px-4 focus-visible:ring-1 focus-visible:ring-[#F1913D] focus-visible:border-[#F1913D]";
const inputStyle = { borderColor: "#F2F2F2", color: "#2C2E33", backgroundColor: "#FAFAFA" };

export default function ProfileSettings() {
  const { data: profileData, isLoading: isProfileLoading } = useGetMyProfileQuery({});
  const [updateProfile, { isLoading: isUpdating }] = useUpdateMyProfileMutation();
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getProfileImage = () => {
    if (!preview) return null;
    if (preview.startsWith("blob:")) return preview;
    if (preview.startsWith("http")) return preview;
    return baseURL + preview;
  };

  useEffect(() => {
    if (profileData?.data) {
      const user = profileData.data;
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
      });
      setPreview(user.image || null);
    }
  }, [profileData]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    const payload = new FormData();
    payload.append("firstName", formData.firstName);
    payload.append("lastName", formData.lastName);
    payload.append("phone", formData.phone);
    payload.append("location", JSON.stringify({}))

    if (selectedFile) {
      payload.append("image", selectedFile);
    }

    try {
      await updateProfile(payload).unwrap();
      toast.success("Profile updated successfully!");
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      toast.error(err?.data?.message || "Failed to update profile");
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }

    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      }).unwrap();
      toast.success("Password changed successfully!");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      toast.error(err?.data?.message || "Failed to change password");
    }
  };

  if (isProfileLoading) return <CustomLoading />;

  return (
    <div className="max-w-4xl space-y-6 pb-5">
      <h1 className="text-2xl font-bold" style={{ color: "#2C2E33" }}>Account Settings</h1>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="bg-white border-b w-full justify-start rounded-none h-auto p-0 gap-8">
          <TabsTrigger
            value="personal"
            className="rounded-none data-[state=active]:text-[#F1913D] cursor-pointer py-4 px-2 font-semibold flex items-center gap-2"
          >
            <User className="w-4 h-4" /> Personal Info
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="rounded-none data-[state=active]:text-[#F1913D] cursor-pointer py-4 px-2 font-semibold flex items-center gap-2"
          >
            <Lock className="w-4 h-4" /> Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="mt-6 space-y-6">
          {/* ── Personal Information Card ── */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm p-8 space-y-8"
          >
            {/* Header Section */}
            <div className="flex items-center gap-6">
              <div className="relative group">
                <div className="w-24 h-24 rounded-xl overflow-hidden relative border-4 border-white shadow-sm bg-gray-100">
                  {getProfileImage() ? (
                    <Image
                      src={getProfileImage()!}
                      alt={formData.firstName}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg bg-[#2C2E33] flex items-center justify-center text-white border-2 border-white shadow-sm hover:scale-105 transition-transform cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>

              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold" style={{ color: "#2C2E33" }}>Personal Information</h2>
                  <p className="text-sm font-medium capitalize" style={{ color: "#6C757D" }}>
                    {profileData?.data?.role?.replace('_', ' ') || "User"} • {profileData?.data?.uid || ""}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
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
                <Input
                  className={inputCls}
                  style={inputStyle}
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>

              <div className="space-y-1.5 flex flex-col">
                <Label className="text-sm font-semibold" style={{ color: "#2C2E33" }}>Last Name</Label>
                <Input
                  className={inputCls}
                  style={inputStyle}
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>

              <div className="space-y-1.5 flex flex-col md:col-span-2">
                <Label className="text-sm font-semibold" style={{ color: "#2C2E33" }}>Email Address</Label>
                <Input
                  className={inputCls}
                  style={{ ...inputStyle, opacity: 0.7 }}
                  value={formData.email}
                  disabled
                  readOnly
                />
              </div>

              <div className="space-y-1.5 col-span-2">
                <Label className="text-sm font-semibold" style={{ color: "#2C2E33" }}>Phone Number</Label>
                <Input
                  className={inputCls}
                  style={inputStyle}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
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
              onClick={() => {
                if (profileData?.data) {
                  setFormData({
                    firstName: profileData.data.firstName || "",
                    lastName: profileData.data.lastName || "",
                    email: profileData.data.email || "",
                    phone: profileData.data.phone || "",
                  });
                  setPreview(profileData.data.image || null);
                  setSelectedFile(null);
                }
              }}
              className="h-11 px-10 rounded-sm font-semibold border bg-[#F3F4F6] border-transparent cursor-pointer hover:bg-gray-200"
              style={{ color: "#2C2E33" }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isUpdating}
              className="h-11 px-10 rounded-sm font-semibold text-white cursor-pointer flex items-center gap-2"
              style={{ backgroundColor: "#F1913D" }}
            >
              {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
          </motion.div>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white w-full rounded-xl shadow-sm p-8 space-y-8"
          >
            <div className=''>
              <h2 className="text-xl font-bold" style={{ color: "#2C2E33" }}>Change Password</h2>
              <p className="text-sm font-medium" style={{ color: "#6C757D" }}>
                Update your account password to keep your account secure.
              </p>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-5 w-full">
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold" style={{ color: "#2C2E33" }}>Current Password</Label>
                <div className="relative">
                  <Input
                    type={showPasswords.current ? "text" : "password"}
                    className={inputCls}
                    style={inputStyle}
                    value={passwordData.currentPassword}
                    placeholder="Enter your current password"
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-semibold" style={{ color: "#2C2E33" }}>New Password</Label>
                <div className="relative">
                  <Input
                    type={showPasswords.new ? "text" : "password"}
                    className={inputCls}
                    style={inputStyle}
                    value={passwordData.newPassword}
                    placeholder="Enter your new password"
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    className="absolute right-3 top-1/2 cursor-pointer -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-semibold" style={{ color: "#2C2E33" }}>Confirm New Password</Label>
                <div className="relative">
                  <Input
                    type={showPasswords.confirm ? "text" : "password"}
                    className={cn(
                      inputCls,
                      passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && "border-red-500 focus-visible:ring-red-500"
                    )}
                    style={{
                      ...inputStyle,
                      borderColor: passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword ? "#EF4444" : "#F2F2F2"
                    }}
                    placeholder="Confirm your new password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isChangingPassword || (!!passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword)}
                className="h-11 px-10 rounded-sm font-semibold text-white cursor-pointer flex items-center gap-2"
                style={{ backgroundColor: "#F1913D" }}
              >
                {isChangingPassword && <Loader2 className="w-4 h-4 animate-spin" />}
                {isChangingPassword ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
