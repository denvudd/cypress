"use client";

import React from "react";
import dynamic from "next/dynamic";
import data from "@emoji-mart/data";
import { Loader } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useTheme } from "next-themes";

const Picker = dynamic(() => import("@emoji-mart/react"), {
  ssr: false,
  loading: () => (
    <div className="w-[250px] h-[100px] flex justify-center items-center">
      <p className="text-center text-muted-foreground text-sm inline-flex items-center gap-2">
        <Loader className="animate-spin size-4" />
        Loading...
      </p>
    </div>
  ),
});

interface EmojiPickerProps {
  children: React.ReactNode;
  getValue?: (emoji: string) => void;
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({ children, getValue }) => {
  const { theme } = useTheme();

  const handleSelectEmoji = (selectedEmoji: string) => {
    if (getValue) {
      getValue(selectedEmoji);
    }
  };

  return (
    <div className="flex items-center">
      <Popover>
        <PopoverTrigger className="cursor-pointer">{children}</PopoverTrigger>
        <PopoverContent align="start" className="p-0 border-none">
          <Picker
            data={data}
            onEmojiSelect={(emoji: any) => handleSelectEmoji(emoji.native)}
            previewPosition="none"
            set="native"
            theme={theme}
            navPosition="bottom"
            emojiButtonRadius="6px"
            emojiButtonColors={[
              "rgba(155,223,88,.7)",
              "rgba(149,211,254,.7)",
              "rgba(247,233,34,.7)",
              "rgba(238,166,252,.7)",
              "rgba(255,213,143,.7)",
              "rgba(211,209,255,.7)",
            ]}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default EmojiPicker;
