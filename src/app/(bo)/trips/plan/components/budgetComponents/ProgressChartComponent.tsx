import { Progress } from "@/components/ui/progress";

interface ProgressChartComponentProps {
  budget?: number;
  totalSpending: number;
}

export default function ProgressChartComponent({
  budget,
  totalSpending,
}: ProgressChartComponentProps) {
  const percent =
    budget && budget > 0 ? Math.min((totalSpending / budget) * 100, 100) : 0;
  return (
    <div className="w-full">
      <span className="text-xs mb-1 block">
        Consumed budget: {budget ? `${percent.toFixed(1)}%` : "N/A"}
      </span>
      <Progress value={percent} max={100} />
      <div className="flex justify-between text-xs mt-1">
        <span>Spent: €{totalSpending}</span>
        <span>Total Budget: {budget ? `€${budget}` : "N/A"}</span>
      </div>
    </div>
  );
}
