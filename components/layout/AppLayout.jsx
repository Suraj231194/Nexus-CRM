import { AppSidebar } from "./AppSidebar";
export function AppLayout({ children }) {
  return (<div className="flex h-screen overflow-hidden bg-background">
    <AppSidebar />
    <main className="flex-1 overflow-y-auto w-full">
      {children}
    </main>
  </div>);
}
