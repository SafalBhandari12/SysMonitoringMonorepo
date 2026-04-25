import { toast } from "sonner";

export default function Toast({ message }: { message: string }) {
  return toast.success(message, {
    action: {
      label: "x",
      onClick: () => {},
    },
  });
}
