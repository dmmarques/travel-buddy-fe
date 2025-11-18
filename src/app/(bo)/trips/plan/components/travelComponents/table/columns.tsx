"use client";

import { Travel } from "@/app/(bo)/trips/types/travel";
import { ColumnDef } from "@tanstack/react-table";
import {
  MoreHorizontal,
  CarFront,
  InfoIcon,
  BrainCircuit,
  ReceiptEuro,
} from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { LuFuel } from "react-icons/lu";
import { FaRoad } from "react-icons/fa";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUpDown } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export const columns = (
  onEdit?: (travel: Travel) => void,
  onDelete?: (travel: Travel) => void
): ColumnDef<Travel>[] => [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "transport",
    header: "Transport",
    cell: ({ getValue }) => {
      const value = getValue();
      if (value === "car") {
        return (
          <div className="flex justify-center items-center w-full">
            <CarFront className="w-5 h-5" />
          </div>
        );
      }
      return (
        <div className="flex justify-center items-center w-full">
          {value as React.ReactNode}
        </div>
      );
    },
  },
  {
    accessorKey: "distance",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Distance
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "estimatedDuration",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Duration
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ getValue }) => {
      const value = getValue() as string;
      if (!value) return "--";
      // Convert 'X hours Y mins' or 'X h Y min' to 'XhYm'
      const hourMatch = value.match(/(\d+)\s*(h|hour|hours)/i);
      const minMatch = value.match(/(\d+)\s*(m|min|mins)/i);
      const h = hourMatch ? hourMatch[1] : "";
      const m = minMatch ? minMatch[1] : "";
      if (h && m) return `${h}h${m}m`;
      if (h) return `${h}h`;
      if (m) return `${m}m`;
      return value;
    },
  },
  {
    accessorKey: "estimatedCost",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Cost
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const cost = row.original.estimatedCost;
      const genTravelCost = row.original.genTravelCost;
      return (
        <div className="flex items-center gap-1">
          <span>{cost ? `${cost} €` : "--"}</span>
          <div className="flex items-center gap-1">
            {/* Info Icon with Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  tabIndex={0}
                  aria-label="Show cost breakdown"
                  className="flex items-center"
                >
                  <InfoIcon className="w-4 h-4 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-30 p-3 text-xs">
                <div className="font-semibold mb-3 text-center">Cost</div>
                {genTravelCost ? (
                  <div className="relative grid grid-cols-5 gap-0 text-center items-stretch">
                    {/* Top row: Fuel and Toll */}
                    <div className="col-span-2 flex flex-col items-center justify-center">
                      <span className="flex items-center gap-1">
                        <LuFuel className="w-4 h-4 text-black dark:text-white" />
                        <span className="font-medium whitespace-nowrap">
                          {genTravelCost.fuel} €
                        </span>
                      </span>
                    </div>
                    <div></div>
                    <div className="col-span-2 flex flex-col items-center justify-center">
                      <span className="flex items-center gap-1">
                        <FaRoad className="w-4 h-4 text-black dark:text-white" />
                        <span className="font-medium whitespace-nowrap">
                          {genTravelCost.tollCost} €
                        </span>
                      </span>
                    </div>
                    <Separator
                      orientation="horizontal"
                      className="col-span-5 my-2"
                    />
                    {/* Bottom row: Total */}
                    <div className="col-span-5 flex flex-col items-center justify-center mt-1">
                      <span className="flex items-center gap-1">
                        <ReceiptEuro className="w-4 h-4 text-black dark:text-white" />
                        <span className="font-medium whitespace-nowrap">
                          {genTravelCost.totalCost} €
                        </span>
                      </span>
                    </div>
                  </div>
                ) : (
                  <span>No breakdown available.</span>
                )}
              </PopoverContent>
            </Popover>
            {/* AI Icon with HoverCard */}
            <HoverCard>
              <HoverCardTrigger asChild>
                <button
                  type="button"
                  tabIndex={0}
                  aria-label="AI info"
                  className="flex items-center"
                >
                  <BrainCircuit className="w-4 h-4 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300" />
                </button>
              </HoverCardTrigger>
              <HoverCardContent className="w-40">
                <div className="flex justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-sm">Calculated by AI.</p>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>
        </div>
      );
    },
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
            <DropdownMenuItem onClick={() => onEdit && onEdit(row.original)}>
              <span className="text-yellow-500">Edit</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete && onDelete(row.original)}
            >
              <span className="text-red-600">Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
