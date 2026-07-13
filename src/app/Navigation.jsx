import { lazy, Suspense } from "react";
import { Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Layout from "./Layout.jsx";

const HomePage = lazy(() => import("../pages/Home/HomePage.jsx"));
const MoviePage = lazy(() => import("../pages/Movie/MoviePage.jsx"));
const SeriesPage = lazy(() => import("../pages/Series/SeriesPage.jsx"));

const withSuspense = (Component) => (props) => (
  <Suspense fallback={<Text>Loading...</Text>}>
    <Component {...props} />
  </Suspense>
);

const HomeScreen = withSuspense(HomePage);
const MovieScreen = withSuspense(MoviePage);
const SeriesScreen = withSuspense(SeriesPage);

const Stack = createNativeStackNavigator();

// Wraps every screen with the persistent Layout chrome (header, search bar,
// video player, settings modal, etc.) — mirrors the old web <Outlet />
// hierarchy where Layout was the parent route and pages were children.
function withLayout(ScreenComponent) {
  return function WrappedScreen(props) {
    return (
      <Layout>
        <ScreenComponent {...props} />
      </Layout>
    );
  };
}

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Home" component={withLayout(HomeScreen)} />
        <Stack.Screen name="Movie" component={withLayout(MovieScreen)} />
        <Stack.Screen name="Series" component={withLayout(SeriesScreen)} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
