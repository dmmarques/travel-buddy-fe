"use client";

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
import { authClient } from "../../../../lib/auth-client";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "../../../../server/users";
import { SidebarTrigger } from "@/components/ui/sidebar";

import React, { useEffect, useState } from "react";

const AppNavBar = () => {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const user = await getCurrentUser();
        const uname = user?.currentUser?.name || "";
        setUsername(uname);
      } catch {
        setUsername("");
      }
    })();
  }, []);

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/login");
  };

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
            <DropdownMenuLabel>
              Logged in as{" "}
              {username ? (
                <span className="font-semibold">{username}</span>
              ) : (
                <span className="italic text-gray-400">Loading...</span>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={handleLogout}
              className="gap-2 flex justify-center items-center"
            >
              <LogOut className="size-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
};

export default AppNavBar;
