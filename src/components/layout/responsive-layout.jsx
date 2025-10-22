import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Bell, Search, User, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import {
  NotificationBell,
  NotificationContainer,
} from "../ui/notification-system";

/**
 * Advanced Responsive Layout Component for TamanduAI
 * Handles complex responsive behavior with performance optimizations
 */

// ============================================
// LAYOUT CONFIGURATION
// ============================================

const LAYOUT_CONFIG = {
  BREAKPOINTS: {
    MOBILE: 768,
    TABLET: 1024,
    DESKTOP: 1280,
    LARGE: 1536,
  },

  SIDEBAR: {
    MOBILE_WIDTH: "100vw",
    DESKTOP_WIDTH: 280,
    COLLAPSED_WIDTH: 80,
    ANIMATION_DURATION: 300,
  },

  HEADER: {
    HEIGHT: 64,
    MOBILE_HEIGHT: 56,
  },

  CONTENT: {
    MIN_HEIGHT: "calc(100vh - 64px)",
    MOBILE_MIN_HEIGHT: "calc(100vh - 56px)",
  },
};

// ============================================
// RESPONSIVE HOOKS
// ============================================

/**
 * Hook for responsive breakpoints
 */
export const useResponsive = () => {
  const [dimensions, setDimensions] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1024,
    height: typeof window !== "undefined" ? window.innerHeight : 768,
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions(
        {
          width: window.innerWidth,
          height: window.innerHeight,
        },
        []
      ); // TODO: Add dependencies
    };

    window.addEventListener("resize", handleResize);
    /* if (loading) return <LoadingScreen />; */

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const breakpoints = useMemo(
    () => ({
      isMobile: dimensions.width < LAYOUT_CONFIG.BREAKPOINTS.MOBILE,
      isTablet:
        dimensions.width >= LAYOUT_CONFIG.BREAKPOINTS.MOBILE &&
        dimensions.width < LAYOUT_CONFIG.BREAKPOINTS.TABLET,
      isDesktop: dimensions.width >= LAYOUT_CONFIG.BREAKPOINTS.TABLET,
      isLarge: dimensions.width >= LAYOUT_CONFIG.BREAKPOINTS.LARGE,
      currentBreakpoint:
        dimensions.width < LAYOUT_CONFIG.BREAKPOINTS.MOBILE
          ? "mobile"
          : dimensions.width < LAYOUT_CONFIG.BREAKPOINTS.TABLET
            ? "tablet"
            : dimensions.width < LAYOUT_CONFIG.BREAKPOINTS.LARGE
              ? "desktop"
              : "large",
    }),
    [dimensions.width]
  );

  return { ...dimensions, ...breakpoints };
};

/**
 * Hook for sidebar state management
 */
