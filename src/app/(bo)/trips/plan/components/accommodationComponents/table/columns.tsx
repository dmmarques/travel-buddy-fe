"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
import { Accommodation } from "@/app/(bo)/trips/types/accommodation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function columns({
  onDelete,
  onEdit,
}: {
  onDelete: (accommodation: Accommodation) => void;
  onEdit: (accommodation: Accommodation) => void;
}): ColumnDef<Accommodation>[] {
  return [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "checkInDate",
      header: "Check-In Date",
    },
    {
      accessorKey: "checkOutDate",
      header: "Check-Out Date",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(row.original);
                }}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(row.original);
                }}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
