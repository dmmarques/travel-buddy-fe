import {
  PlaneTakeoff,
  Calendar,
  Map,
  Users,
  LogOut,
  Earth,
} from "lucide-react";
import {
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  Sidebar,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import Link from "next/link";

const items = [
  {
    title: "My Trips",
    url: "/trips",
    icon: PlaneTakeoff,
  },
  {
    title: "My groups",
    url: "#",
    icon: Users,
  },
  {
    title: "My Calendar",
    url: "/calendar",
    icon: Calendar,
  },
  {
    title: "Map",
    url: "#",
    icon: Map,
  },
];

const AppSidebar = () => {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/">
                <Earth />
                <span>Travel Buddy</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarSeparator></SidebarSeparator>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>My Travel Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="flex items-center justify-center w-full gap-2">
              <LogOut />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
