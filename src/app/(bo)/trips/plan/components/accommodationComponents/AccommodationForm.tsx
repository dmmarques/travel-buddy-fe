import { useForm } from "react-hook-form";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Accommodation } from "@/app/(bo)/trips/types/accommodation";

import { CheckCircle2 } from "lucide-react";
import { SquareCheckBig, SquareX } from "lucide-react";

export interface AccommodationFormProps {
  accommodation: Accommodation | null;
  onSubmit: (values: Accommodation) => Promise<void>;
  trip?: { creator: number };
}

export function AccommodationForm(props: AccommodationFormProps) {
  // Get number of travellers from trip (for now, just Trip.creator)
  const { accommodation, onSubmit, trip } = props;
  const numAdults = trip?.creator || 1;
  // In the future, will add state for children and pets
  const numChildren = 0;
  const numPets = 0;

  const [showSaved, setShowSaved] = useState(false);
  const form = useForm<Accommodation>({
    defaultValues: accommodation || {
      id: "",
      name: "",
      googlePlaceId: "",
      googleRating: undefined,
      googleReviewsNumber: undefined,
      address: "",
      internationalPhoneNumber: "",
      latitude: "",
      longitude: "",
      isAccessible: undefined,
      checkInDate: "",
      checkOutDate: "",
      priceForAdult: 0,
      priceForChild: 0,
      allowsPets: false,
      priceForPet: 0,
    },
  });

  // Calculate total cost (must be after form is declared)
  const priceForAdult = form.watch("priceForAdult") || 0;
  const priceForChild = form.watch("priceForChild") || 0;
  const priceForPet = form.watch("priceForPet") || 0;
  const allowsPets = form.watch("allowsPets");
  const checkInDate = form.watch("checkInDate");
  const checkOutDate = form.watch("checkOutDate");

  // Calculate number of nights (exclude check-out day, hotel logic)
  let nights = 0;
  if (checkInDate && checkOutDate) {
    const inDate = new Date(checkInDate);
    const outDate = new Date(checkOutDate);
    // Only use the date part for calculation (ignore time)
    inDate.setHours(0, 0, 0, 0);
    outDate.setHours(0, 0, 0, 0);
    const diff = outDate.getTime() - inDate.getTime();
    nights = Math.max(0, diff / (1000 * 60 * 60 * 24));
  }

  const totalCost =
    nights *
    (numAdults * priceForAdult +
      numChildren * priceForChild +
      (allowsPets ? numPets * priceForPet : 0));

  const handleSubmit = async (values: Accommodation) => {
    await onSubmit(values);
    form.reset(values);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  };

  return (
    <div
      className="flex w-full h-full relative"
      style={{ background: "white" }}
    >
      {/* Success Overlay */}
      <div
        className={
          "absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/80 transition-opacity duration-500 z-20 " +
          (showSaved ? "opacity-100" : "opacity-0 pointer-events-none")
        }
      >
        <CheckCircle2 className="w-12 h-12 text-green-600" />
        <span className="text-green-700 font-semibold text-xl">
          Trip Updated!
        </span>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="flex w-full h-full"
        >
          {/* Column 1 */}
          <div className="flex-1 p-4 flex flex-col h-full">
            {/* Add content for column 1 here */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex-1 flex flex-col justify-center">
                  <FormLabel className="w-full flex justify-center items-center text-center mb-2">
                    Accommodation
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="w-full md:w-[95%]"
                      placeholder="Accommodation name"
                      type="text"
                      readOnly
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className="flex-1 flex flex-col justify-center">
                  <FormLabel className="w-full flex justify-center items-center text-center mb-2">
                    Address
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="w-full md:w-[95%]"
                      placeholder="Accommodation address"
                      type="text"
                      readOnly
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="internationalPhoneNumber"
              render={({ field }) => (
                <FormItem className="flex-1 flex flex-col justify-center">
                  <FormLabel className="w-full flex justify-center items-center text-center mb-2">
                    Phone Number
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="w-full md:w-[95%]"
                      placeholder="Accommodation phone number"
                      type="text"
                      readOnly
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isAccessible"
              render={({ field }) => (
                <FormItem className="flex-1 flex flex-col justify-center">
                  <FormLabel className="w-full flex justify-center items-center text-center mb-2">
                    Accessibility
                  </FormLabel>
                  <FormControl>
                    <div className="w-full md:w-[95%] flex items-center justify-center gap-2 py-2">
                      {field.value ? (
                        <>
                          <SquareCheckBig className="text-green-600 w-6 h-6" />
                          <span className="text-green-700 font-medium">
                            Accessible
                          </span>
                        </>
                      ) : (
                        <>
                          <SquareX className="text-red-600 w-6 h-6" />
                          <span className="text-red-700 font-medium">
                            Not Accessible
                          </span>
                        </>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Google Info Section moved here */}
            <div className="flex flex-col mt-4 mb-2">
              <div className="flex w-full justify-center items-center mb-2">
                <FcGoogle size={40} />
              </div>
              <div className="flex flex-row w-full">
                <div className="flex-1 flex flex-col items-center justify-center">
                  <FormField
                    control={form.control}
                    name="googleRating"
                    render={({ field }) => (
                      <FormItem className="w-[100px] text-center flex flex-col items-center justify-center">
                        <FormLabel className="w-full flex justify-center items-center text-center">
                          Rating
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="w-full text-center"
                            placeholder="e.g. 4.5"
                            type="number"
                            step="0.1"
                            min="0"
                            max="5"
                            readOnly
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex-1 flex flex-col items-center justify-center">
                  <FormField
                    control={form.control}
                    name="googleReviewsNumber"
                    render={({ field }) => (
                      <FormItem className="w-[100px] text-center flex flex-col items-center justify-center">
                        <FormLabel className="w-full flex justify-center items-center text-center">
                          Reviews
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="w-full text-center"
                            placeholder="e.g. 123"
                            type="number"
                            min="0"
                            readOnly
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Column 2 */}
          <div className="flex-1 p-4 flex flex-col h-full">
            <div className="flex flex-col flex-1 h-full">
              <FormField
                control={form.control}
                name="checkInDate"
                render={({ field }) => (
                  <FormItem className="flex flex-1 items-center gap-3">
                    <FormLabel className="whitespace-nowrap w-40 text-right">
                      Check-in
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="w-[180px]"
                        type="datetime-local"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="checkOutDate"
                render={({ field }) => (
                  <FormItem className="flex flex-1 items-center gap-3">
                    <FormLabel className="whitespace-nowrap w-40 text-right">
                      Check-out
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="w-[180px]"
                        type="datetime-local"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priceForAdult"
                render={({ field }) => (
                  <FormItem className="flex flex-1 items-center gap-3">
                    <FormLabel className="whitespace-nowrap w-40 text-right">
                      Price per night (Adult)
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="w-[75px] appearance-none"
                        placeholder="100"
                        type="number"
                        min="0"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priceForChild"
                render={({ field }) => (
                  <FormItem className="flex flex-1 items-center gap-3">
                    <FormLabel className="whitespace-nowrap w-40 text-right">
                      Price per night (Child)
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="w-[75px]"
                        placeholder="50"
                        type="number"
                        min="0"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Save Button at the end, divides space equally */}
              <div className="flex-1 flex items-end justify-center">
                <Button
                  type="submit"
                  className="w-40"
                  disabled={!form.formState.isDirty || showSaved}
                >
                  Save
                </Button>
              </div>
            </div>

            {/* Total Cost Section */}
            <div className="mt-6 p-4 border-t ">
              <div className="font-semibold mb-2 text-lg text-center">
                Total Accommodation Cost
              </div>
              <div className="flex flex-col gap-2">
                {/* Row for adults, children, pets */}
                <div className="flex flex-row items-center gap-6 justify-center">
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Adults:</span>
                    <span>{numAdults}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Children:</span>
                    <span>{numChildren}</span>
                  </div>
                  {allowsPets && (
                    <div className="flex items-center gap-1">
                      <span className="font-medium">Pets:</span>
                      <span>{numPets}</span>
                    </div>
                  )}
                </div>
                {/* Row for nights and total */}
                <div className="flex flex-row items-center gap-6 justify-center mt-2 text-xl font-bold">
                  <div className="flex items-center gap-1 text-base font-normal">
                    <span className="font-medium text-sm">Nights:</span>
                    <span className="text-sm">{nights}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>Total:</span>
                    <span>
                      €{" "}
                      {totalCost.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
