import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export function AppLayout() {
  return (
    <div className="flex min-h-screen bg-base">
      <Sidebar />
      <main className="flex-1 ml-[220px] px-8 py-7 max-w-[calc(100vw-220px)]">
        <Outlet />
      </main>
    </div>
  );
}
