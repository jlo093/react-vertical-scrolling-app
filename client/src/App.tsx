import { Switch, Route, useLocation } from "wouter";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
import Suggest from "@/pages/Suggest";
import VideoSubmissionForm from "@/pages/VideoSubmissionForm";
import BottomNav from "@/components/BottomNav";

function App() {
  const [location] = useLocation();

  return (
    <>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/profile" component={Profile} />
        <Route path="/settings" component={Settings} />
        <Route path="/suggest" component={Suggest} />
        <Route path="/vsf" component={VideoSubmissionForm} />
      </Switch>
      <BottomNav currentPath={location} />
    </>
  );
}

export default App;