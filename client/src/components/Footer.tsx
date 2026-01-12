import { Link } from "wouter";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="font-semibold mb-3">About SASS-E</h3>
            <p className="text-sm text-muted-foreground">
              Your intelligent AI assistant for productivity, wellness, financial management, and learning.
            </p>
          </div>

          {/* Features */}
          <div>
            <h3 className="font-semibold mb-3">Features</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/money" className="hover:text-foreground transition-colors">
                  Money Hub
                </Link>
              </li>
              <li>
                <Link href="/wellness" className="hover:text-foreground transition-colors">
                  Wellness Hub
                </Link>
              </li>
              <li>
                <Link href="/learning" className="hover:text-foreground transition-colors">
                  Learning Hub
                </Link>
              </li>
              <li>
                <Link href="/assistant" className="hover:text-foreground transition-colors">
                  Voice Assistant
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-3">Resources</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/money-demo" className="hover:text-foreground transition-colors">
                  Money Demo
                </Link>
              </li>
              <li>
                <Link href="/wellness-demo" className="hover:text-foreground transition-colors">
                  Wellness Demo
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-3">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/terms" className="hover:text-foreground transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>© {currentYear} SASS-E. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
