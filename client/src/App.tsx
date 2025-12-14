import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import VoiceAssistant from "./pages/VoiceAssistant";
import IoTDevices from "./pages/IoTDevices";
import Learning from "./pages/Learning";
import LanguageLearning from "./pages/LanguageLearning";
import Profile from "./pages/Profile";
import DebtCoach from "./pages/DebtCoach";
import Budget from "./pages/Budget";
import Money from "./pages/Money";
import MoneyDemo from "./pages/MoneyDemo";
import Goals from "./pages/Goals";
import MathTutor from "./pages/MathTutor";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/assistant"} component={VoiceAssistant} />
      <Route path={"/devices"} component={IoTDevices} />
      <Route path={"/learning"} component={Learning} />
      <Route path={"/language-learning"} component={LanguageLearning} />
      <Route path={"/math-tutor"} component={MathTutor} />
      <Route path={"/profile"} component={Profile} />
      <Route path={"/money"} component={Money} />
      <Route path={"/money-demo"} component={MoneyDemo} />
      {/* Redirect old routes to Money page with tab parameter */}
      <Route path={"/budget"}>{() => { window.location.href = "/money?tab=budget"; return null; }}</Route>
      <Route path={"/debt-coach"}>{() => { window.location.href = "/money?tab=debts"; return null; }}</Route>
      <Route path={"/goals"}>{() => { window.location.href = "/money?tab=goals"; return null; }}</Route>
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
