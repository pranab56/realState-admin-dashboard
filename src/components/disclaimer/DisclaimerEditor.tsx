"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  useGetDisclaimerQuery,
  useUpdateDisclaimerMutation,
} from "@/features/disclaimer/disclaimerApi";
import { CustomLoading } from "@/hooks/CustomLoading";
import { Loader2, Save, ScrollText, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import TiptapEditor from "@/components/blog-management/TiptapEditor";

const ICON_MAP = {
  privacy_policy:    ShieldCheck,
  terms_of_service:  ScrollText,
} as const;

interface DisclaimerEditorProps {
  type: "privacy_policy" | "terms_of_service";
  title: string;
  description: string;
}

export default function DisclaimerEditor({
  type,
  title,
  description,
}: DisclaimerEditorProps) {
  const Icon = ICON_MAP[type];
  const { data, isLoading, isError } = useGetDisclaimerQuery(type);
  const [updateDisclaimer, { isLoading: isSaving }] = useUpdateDisclaimerMutation();

  const [content, setContent] = useState("");

  useEffect(() => {
    if (data?.data?.content) {
      setContent(data.data.content);
    }
  }, [data]);

  const handleSave = async () => {
    try {
      await updateDisclaimer({ type, content }).unwrap();
      toast.success(`${title} saved successfully!`);
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      toast.error(err?.data?.message || `Failed to save ${title}`);
    }
  };

  if (isLoading) return <CustomLoading />;
  if (isError)
    return (
      <div className="p-10 text-center text-red-500">
        Failed to load content
      </div>
    );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: "#FEF0E4" }}
          >
            <Icon className="w-5 h-5" style={{ color: "#F1913D" }} />
          </div>
          <div>
            <h2 className="text-xl font-bold" style={{ color: "#2C2E33" }}>
              {title}
            </h2>
            <p className="text-sm" style={{ color: "#6C757D" }}>
              {description}
            </p>
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="h-11 px-6 rounded-lg font-semibold text-white flex items-center gap-2 shadow-md shadow-orange-100 cursor-pointer"
          style={{ backgroundColor: "#F1913D" }}
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* Editor Card */}
      <Card className="border-none shadow-sm bg-white p-0 overflow-hidden">
        <TiptapEditor content={content} onChange={setContent} />
      </Card>

      {/* Footer save button (mobile) */}
      <div className="flex justify-end md:hidden">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="h-11 px-6 rounded-lg font-semibold text-white flex items-center gap-2"
          style={{ backgroundColor: "#F1913D" }}
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
