import Image from "next/image";
import { CgSearch } from "react-icons/cg";
export default function DashboardHeader() {
  const userName = "مدیر";
  return (
    <header className="grid grid-cols-3 items-center border-b border-border p-4">
      <nav className="right_nav items-start">
        <div className="profile_wrapper flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-[100vw] bg-linear-to-tl from-blue-300 to-blue-100 flex items-center justify-center">
            <span className="font-black text-blue-950 -mt-1">
              {userName?.trim().charAt(0) || "؟"}
            </span>
          </div>
          <span>{userName}</span>
        </div>
      </nav>
      <nav className="middle_nav flex items-center justify-center">
        <form className="flex w-full max-w-sm items-center gap-2">
          <label htmlFor="simple-search" className="sr-only">
            جستجو
          </label>

          <search className="min-w-0 flex-1">
            <input
              type="search"
              id="simple-search"
              placeholder="جستجوی منطقه یا بلوک..."
              className="block w-full rounded-lg border border-border bg-surface py-2.5 px-3 text-sm text-foreground outline-none transition placeholder:text-foreground-muted focus:ring-2 focus:ring-action-primary-hover/20"
            />
          </search>

          <button
            type="submit"
            aria-label="جستجو"
            className="flex p-2 shrink-0 items-center justify-center rounded-lg bg-action-primary text-white transition duration-300 hover:bg-action-primary-hover focus:outline-none focus:ring-2 focus:ring-action-primary-hover/20"
          >
            <CgSearch fontSize={24} />
          </button>
        </form>
      </nav>
      <nav className="left_nav flex gap-3 items-center justify-end">
        <strong>سامانه زمین نگار</strong>
        <Image
          src="/zaminnegar-logo.png"
          alt="Zaminnegar"
          width={40}
          height={40}
        />
      </nav>
    </header>
  );
}
