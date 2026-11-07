"use client";
import { useRouter } from "next/navigation";
import { FiChevronLeft } from "react-icons/fi";

export function BackButton() {
  const router = useRouter();
  return (
    <button
      className="min-w-fit text-white flex gap-2 items-center bg-action-primary transition duration-300 py-2.5 px-4 rounded-lg cursor-pointer"
      onClick={() => {
        router.back();
      }}
    >
      <span className="text-sm text-white">بازگشت</span>
      <FiChevronLeft size={15} />
    </button>
  );
}
