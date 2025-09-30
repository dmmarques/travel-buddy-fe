import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { LogOut, UserRoundIcon } from "lucide-react";
import { User } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";

const AppNavBar = () => {
  return (
    <nav className="p-4 flex items-center justify-between">
      {/* LEFT SIDE */}
      <SidebarTrigger />
      {/* RIGHT SIDE */}
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <div className="flex items-center">
              <Avatar className="mr-3 ring-2 ring-gray-400 ring-offset-[3px] ring-offset-background">
                <AvatarFallback>
                  <UserRoundIcon className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent sideOffset={10}>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive">
              <LogOut />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
};

export default AppNavBar;
