"use client";

import { LoaderCircle } from "lucide-react";
import { useFormStatus } from "react-dom";

type FormSubmitButtonProps = {
  label: string;
  pendingLabel?: string;
  className?: string;
};

export default function FormSubmitButton({
  label,
  pendingLabel = "Saving...",
  className = "",
}: FormSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex h-[48px] w-full items-center justify-center gap-2 rounded-[12px] bg-[#CE2127] px-5 text-[14px] font-body font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-75 ${className}`.trim()}
    >
      {pending ? (
        <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : null}
      <span>{pending ? pendingLabel : label}</span>
    </button>
  );
}
