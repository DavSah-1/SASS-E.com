import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CurrencyProvider } from "./contexts/CurrencyContext";
import { InstallBanner } from "./components/InstallBanner";
import { TwoFactorGuard } from "./components/TwoFactorGuard";
import Home from "./pages/Home";
import VoiceAssistant from "./pages/VoiceAssistant";
import IoTDevices from "./pages/IoTDevices";

import LearningDemo from "./pages/LearningDemo";
import LanguageLearning from "./pages/LanguageLearning";
import Translation from "./pages/Translation";
import TranslateLanding from "./pages/TranslateLanding";
import TranslateDemo from "./pages/TranslateDemo";
import Profile from "./pages/Profile";
import DebtCoach from "./pages/DebtCoach";
import Budget from "./pages/Budget";
import Money from "./pages/Money";
import MoneyDemo from "./pages/MoneyDemo";
import Goals from "./pages/Goals";
import MathTutor from "./pages/MathTutor";
import MathCurriculum from "./pages/MathCurriculum";
import ScienceLab from "./pages/ScienceLab";

import SpecializedLearning from "./pages/SpecializedLearning";
import LearnFinance from "./pages/LearnFinance";
import LearnFinanceProgress from "./pages/LearnFinanceProgress";
import ArticleReader from "./pages/ArticleReader";
import Wellness from "./pages/Wellness";
import Hubs from "./pages/Hubs";
import WellnessDemo from "./pages/WellnessDemo";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Pricing from "./pages/Pricing";
import SubscriptionSuccess from "./pages/SubscriptionSuccess";
import AuthTest from "./pages/AuthTest";
import SignIn from "./pages/SignInNew";
import SignUp from "./pages/SignUp";


function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/assistant"} component={VoiceAssistant} />
      <Route path={"/devices"} component={IoTDevices} />
      <Route path={"/learning"}>{() => { window.location.href = "/hubs/learning"; return null; }}</Route>
      <Route path={"/hubs/learning/finance"} component={LearnFinance} />
      <Route path={"/hubs/learning/finance/progress"} component={LearnFinanceProgress} />
      <Route path={"/hubs/learning/finance/article/:slug"} component={ArticleReader} />
      <Route path={"/learning-demo"} component={LearningDemo} />
      <Route path={"/hubs/learning/language"} component={LanguageLearning} />
      <Route path={"/translate"} component={TranslateLanding} />
      <Route path={"/translate-app"} component={Translation} />
      <Route path={"/translate-demo"} component={TranslateDemo} />
      <Route path={"/auth-test"} component={AuthTest} />
      <Route path={"/sign-in"} component={SignIn} />
      <Route path={"/sign-up"} component={SignUp} />

      <Route path={"/hubs/learning/math"} component={MathTutor} />
      <Route path={"/hubs/learning/math/curriculum"} component={MathCurriculum} />
      <Route path={"/hubs/learning/science"} component={ScienceLab} />

      <Route path={"/hubs"} component={Hubs} />
      <Route path={"/hubs/learning"} component={SpecializedLearning} />
      <Route path={"/hubs/wellness"} component={Wellness} />
      <Route path={"/hubs/money"} component={Money} />
      <Route path={"/hubs/translate"} component={Translation} />
      <Route path={"/wellness-demo"} component={WellnessDemo} />
      <Route path={"/money-demo"} component={MoneyDemo} />
      <Route path={"/terms"} component={Terms} />
      <Route path={"/privacy"} component={Privacy} />
      <Route path={"/pricing"} component={Pricing} />
      <Route path={"/subscription/success"} component={SubscriptionSuccess} />
      <Route path={"/profile"} component={Profile} />
      {/* Redirect old routes to new hub structure */}
      <Route path={"/wellbeing"}>{() => { window.location.href = "/hubs/wellness"; return null; }}</Route>
      <Route path={"/wellness"}>{() => { window.location.href = "/hubs/wellness"; return null; }}</Route>
      <Route path={"/money"}>{() => { window.location.href = "/hubs/money"; return null; }}</Route>
      <Route path={"/translate-app"}>{() => { window.location.href = "/hubs/translate"; return null; }}</Route>
      <Route path={"/specialized-learning"}>{() => { window.location.href = "/hubs/learning"; return null; }}</Route>
      {/* Redirect old learning routes to new nested structure */}
      <Route path={"/learn-finance"}>{() => { window.location.href = "/hubs/learning/finance"; return null; }}</Route>
      <Route path={"/learn-finance/progress"}>{() => { window.location.href = "/hubs/learning/finance/progress"; return null; }}</Route>
      <Route path={"/learn-finance/article/:slug"}>{(params) => { window.location.href = `/hubs/learning/finance/article/${params.slug}`; return null; }}</Route>
      <Route path={"/math-tutor"}>{() => { window.location.href = "/hubs/learning/math"; return null; }}</Route>
      <Route path={"/math-curriculum"}>{() => { window.location.href = "/hubs/learning/math/curriculum"; return null; }}</Route>
      <Route path={"/language-learning"}>{() => { window.location.href = "/hubs/learning/language"; return null; }}</Route>
      <Route path={"/science-lab"}>{() => { window.location.href = "/hubs/learning/science"; return null; }}</Route>
      {/* Redirect old routes to Money hub with tab parameter */}
      <Route path={"/budget"}>{() => { window.location.href = "/hubs/money?tab=budget"; return null; }}</Route>
      <Route path={"/debt-coach"}>{() => { window.location.href = "/hubs/money?tab=debts"; return null; }}</Route>
      <Route path={"/goals"}>{() => { window.location.href = "/hubs/money?tab=goals"; return null; }}</Route>
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
          <CurrencyProvider>
            <Toaster />
            <InstallBanner />
            <TwoFactorGuard>
              <Router />
            </TwoFactorGuard>
          </CurrencyProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
