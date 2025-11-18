import { Card } from "@/components/ui/card";

export default function TravellersTab() {
  return (
    <div className="flex-1 overflow-y-auto p-6 flex gap-6">
      <div className="flex-1 bg-white rounded-2xl shadow-md flex flex-col justify-between h-7/8">
        <Card className="flex-1 flex flex-col justify-center items-center">
          <span className="text-lg font-semibold">
            This card fills the left column of Travellers
          </span>
        </Card>
      </div>
      <div className="flex-1 bg-white rounded-2xl shadow-md flex flex-col justify-between h-7/8">
        <Card className="flex-1 flex flex-col justify-center items-center">
          <span className="text-lg font-semibold">
            This card fills the right column of Travellers
          </span>
        </Card>
      </div>
    </div>
  );
}
