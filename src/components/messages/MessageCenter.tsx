"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { MoreVertical, Search, SendHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const PRIMARY_ORANGE = "#F1913D";

interface Message {
  id: string;
  senderId: string;
  text: string;
  time: string;
  isMe: boolean;
  avatar?: string;
}

interface ChatItem {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  statusText: string;
  unread?: number;
  isTyping?: boolean;
  isPinned?: boolean;
  messages: Message[];
}

const initialChats: ChatItem[] = [
  {
    id: "1",
    name: "Sarah Jenkins",
    avatar: "https://i.pravatar.cc/150?u=sarah",
    lastMessage: "Please meet me at the main entrance. I'll have the access cards ready. I'm also bringing the updated floor plan we discussed.",
    time: "10m",
    statusText: "ONLINE . LUXURY PROPERTY SPECIALIST",
    isPinned: true,
    messages: [
      { id: "m1", senderId: "sarah", text: "Hello Alex! I've confirmed the viewing for the Midtown Penthouse tomorrow at 2:00 PM. Does that time still work for you?", time: "01:20 AM", isMe: false, avatar: "https://i.pravatar.cc/150?u=sarah" },
      { id: "m2", senderId: "me", text: "That's great, Sarah! Yes, 2:00 PM works perfectly. Should I meet you at the main entrance or at the sales office?", time: "01:21 AM", isMe: true, avatar: "https://i.pravatar.cc/150?u=me" },
      { id: "m3", senderId: "sarah", text: "Please meet me at the main entrance. I'll have the access cards ready. I'm also bringing the updated floor plan we discussed.", time: "01:22 AM", isMe: false, avatar: "https://i.pravatar.cc/150?u=sarah" },
    ]
  },
  {
    id: "2",
    name: "Jhon Deo",
    avatar: "https://i.pravatar.cc/150?u=2",
    lastMessage: "Victor is typing ...",
    time: "10m",
    statusText: "OFFLINE . REAL ESTATE AGENT",
    unread: 12,
    isTyping: true,
    isPinned: true,
    messages: [
      { id: "m1", senderId: "jhon", text: "Are you still interested in the villa?", time: "10:15 AM", isMe: false, avatar: "https://i.pravatar.cc/150?u=2" },
    ]
  },
  { id: "3", name: "Robert Fox", avatar: "https://i.pravatar.cc/150?u=3", lastMessage: "Your application...", time: "1h", statusText: "ONLINE", isPinned: true, messages: [] },
  { id: "4", name: "Esther Howard", avatar: "https://i.pravatar.cc/150?u=4", lastMessage: "Victor is typing ...", time: "2h", statusText: "ONLINE", unread: 12, messages: [] },
  { id: "5", name: "Cameron Williamson", avatar: "https://i.pravatar.cc/150?u=5", lastMessage: "ok, thanks!", time: "5h", statusText: "OFFLINE", messages: [] },
  { id: "6", name: "Jhon Deo", avatar: "https://i.pravatar.cc/150?u=6", lastMessage: "ok, thanks!", time: "10m", statusText: "ONLINE", messages: [] },
  { id: "7", name: "Jhon Deo", avatar: "https://i.pravatar.cc/150?u=7", lastMessage: "Your application...", time: "10m", statusText: "ONLINE", unread: 12, messages: [] },
  { id: "8", name: "Jhon Deo", avatar: "https://i.pravatar.cc/150?u=8", lastMessage: "ok, thanks!", time: "10m", statusText: "OFFLINE", messages: [] },
];

