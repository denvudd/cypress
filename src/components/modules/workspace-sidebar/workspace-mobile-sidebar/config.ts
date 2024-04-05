import CypressPageIcon from "@/components/ui/icons/page-icon";
import { MenuIcon } from "lucide-react";

export const MOBILE_SIDEBAR_NAVIGATION = [
  {
    title: "Sidebar",
    id: "sidebar",
    Icon: MenuIcon,
  },
  {
    title: "Pages",
    id: "pages",
    Icon: CypressPageIcon,
  },
] as const;
