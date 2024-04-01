"use client";

import React from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import data from "@emoji-mart/data";

const Picker = dynamic(() => import("@emoji-mart/react"));

interface EmojiPickerProps {
  children: React.ReactNode;
  getValue?: (emoji: string) => void;
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({ children, getValue }) => {
  const router = useRouter();

  const handleSelectEmoji = (selectedEmoji: string) => {
    if (getValue) {
      getValue(selectedEmoji);
    }
  };

  return (
    <div className="flex items-center">
      <Popover>
        <PopoverTrigger className="cursor-pointer">{children}</PopoverTrigger>
        <PopoverContent className="p-0 border-none">
          <Picker
            data={data}
            onEmojiSelect={(emoji: any) => handleSelectEmoji(emoji.native)}
            previewPosition="none"
            set="native"
            navPosition="bottom"
            emojiButtonRadius='6px'
            emojiButtonColors={[
             'rgba(155,223,88,.7)',
             'rgba(149,211,254,.7)',
             'rgba(247,233,34,.7)',
             'rgba(238,166,252,.7)',
             'rgba(255,213,143,.7)',
             'rgba(211,209,255,.7)',
            ]}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default EmojiPicker;
