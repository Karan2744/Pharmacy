import { ImageIcon, ImagePlus, Settings } from "lucide-react";

import LogoTab from "./LogoTab";
import BannerTab from "./BannerTab";
import SettingsTab from "./SettingsTab";

export const tabs = [
  { id: "logo",     label: "Logo",    icon: ImageIcon,  component: LogoTab },
  { id: "banner",   label: "Banner",  icon: ImagePlus,  component: BannerTab },
  { id: "settings", label: "General", icon: Settings,   component: SettingsTab },
];