export const useSidebar = () => {
  const { isMobile, isDesktop } = useResponsive();
  const [isOpen, setIsOpen] = useState(() => {
    // Default state based on screen size
    if (typeof window !== "undefined") {
      return window.innerWidth >= LAYOUT_CONFIG.BREAKPOINTS.TABLET;
    }
    return true;
  });
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auto-manage sidebar state based on screen size
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
      setMobileMenuOpen(false);
    } else if (isDesktop) {
      setIsOpen(true);
    }
  }, [isMobile, isDesktop]);

  const toggle = useCallback(() => {
    if (isMobile) {
      setMobileMenuOpen((prev) => !prev);
    } else {
      setIsOpen((prev) => !prev);
    }
  }, [isMobile]);

  const collapse = useCallback(() => {
    if (!isMobile) {
      setIsCollapsed(true);
      setIsOpen(true);
    }
  }, [isMobile]);

  const expand = useCallback(() => {
    setIsCollapsed(false);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  return {
    isOpen,
    isCollapsed,
    mobileMenuOpen,
    isVisible: isMobile ? mobileMenuOpen : isOpen,
    toggle,
    collapse,
    expand,
    closeMobileMenu,
  };
};

// ============================================
// LAYOUT COMPONENTS
// ============================================

/**
 * Sidebar Component with responsive behavior
 */
export const Sidebar = ({
  children,
  className,
  width = LAYOUT_CONFIG.SIDEBAR.DESKTOP_WIDTH,
  collapsedWidth = LAYOUT_CONFIG.SIDEBAR.COLLAPSED_WIDTH,
  ...props
}) => {
  const { isMobile } = useResponsive();
  const { isOpen, isCollapsed, mobileMenuOpen } = useSidebar();

  const sidebarWidth = useMemo(() => {
    if (isMobile) return LAYOUT_CONFIG.SIDEBAR.MOBILE_WIDTH;
    if (isCollapsed) return collapsedWidth;
    return width;
  }, [isMobile, isCollapsed, width, collapsedWidth]);

  if (isMobile && !mobileMenuOpen) {
    return null;
  }

  /* if (loading) return <LoadingScreen />; */

  return (
    <motion.aside
      initial={false}
      animate={{
        width: isMobile ? "100vw" : sidebarWidth,
        x: isMobile && mobileMenuOpen ? 0 : isMobile ? "-100%" : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
      className={cn(
        "bg-background border-r border-border flex flex-col",
        "fixed lg:relative z-40 h-full",
        isMobile && "shadow-xl",
        className
      )}
      style={{
        width: isMobile ? undefined : sidebarWidth,
      }}
      {...props}
    >
      <ScrollArea className="flex-1">
        <div className="p-4">{children}</div>
      </ScrollArea>
    </motion.aside>
  );
};

/**
 * Header Component with responsive behavior
 */
export const Header = ({
  children,
  className,
  height = LAYOUT_CONFIG.HEADER.HEIGHT,
  mobileHeight = LAYOUT_CONFIG.HEADER.MOBILE_HEIGHT,
  leftContent,
  rightContent,
  centerContent,
  ...props
}) => {
  const { isMobile } = useResponsive();
  const { mobileMenuOpen, toggle } = useSidebar();

  const headerHeight = isMobile ? mobileHeight : height;

  /* if (loading) return <LoadingScreen />; */

  return (
    <header
      className={cn(
        "bg-background border-b border-border sticky top-0 z-30",
        "flex items-center justify-between",
        className
      )}
      style={{ height: headerHeight }}
      {...props}
    >
      {/* Mobile menu button */}
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          className="lg:hidden"
        >
          {mobileMenuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </Button>
      )}

      {/* Left content */}
      <div className="flex items-center gap-4">{leftContent}</div>

      {/* Center content */}
      {centerContent && (
        <div className="flex-1 flex justify-center">{centerContent}</div>
      )}

      {/* Right content */}
      <div className="flex items-center gap-2">
        {rightContent}

        {/* Desktop notifications */}
        {!isMobile && <NotificationBell />}
      </div>
    </header>
  );
};

/**
 * Main Layout Component
 */
export const MainLayout = ({
  sidebar,
  header,
  children,
  className,
  contentClassName,
  ...props
}) => {
  const { isMobile } = useResponsive();
  const { isOpen, closeMobileMenu } = useSidebar();

  // Close mobile menu when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isMobile && isOpen && !e.target.closest("[data-sidebar]")) {
        closeMobileMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    /* if (loading) return <LoadingScreen />; */

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile, isOpen, closeMobileMenu]);

  /* if (loading) return <LoadingScreen />; */

  return (
    <div className={cn("flex h-screen bg-background", className)} {...props}>
      {/* Sidebar overlay for mobile */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      {sidebar && (
        <div data-sidebar>
          {typeof sidebar === "function" ? sidebar() : sidebar}
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        {header && (
          <div className="flex-shrink-0">
            {typeof header === "function" ? header() : header}
          </div>
        )}

        {/* Main content */}
        <main
          className={cn(
            "flex-1 overflow-auto",
            "max-w-full mx-auto",
            contentClassName
          )}
          style={{
            minHeight: isMobile
              ? LAYOUT_CONFIG.CONTENT.MOBILE_MIN_HEIGHT
              : LAYOUT_CONFIG.CONTENT.MIN_HEIGHT,
          }}
        >
          <div className="h-full">{children}</div>
        </main>
      </div>

      {/* Mobile notification container */}
      {isMobile && (
        <NotificationContainer position="bottom-right" maxHeight={300} />
      )}
    </div>
  );
};

/**
 * Content Area Component with responsive padding
 */
export const ContentArea = ({
  children,
  className,
  padding = true,
  maxWidth = "none",
  ...props
}) => {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  const responsivePadding = useMemo(() => {
    if (!padding) return "";

    if (isMobile) return "p-4";
    if (isTablet) return "p-6";
    return "p-8";
  }, [padding, isMobile, isTablet]);

  const responsiveMaxWidth = useMemo(() => {
    if (maxWidth === "none") return "";

    const widths = {
      sm: "max-w-sm",
      md: "max-w-md",
      lg: "max-w-lg",
      xl: "max-w-xl",
      "2xl": "max-w-2xl",
      "4xl": "max-w-4xl",
      "6xl": "max-w-6xl",
      "7xl": "max-w-7xl",
      full: "max-w-full",
    };

    return widths[maxWidth] || `max-w-${maxWidth}`;
  }, [maxWidth]);

  /* if (loading) return <LoadingScreen />; */

  return (
    <div
      className={cn(
        "w-full h-full",
        responsivePadding,
        responsiveMaxWidth,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Grid Layout Component for responsive grids
 */
export const GridLayout = ({
  children,
  cols = { default: 1, sm: 2, lg: 3, xl: 4 },
  gap = "md",
  className,
  ...props
}) => {
  const gapClasses = {
    sm: "gap-2",
    md: "gap-4",
    lg: "gap-6",
    xl: "gap-8",
  };

  const gridCols = useMemo(() => {
    const colsArray = [];

    if (cols.default) colsArray.push(`grid-cols-${cols.default}`);
    if (cols.sm) colsArray.push(`sm:grid-cols-${cols.sm}`);
    if (cols.md) colsArray.push(`md:grid-cols-${cols.md}`);
    if (cols.lg) colsArray.push(`lg:grid-cols-${cols.lg}`);
    if (cols.xl) colsArray.push(`xl:grid-cols-${cols.xl}`);

    return colsArray.join(" ");
  }, [cols]);

  /* if (loading) return <LoadingScreen />; */

  return (
    <div
      className={cn(
        "grid",
        gridCols,
        gapClasses[gap] || gapClasses.md,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Responsive Container Component
 */
export const ResponsiveContainer = ({
  children,
  className,
  fluid = false,
  ...props
}) => {
  const { isMobile } = useResponsive();

  /* if (loading) return <LoadingScreen />; */

  return (
    <div
      className={cn(
        "w-full mx-auto",
        !fluid && "max-w-7xl px-4 sm:px-6 lg:px-8",
        isMobile && "px-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// ============================================
// LAYOUT HOOKS
// ============================================

/**
 * Hook for layout state management
 */
export const useLayout = () => {
  const responsive = useResponsive();
  const sidebar = useSidebar();

  return {
    ...responsive,
    ...sidebar,
    // Computed layout properties
    sidebarWidth: responsive.isMobile
      ? 0
      : sidebar.isCollapsed
        ? LAYOUT_CONFIG.SIDEBAR.COLLAPSED_WIDTH
        : LAYOUT_CONFIG.SIDEBAR.DESKTOP_WIDTH,
    contentWidth: responsive.isMobile
      ? "100vw"
      : `calc(100vw - ${sidebar.isOpen ? LAYOUT_CONFIG.SIDEBAR.DESKTOP_WIDTH : 0}px)`,
  };
};

/**
 * Hook for responsive content sizing
 */
export const useResponsiveContent = () => {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  const contentConfig = useMemo(
    () => ({
      padding: isMobile ? "p-4" : isTablet ? "p-6" : "p-8",
      maxWidth: isMobile ? "max-w-none" : "max-w-6xl",
      spacing: isMobile ? "space-y-4" : "space-y-6",
    }),
    [isMobile, isTablet]
  );

  return contentConfig;
};

// ============================================
// EXPORT COMPONENTS
// ============================================

export default MainLayout;
