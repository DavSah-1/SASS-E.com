import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

/**
 * AnimatedTabs component with smooth sliding underline indicator
 * Provides visual feedback when switching between tabs
 */

function AnimatedTabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="animated-tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

function AnimatedTabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  const [indicatorStyle, setIndicatorStyle] = React.useState<React.CSSProperties>({});
  const listRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const updateIndicator = () => {
      if (!listRef.current) return;
      
      const activeTab = listRef.current.querySelector('[data-state="active"]') as HTMLElement;
      if (activeTab) {
        const listRect = listRef.current.getBoundingClientRect();
        const tabRect = activeTab.getBoundingClientRect();
        
        setIndicatorStyle({
          left: tabRect.left - listRect.left,
          width: tabRect.width,
        });
      }
    };

    updateIndicator();
    
    // Update on resize
    window.addEventListener('resize', updateIndicator);
    
    // Use MutationObserver to detect tab changes
    const observer = new MutationObserver(updateIndicator);
    if (listRef.current) {
      observer.observe(listRef.current, {
        attributes: true,
        subtree: true,
        attributeFilter: ['data-state'],
      });
    }

    return () => {
      window.removeEventListener('resize', updateIndicator);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="relative">
      <TabsPrimitive.List
        ref={listRef}
        data-slot="animated-tabs-list"
        className={cn(
          "relative inline-flex h-auto w-full items-center justify-center p-0",
          className
        )}
        {...props}
      />
      {/* Animated underline indicator */}
      <div
        className="absolute bottom-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300 ease-out"
        style={indicatorStyle}
      />
    </div>
  );
}

function AnimatedTabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="animated-tabs-trigger"
      className={cn(
        "relative inline-flex flex-1 items-center justify-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors",
        "text-slate-400 hover:text-slate-200",
        "data-[state=active]:text-white",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900",
        "disabled:pointer-events-none disabled:opacity-50",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  );
}

function AnimatedTabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="animated-tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  );
}

export { AnimatedTabs, AnimatedTabsList, AnimatedTabsTrigger, AnimatedTabsContent };
