import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { 
  Globe,
  Menu
} from "lucide-react";
import logoImage from "@/assets/strandly-logo.png";

const languageFlags: Record<string, string> = {
  en: "🇬🇧",
  de: "🇩🇪", 
  fr: "🇫🇷",
  es: "🇪🇸",
  pt: "🇵🇹",
  nl: "🇳🇱",
  pl: "🇵🇱",
  cs: "🇨🇿",
};

const FloatingNavigation = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const scrollToSection = (sectionId: string) => {
    // If we're not on the home page, navigate there first
    if (location.pathname !== '/') {
      navigate('/');
      // Wait for navigation to complete, then scroll
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      // We're already on home page, just scroll
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const navigateToRoute = (path: string) => {
    navigate(path);
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  const navigationItems = [
    {
      label: t("navigation.about_us"),
      href: "/about-us",
      isActive: isActiveRoute("/about-us"),
      onClick: () => navigateToRoute("/about-us")
    },
    {
      label: t("navigation.learn_more"),
      href: "/learn-more",
      isActive: isActiveRoute("/learn-more"),
      onClick: () => navigateToRoute("/learn-more")
    },
    {
      label: t("navigation.contact"),
      href: "#contact",
      onClick: () => scrollToSection("contact")
    },
    {
      label: t("navigation.blog"),
      href: "/blog",
      isActive: isActiveRoute("/blog"),
      onClick: () => navigateToRoute("/blog")
    }
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground rounded-lg shadow-lg z-50 mb-8 sm:mb-12 hidden lg:block">
        <div className="flex items-center justify-center h-12 px-3 space-x-2 md:h-16 md:px-6 md:space-x-4">
          {/* Logo */}
          <div 
            className="flex items-center space-x-2 mr-4 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigateToRoute('/')}
          >
            <img src={logoImage} alt="Strandly" className="w-8 h-8 object-contain" />
            <span className="font-display text-lg text-primary-foreground font-semibold">
              Strandly
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {navigationItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={`font-body text-primary-foreground hover:underline transition-colors ${
                  item.isActive ? 'underline' : ''
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  item.onClick();
                }}
              >
                {item.label}
              </a>
            ))}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="text-primary-foreground">
                {languageFlags[i18n.language]} <Globe className="h-[1.2rem] w-[1.2rem]" />
                <span className="sr-only">Change language</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {Object.entries(languageFlags).map(([code, flag]) => (
                <DropdownMenuItem 
                  key={code}
                  onClick={() => changeLanguage(code)}
                >
                  {flag} {code.toUpperCase()}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-primary text-primary-foreground border-b border-[#6B3F1D]/20 lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo / Brand */}
          <button
            className="flex items-center space-x-2 active:opacity-90"
            aria-label="Go to home"
            onClick={() => navigateToRoute('/')}
          >
            <img src={logoImage} alt="Strandly" className="w-8 h-8 object-contain" />
            <span className="font-display text-lg text-primary-foreground font-semibold">
              Strandly
            </span>
          </button>

          <div className="flex items-center gap-2">
            {/* Language */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="text-primary-foreground">
                  {languageFlags[i18n.language]} <Globe className="h-4 w-4" />
                  <span className="sr-only">Change language</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {Object.entries(languageFlags).map(([code, flag]) => (
                  <DropdownMenuItem 
                    key={code}
                    onClick={() => changeLanguage(code)}
                  >
                    {flag} {code.toUpperCase()}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Hamburger Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  className="bg-[#6B3F1D] text-white hover:bg-[#8B4513] focus:ring-2 focus:ring-offset-2 focus:ring-[#6B3F1D] focus:ring-offset-[#e7cfb1]"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5 text-white transition-transform duration-300" />
                </Button>
              </SheetTrigger>
              <SheetContent 
                side="right" 
                className="group bg-[#e7cfb1] border-[#6B3F1D]/20 transition-all duration-300 ease-out translate-x-full data-[state=open]:translate-x-0 data-[state=closed]:translate-x-full data-[state=open]:shadow-elegant"
              >
                <div className="mt-8 space-y-4">
                  {navigationItems.map((item, i) => (
                    <a
                      key={item.label}
                      href={item.href}
                      className="block font-body text-lg text-[#1a0f0a] hover:text-[#6B3F1D] transform transition-all duration-300 opacity-0 translate-x-3 group-data-[state=open]:opacity-100 group-data-[state=open]:translate-x-0"
                      style={{ transitionDelay: `${i * 60}ms` }}
                      onClick={(e) => {
                        e.preventDefault();
                        item.onClick();
                      }}
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </>
  );
};

export default FloatingNavigation;
