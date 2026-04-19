import { FourSquare } from "react-loading-indicators";

export default function Loading() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <FourSquare color="#000000" size="medium" />
    </div>
  );
}
