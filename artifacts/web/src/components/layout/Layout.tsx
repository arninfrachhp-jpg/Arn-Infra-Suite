import { useAuthStore } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { HardHat, LogOut, LayoutDashboard, Users, PlusCircle } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuthStore();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  if (!user) {
    return <div className="min-h-[100dvh] w-full bg-background">{children}</div>;
  }

  return (
    <div className="min-h-[100dvh] w-full flex flex-col md:flex-row bg-background">
      {/* Mobile Header / Desktop Sidebar */}
      <header className="md:w-64 md:shrink-0 bg-sidebar border-b md:border-b-0 md:border-r border-sidebar-border flex flex-col">
        <div className="p-4 border-b border-sidebar-border/50 flex items-center gap-3 text-sidebar-foreground">
          <div className="bg-primary text-primary-foreground p-2 rounded">
            <HardHat className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold tracking-tight text-lg">ARN INFRA</h1>
            <p className="text-xs text-sidebar-foreground/70 uppercase tracking-wider font-semibold">Field Operations</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-2 space-y-1">
            {user.role === "admin" && (
              <>
                <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link href="/users" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                  <Users className="w-4 h-4" />
                  Users
                </Link>
              </>
            )}
            {user.role === "operator" && (
              <Link href="/entry" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                <PlusCircle className="w-4 h-4" />
                Data Entry
              </Link>
            )}
          </nav>
        </div>

        <div className="p-4 border-t border-sidebar-border/50">
          <div className="mb-4">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</p>
            <p className="text-xs text-sidebar-foreground/70 capitalize">{user.role}</p>
          </div>
          <Button variant="outline" className="w-full justify-start text-sidebar-foreground border-sidebar-border hover:bg-sidebar-accent hover:text-sidebar-accent-foreground bg-transparent" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-[100dvh] md:h-screen overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
