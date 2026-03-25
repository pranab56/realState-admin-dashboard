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
import { UserPlus, X } from "lucide-react";
import { toast } from "react-hot-toast";

const inputCls =
  "h-11 rounded-sm border text-sm px-4 focus-visible:ring-1 focus-visible:ring-[#F1913D] focus-visible:border-[#F1913D]";
const inputStyle = { borderColor: "#F2F2F2", color: "#2C2E33", backgroundColor: "#FAFAFA" };

export default function AddUserForm({ onCancel }: { onCancel?: () => void }) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("User added successfully!");
    if (onCancel) onCancel();
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white p-8 rounded-xl relative shadow-xl">
      {onCancel && (
        <button
          onClick={onCancel}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>
      )}

      <div className="flex flex-col items-center gap-2 mb-8">
        <div className="w-14 h-14 rounded-xl bg-[#FEF0E4] flex items-center justify-center">
          <UserPlus className="w-7 h-7 text-[#F1913D]" />
        </div>
        <h2 className="text-xl font-bold mt-2" style={{ color: "#2C2E33" }}>Add New User</h2>
        <p className="text-sm text-center" style={{ color: "#6C757D" }}>
          Fill in the details below to create a new user account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold" style={{ color: "#2C2E33" }}>Full Name</Label>
          <Input className={inputCls} style={inputStyle} placeholder="e.g. Marcus Holloway" required />
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-semibold" style={{ color: "#2C2E33" }}>Email Address</Label>
          <Input className={inputCls} style={inputStyle} type="email" placeholder="marcus@example.com" required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold" style={{ color: "#2C2E33" }}>Role</Label>
            <Select defaultValue="Customer">
              <SelectTrigger className="h-11 w-full py-5 rounded-sm border" style={inputStyle}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Customer">Customer</SelectItem>
                <SelectItem value="Agent">Agent</SelectItem>
                <SelectItem value="Owner">Owner</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-semibold" style={{ color: "#2C2E33" }}>Status</Label>
            <Select defaultValue="Active">
              <SelectTrigger className="h-11 py-5 w-full rounded-sm border" style={inputStyle}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="Suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="pt-4 flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1 h-11 rounded-xl font-semibold border"
            style={{ borderColor: "#F2F2F2", color: "#2C2E33" }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1 h-11 rounded-xl font-semibold text-white"
            style={{ backgroundColor: "#F1913D" }}
          >
            Add User
          </Button>
        </div>
      </form>
    </div>
  );
}
