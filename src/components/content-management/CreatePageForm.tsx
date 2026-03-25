"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import TiptapEditor from "./TiptapEditor";

const inputCls = "h-11 rounded-sm border text-sm px-4 focus-visible:ring-1 focus-visible:ring-[#F1913D] focus-visible:border-[#F1913D]";
const inputStyle = { borderColor: "#F2F2F2", color: "#2C2E33", backgroundColor: "#FAFAFA" };

export default function CreatePageForm({ onCancel }: { onCancel?: () => void }) {
  const [content, setContent] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [tags, setTags] = useState<string[]>(["Sustainable", "Future", "Green"]);
  const [tagInput, setTagInput] = useState("");

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const removeTag = (t: string) => setTags(tags.filter((tag) => tag !== t));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Page published successfully!");
    if (onCancel) onCancel();
  };

  return (
    <div className="w-full max-w-6xl mx-auto bg-[#F8F7FC] p-6 rounded-xl relative overflow-y-auto max-h-[95vh] scrollbar-hide">
      {onCancel && (
        <button onClick={onCancel} className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-200 transition-colors z-10">
          <X className="w-5 h-5 text-gray-500" />
        </button>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Col - Basic Info + Editor */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm space-y-6">
            <h2 className="text-lg font-bold" style={{ color: "#2C2E33" }}>Basic Information</h2>

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Page Title</Label>
              <Input className={inputCls} style={inputStyle} placeholder="e.g. Our Sustainable Future" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">URL Slug</Label>
              <Input className={inputCls} style={inputStyle} placeholder="our-sustainable-future" />
            </div>

            {/* Tiptap Rich Text Editor */}
            <TiptapEditor
              content={content}
              onChange={(richText) => setContent(richText)}
            />
          </div>

          {/* Bottom Actions for Left Col (Mobile) */}
          <div className="bg-white p-4 rounded-xl shadow-sm flex justify-end gap-3 lg:hidden">
            <Button type="button" variant="outline" onClick={onCancel} className="h-11 px-8 rounded-sm font-semibold border" style={{ borderColor: "#F2F2F2" }}>Cancel</Button>
            <Button type="submit" className="h-11 px-8 rounded-sm font-semibold text-white" style={{ backgroundColor: "#F1913D" }}>Published</Button>
          </div>
        </div>

        {/* Right Col - Settings */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm space-y-5">
            <h2 className="text-lg font-semibold border-b pb-3" style={{ color: "#2C2E33" }}>Publishing Settings</h2>

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Status</Label>
              <Select defaultValue="Draft">
                <SelectTrigger className="h-11 rounded-sm w-full py-5 border" style={inputStyle}><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Author</Label>
              <Input className={inputCls} style={inputStyle} placeholder="Alex Rivera" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Publish Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full h-11 justify-start text-left font-normal rounded-sm border",
                      !date && "text-muted-foreground"
                    )}
                    style={inputStyle}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Brief Description</Label>
              <Textarea
                className="rounded-sm border text-sm p-4 min-h-[100px] resize-none"
                style={inputStyle}
                placeholder="Give a brief summary of this page..."
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Meta Title</Label>
              <Input className={inputCls} style={inputStyle} placeholder="Search engine title" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Meta Description</Label>
              <Textarea className="rounded-sm border text-sm p-4 min-h-[100px] resize-none" style={inputStyle} placeholder="Brief summary for search results..." />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Tags</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((t) => (
                  <Badge
                    key={t}
                    variant="secondary"
                    className="flex items-center gap-1 bg-[#FEF0E4] text-[#F1913D] border-[#F1913D]/20"
                  >
                    {t}
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-red-500"
                      onClick={() => removeTag(t)}
                    />
                  </Badge>
                ))}
              </div>
              <Input
                className={inputCls}
                style={inputStyle}
                placeholder="Press Enter to add tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
              />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm hidden lg:flex justify-stretch gap-3">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1 h-11 rounded-sm font-semibold border hover:bg-gray-50 transition-colors" style={{ borderColor: "#F2F2F2" }}>Cancel</Button>
            <Button type="submit" className="flex-1 h-11 rounded-sm font-semibold text-white shadow-lg shadow-orange-100" style={{ backgroundColor: "#F1913D" }}>Published</Button>
          </div>
        </div>
      </form>
    </div>
  );
}

