import React from "react"
import { Link } from "react-router-dom"

import { cn } from "@/lib/utils"
import {
  NavigationMenu as ShadcnNavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { useAuth } from "@/contexts/AuthContext"
import { Rocket } from "lucide-react"


const components: { title: string; href: string; description: string }[] = [
  {
    title: "Slots",
    href: "/casino/slots",
    description: "Spin the reels on hundreds of exciting slot games.",
  },
  {
    title: "Live Casino",
    href: "/casino/live-casino",
    description: "Experience the thrill of live dealers and real-time action.",
  },
  {
    title: "Table Games",
    href: "/casino/table-games",
    description: "Classic casino table games like Blackjack, Roulette, and Poker.",
  },
  {
    title: "Jackpots",
    href: "/casino/jackpots",
    description: "Play for massive progressive jackpots and win big!",
  },
  {
    title: "New Games",
    href: "/casino/new",
    description: "Check out the latest game releases from top providers.",
  },
  {
    title: "Popular Games",
    href: "/casino/popular", // Assuming a route for popular or handled by filter on main
    description: "See what games are trending among our players.",
  },
]

export function NavigationMenu() {
  const { isAuthenticated, user } = useAuth();

  return (
    <ShadcnNavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Getting started</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <a
                    className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                    href="/"
                  >
                    <Rocket className="h-6 w-6" />
                    <div className="mb-2 mt-4 text-lg font-medium">
                      YourCasinoName
                    </div>
                    <p className="text-sm leading-tight text-muted-foreground">
                      The ultimate online gaming experience. Explore a universe of games.
                    </p>
                  </a>
                </NavigationMenuLink>
              </li>
              <ListItem href="/docs" title="Introduction">
                Learn about our platform and how to get started.
              </ListItem>
              <ListItem href="/promotions" title="Promotions">
                Check out the latest bonuses and offers.
              </ListItem>
              <ListItem href="/support/faq" title="FAQ">
                Find answers to frequently asked questions.
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Casino Games</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
              {components.map((component) => (
                <ListItem
                  key={component.title}
                  title={component.title}
                  href={component.href}
                >
                  {component.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link to="/sports" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Sports
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
         {isAuthenticated && user && user.role === 'admin' && (
           <NavigationMenuItem>
            <Link to="/admin/dashboard" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Admin
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
         )}
      </NavigationMenuList>
    </ShadcnNavigationMenu>
  )
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"
