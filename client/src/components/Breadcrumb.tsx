import { Link } from "wouter";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center gap-2 text-sm ${className}`}>
      {/* Home icon */}
      <Link href="/">
        <a className="text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1">
          <Home className="h-4 w-4" />
        </a>
      </Link>
      
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        
        return (
          <div key={index} className="flex items-center gap-2">
            <ChevronRight className="h-4 w-4 text-slate-500" />
            {item.href && !isLast ? (
              <Link href={item.href}>
                <a className="text-slate-400 hover:text-slate-200 transition-colors">
                  {item.label}
                </a>
              </Link>
            ) : (
              <span className={isLast ? "text-slate-200 font-medium" : "text-slate-400"}>
                {item.label}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}
