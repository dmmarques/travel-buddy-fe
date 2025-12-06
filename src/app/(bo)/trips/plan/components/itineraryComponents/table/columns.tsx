import { ColumnDef } from "@tanstack/react-table";
import type { Activity } from "@/app/(bo)/trips/types/activity";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Utensils,
  Volleyball,
  Binoculars,
  FerrisWheel,
  HelpCircle,
  ArrowUpDown,
} from "lucide-react";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";

// Map category names to Lucide icons
const categoryIconMap: Record<string, React.ReactNode> = {
  food: <Utensils className="h-5 w-5" stroke="black" />,
  sport: <Volleyball className="h-5 w-5" stroke="black" />,
  sightseeing: <Binoculars className="h-5 w-5" stroke="black" />,
  entertainment: <FerrisWheel className="h-5 w-5" stroke="black" />,
  other: <HelpCircle className="h-5 w-5" stroke="black" />,
};

// Category colors matching PieChartComponent
const categoryColors: Record<string, string> = {
  food: "var(--chart-2)",
  sport: "var(--chart-3)",
  sightseeing: "var(--chart-4)",
  entertainment: "var(--chart-5)",
  other: "var(--chart-6)",
};

export function columns({
  onDelete,
  onEdit,
}: {
  onDelete: (activity: Activity) => void;
  onEdit?: (activity: Activity) => void;
}): ColumnDef<Activity>[] {
  return [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ getValue }) => {
        const value = getValue() as string;
        const color = categoryColors[value] || "var(--chart-7)";
        return (
          <div className="flex items-center justify-center w-full">
            <HoverCard>
              <HoverCardTrigger asChild>
                <span className="flex items-center justify-center cursor-pointer">
                  <span
                    className="inline-flex items-center justify-center rounded-md"
                    style={{ background: color, width: 32, height: 32 }}
                  >
                    {categoryIconMap[value] || (
                      <HelpCircle className="h-5 w-5" />
                    )}
                  </span>
                </span>
              </HoverCardTrigger>
              <HoverCardContent className="py-1 px-2 text-xs rounded-md min-w-0 w-auto max-w-[100px]">
                {value.charAt(0).toUpperCase() + value.slice(1)}
              </HoverCardContent>
            </HoverCard>
          </div>
        );
      },
    },
    {
      accessorKey: "activityDate",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Time
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const date = row.original.activityDate;
        if (!date) return "-";
        const d = new Date(date);
        const hour = d.getHours().toString().padStart(2, "0");
        const minute = d.getMinutes().toString().padStart(2, "0");
        return <span>{`${hour}:${minute}`}</span>;
      },
    },
    {
      accessorKey: "cost",
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
        const cost = row.original.cost;
        return <span>€{cost}</span>;
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
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  if (onEdit) onEdit(row.original);
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
