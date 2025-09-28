"use client";

import {
  BarChart3,
  Building2,
  Calendar,
  CheckSquare,
  DollarSign,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Settings,
  Truck,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/auth-context";

interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive?: boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, signOut } = useAuth();

  const getNavigationData = React.useMemo((): NavGroup[] => {
    const baseNavigation: NavGroup[] = [
      {
        title: "Dashboard",
        items: [
          {
            title: "Dashboard",
            url:
              user?.role === "SELLER"
                ? "/seller"
                : user?.role === "ADMIN"
                  ? "/admin"
                  : "/dashboard",
            icon: LayoutDashboard,
          },
        ],
      },
    ];

    // Role-specific navigation
    if (user?.role === "BUYER") {
      baseNavigation.push({
        title: "Rental",
        items: [
          {
            title: "Vehicles",
            url: "/vehicles",
            icon: Truck,
          },
          {
            title: "Bookings",
            url: "/bookings",
            icon: Calendar,
          },
        ],
      });
    } else if (user?.role === "SELLER") {
      baseNavigation.push({
        title: "Management",
        items: [
          {
            title: "Vehicles",
            url: "/seller/vehicles",
            icon: Truck,
          },
          {
            title: "Bookings",
            url: "/seller/bookings",
            icon: Calendar,
          },
          {
            title: "Earnings",
            url: "/seller/earnings",
            icon: DollarSign,
          },
        ],
      });

      // Fleet-specific navigation
      if (user?.userType === "FLEET") {
        baseNavigation.push({
          title: "Fleet",
          items: [
            {
              title: "Fleet Overview",
              url: "/seller/fleet",
              icon: Building2,
            },
            {
              title: "Reports",
              url: "/seller/reports",
              icon: BarChart3,
            },
          ],
        });
      }
    } else if (user?.role === "ADMIN") {
      baseNavigation.push({
        title: "Admin",
        items: [
          {
            title: "Vehicle Management",
            url: "/admin/vehicle-management",
            icon: Truck,
          },
          {
            title: "Users",
            url: "/admin/users",
            icon: Users,
          },
          {
            title: "Approvals",
            url: "/admin/approvals",
            icon: CheckSquare,
          },
          {
            title: "Reports",
            url: "/admin/reports",
            icon: BarChart3,
          },
        ],
      });
    }

    // Common navigation for all users
    baseNavigation.push({
      title: "Account",
      items: [
        {
          title: "Profile",
          url: "/profile",
          icon: User,
        },
        {
          title: "Settings",
          url: "/settings",
          icon: Settings,
        },
        {
          title: "Help",
          url: "/help",
          icon: HelpCircle,
        },
      ],
    });

    return baseNavigation;
  }, [user?.role, user?.userType]);

  const navigationData = getNavigationData;

  const handleSignOut = React.useCallback(async () => {
    await signOut();
    window.location.href = "/";
  }, [signOut]);

  return (
    <Sidebar {...props}>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Truck className="h-6 w-6 text-sidebar-primary" />
            <span className="font-semibold text-sidebar-foreground">
              Ali Trucks
            </span>
          </div>
        </div>
        {user && (
          <div className="mt-3 p-2 bg-sidebar-accent rounded-lg">
            <p className="text-sm font-medium text-sidebar-accent-foreground">
              {user.name}
            </p>
            <p className="text-xs text-sidebar-accent-foreground/70">
              {user.email}
            </p>
            {user.role && (
              <p className="text-xs text-sidebar-accent-foreground/70">
                {user.role} {user.userType && `• ${user.userType}`}
              </p>
            )}
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        {navigationData.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={item.isActive}>
                      <Link
                        href={item.url}
                        className="flex items-center space-x-2"
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center justify-between mb-3">
          <ThemeSwitcher />
          <LanguageSwitcher />
        </div>
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
