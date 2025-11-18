import { Button } from "@/components/ui/button";

const BackButton = () => {
  return (
    <Button
      className="rounded px-2 py-1 text-sm hover:underline border-none cursor-pointer"
      type="button"
      onClick={() => window.history.back()}
    >
      ← Back
    </Button>
  );
};
export default BackButton;