export default function MessageCenter() {
  const [chats, setChats] = useState(initialChats);
  const [activeChatId, setActiveChatId] = useState(chats[0].id);
  const [messageInput, setMessageInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeChat = chats.find(c => c.id === activeChatId) || chats[0];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [activeChat.messages, activeChatId]);

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: "me",
      text: messageInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
      avatar: "https://i.pravatar.cc/150?u=me"
    };

    setChats(prev => prev.map(chat =>
      chat.id === activeChatId
        ? { ...chat, messages: [...chat.messages, newMessage], lastMessage: messageInput.trim() }
        : chat
    ));
    setMessageInput("");
  };

  return (
    <div className="flex bg-white rounded-xl border shadow-sm overflow-hidden h-full flex-1" style={{ borderColor: "#F2F2F2" }}>

      {/* ── Left Sidebar ── */}
      <div className="w-80 border-r flex flex-col bg-white min-h-0" style={{ borderColor: "#F2F2F2" }}>
        <div className="p-4 pt-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search Now"
              className="pl-11 h-12 bg-[#F3F4F6] border-none rounded-xl text-sm"
            />
          </div>
        </div>

        <ScrollArea className="flex-1 min-h-0">
          <div className="p-3 pt-0 space-y-4">
            <div>
              <div className="px-3 mb-2 flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300" /> Pinned
              </div>
              <div className="space-y-1">
                {chats.filter(c => c.isPinned).map(chat => (
                  <ChatItemComp
                    key={chat.id}
                    chat={chat}
                    active={activeChatId === chat.id}
                    onClick={() => setActiveChatId(chat.id)}
                  />
                ))}
              </div>
            </div>
            <div>
              <div className="px-3 mb-2 flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300" /> All Messages
              </div>
              <div className="space-y-1">
                {chats.filter(c => !c.isPinned).map(chat => (
                  <ChatItemComp
                    key={chat.id}
                    chat={chat}
                    active={activeChatId === chat.id}
                    onClick={() => setActiveChatId(chat.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* ── Right Panel ── */}
      <div className="flex-1 flex flex-col relative bg-[#F9FAFB]/30 min-h-0">
        <header className="h-[72px] border-b flex items-center justify-between px-6 bg-white shrink-0" style={{ borderColor: "#F2F2F2" }}>
          <div className="flex items-center gap-3">
            <Avatar className="w-11 h-11 rounded-xl">
              <AvatarImage src={activeChat.avatar} alt={activeChat.name} />
              <AvatarFallback>{activeChat.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-base font-bold text-gray-900 leading-none mb-1">{activeChat.name}</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                {activeChat.statusText}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="text-gray-400">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </header>

        <ScrollArea className="flex-1 min-h-0" viewportRef={scrollRef}>
          <div className="max-w-4xl mx-auto space-y-8 p-6 pb-10">
            <div className="flex justify-center">
              <span className="px-4 py-1.5 bg-white border border-gray-100 rounded-lg text-xs font-bold text-gray-400 shadow-sm">
                Today, March 12
              </span>
            </div>

            {activeChat.messages.length === 0 && (
              <div className="text-center py-20 text-gray-400 text-sm">
                No messages yet. Start the conversation!
              </div>
            )}

            {activeChat.messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex flex-col gap-1 max-w-[70%]",
                  msg.isMe ? "items-end ml-auto" : "items-start"
                )}
              >
                <div
                  className={cn(
                    "p-4 rounded-2xl shadow-sm border",
                    msg.isMe
                      ? "bg-[#F1913D] text-white rounded-tr-none border-transparent"
                      : "bg-white text-gray-700 rounded-tl-none border-gray-100"
                  )}
                >
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                </div>
                <div className={cn("flex items-center gap-2 mt-1", msg.isMe && "flex-row-reverse")}>
                  <Avatar className="w-7 h-7 rounded-lg">
                    <AvatarImage src={msg.avatar} />
                    <AvatarFallback>{msg.senderId[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="text-[10px] font-semibold text-gray-400">{msg.time}</span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="p-6 bg-white border-t shrink-0" style={{ borderColor: "#F2F2F2" }}>
          <form
            className="flex items-center gap-4 bg-[#F3F4F6] p-2 pl-4 rounded-2xl border border-gray-100"
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
          >
            <input
              className="flex-1 bg-transparent border-none focus:outline-none text-sm py-2"
              placeholder="Type your message ..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
            />
            <Button
              type="submit"
              className="h-11 px-6 rounded-xl text-white font-bold gap-2"
              style={{ backgroundColor: PRIMARY_ORANGE }}
            >
              <SendHorizontal className="w-5 h-5 fill-white" />
              Send
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}


function ChatItemComp({ chat, active, onClick }: { chat: ChatItem; active: boolean; onClick: () => void }) {
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "flex gap-3 p-3 rounded-2xl cursor-pointer transition-all border border-transparent",
        active ? "bg-white shadow-md border-gray-100" : "hover:bg-gray-50"
      )}
    >
      <Avatar className="w-12 h-12 rounded-2xl shrink-0">
        <AvatarImage src={chat.avatar} alt={chat.name} />
        <AvatarFallback>{chat.name[0]}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <h4 className="text-[13px] font-bold text-gray-900 truncate">{chat.name}</h4>
          <span className="text-[10px] font-bold text-gray-400">{chat.time}</span>
        </div>
        <p className={cn(
          "text-[12px] truncate leading-tight",
          chat.isTyping ? "text-[#2B9724] font-semibold italic" : "text-gray-500 font-medium"
        )}>
          {chat.lastMessage}
        </p>
      </div>

      <div className="flex flex-col items-center justify-center shrink-0">
        {chat.unread ? (
          <div
            className="min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center text-[9px] font-black text-white"
            style={{ backgroundColor: "#DC3545" }}
          >
            {chat.unread}
          </div>
        ) : (
          <div className="flex items-center -space-x-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={PRIMARY_ORANGE} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17L4 12" /></svg>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={PRIMARY_ORANGE} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17L4 12" /></svg>
          </div>
        )}
      </div>
    </motion.div>
  );
}
