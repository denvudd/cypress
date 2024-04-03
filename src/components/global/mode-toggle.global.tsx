"use client";

import React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button, ButtonProps } from "../ui/button";

const ModeToggle = React.forwardRef<HTMLButtonElement, ButtonProps>(({...props}, ref) => {
  const { setTheme, theme } = useTheme();

  return (
    <Button
      variant={"outline"}
      size="icon"
      ref={ref}
      className="size-8"
      {...props}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  );
});

ModeToggle.displayName = "ModeToggle";

export default ModeToggle;
