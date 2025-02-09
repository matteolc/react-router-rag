import { DonutIcon } from "lucide-react";
import { Sparkles } from "lucide-react";

export const sidebar = {
  navMain: [
    {
      title: "Chat",
      url: "/chat",
      icon: Sparkles,
      isActive: true,
    },
  ],
  footer: [],
  secondary: [
    {
      name: "Documents",
      url: "/uploads",
      icon: DonutIcon,
    },
  ],
};
