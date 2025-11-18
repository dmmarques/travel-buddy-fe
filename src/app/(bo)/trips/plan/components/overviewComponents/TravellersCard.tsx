import { Card, CardContent } from "@/components/ui/card";
import { Trip } from "@/app/(bo)/trips/types/trip";
import { User, Baby, PawPrint } from "lucide-react";

interface TravellersCardProps {
  trip: Trip;
}

export default function TravellersCard({ trip }: TravellersCardProps) {
  const userCount = trip.participantUsernames?.length || 1;
  const babyCount = trip.babies || 0;
  const petCount = trip.pets || 0;
  const iconSize = 18;

  return (
    <Card className="flex-1 mt-2 basis-1/2 flex flex-col p-2 h-full">
      <CardContent className="pt-0 flex-1 grid place-items-center">
        <span className="text-base font-semibold mb-2">Travellers</span>
        <div className="flex gap-6 mt-0 justify-center items-center">
          <div className="flex flex-col items-center">
            <User size={iconSize} className="text-gray-700 mb-0.5" />
            <span className="font-medium text-xs leading-tight">
              {userCount}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <Baby size={iconSize} className="text-pink-400 mb-0.5" />
            <span className="font-medium text-xs leading-tight">
              {babyCount}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <PawPrint size={iconSize} className="text-yellow-700 mb-0.5" />
            <span className="font-medium text-xs leading-tight">
              {petCount}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
