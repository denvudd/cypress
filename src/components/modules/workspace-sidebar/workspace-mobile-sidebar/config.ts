import { FileIcon, MenuIcon } from "lucide-react";

export const MOBILE_SIDEBAR_NAVIGATION = [
  {
    title: "Sidebar",
    id: "sidebar",
    Icon: MenuIcon,
  },
  {
    title: "Pages",
    id: "pages",
    Icon: FileIcon,
  },
] as const;
