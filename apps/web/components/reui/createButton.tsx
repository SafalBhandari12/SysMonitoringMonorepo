"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import Loading from "../loading";

export default function CreateButton({
  href,
  text,
}: {
  href: string;
  text: string;
}) {
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);
    window.location.href = href;
  };
  return (
    <Button
      className={"flex items-center justify-center"}
      onClick={handleClick}
    >
      {loading ? (
        "Loading.."
      ) : (
        <>
          <Plus />
          {text}
        </>
      )}
    </Button>
  );
}
