import { Home, Heart, User, Settings, Plus } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { useUser } from "@/hooks/use-user";

interface NavItemProps {
  icon: React.ReactNode;
  href: string;
  isActive: boolean;
}

function NavItem({ icon, href, isActive }: NavItemProps) {
  return (
    <Link href={href}>
      <button
        className={cn(
          "flex items-center justify-center w-12 h-12 rounded-full",
          "transition-colors hover:bg-white/20",
          isActive && "text-primary bg-white/10"
        )}
      >
        {icon}
      </button>
    </Link>
  );
}

export default function BottomNav({ currentPath }: { currentPath: string }) {
  const { user } = useUser();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="flex items-center justify-around p-2 bg-black/80 backdrop-blur-sm text-white">
        <NavItem
          icon={<Home className="w-6 h-6" />}
          href="/"
          isActive={currentPath === "/"}
        />
        <NavItem
          icon={<Plus className="w-6 h-6" />}
          href="/suggest"
          isActive={currentPath === "/suggest"}
        />
        {user ? (
          <>
            <NavItem
              icon={<User className="w-6 h-6" />}
              href="/profile"
              isActive={currentPath === "/profile"}
            />
            <NavItem
              icon={<Settings className="w-6 h-6" />}
              href="/settings"
              isActive={currentPath === "/settings"}
            />
          </>
        ) : (
          <NavItem
            icon={<User className="w-6 h-6" />}
            href="/login"
            isActive={currentPath === "/login"}
          />
        )}
      </div>
    </nav>
  );
}