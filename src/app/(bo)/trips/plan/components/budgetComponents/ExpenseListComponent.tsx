import { Activity } from "@/app/(bo)/trips/types/activity";
import { DataTable } from "./table/data-table";
import { columns } from "./table/columns";

interface ExpenseListComponentProps {
  activities: Activity[];
  selectedCategory?: string | null;
}

export default function ExpenseListComponent({
  activities,
  selectedCategory,
}: ExpenseListComponentProps) {
  return (
    <div className="w-full h-full">
      <DataTable
        columns={columns}
        data={activities}
        selectedCategory={selectedCategory as string | null}
      />
    </div>
  );
}
