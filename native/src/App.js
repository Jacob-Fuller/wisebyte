import React, { useEffect, useRef, useState } from "react";
import { View, Text, ScrollView, Modal } from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import * as Store from "./storage";
import * as E from "./engine";
import { ui, subscribe, goTab } from "./bus";
import { Auth } from "./auth";
import Purchases from "./purchases";
import * as Notify from "./notify";
import { C, F } from "./theme";
import { Icon } from "./components/Icon";
import { Tap } from "./components/ui";
import TempleScreen from "./screens/TempleScreen";
import LibraryScreen, { InnerScreen } from "./screens/LibraryScreen";
import ArenaScreen from "./screens/ArenaScreen";
import AccountScreen from "./screens/AccountScreen";
import ScrollScreen from "./screens/ScrollScreen";
import Player from "./Player";
import Paywall from "./Paywall";
import Sheets from "./Sheets";

SplashScreen.preventAutoHideAsync().catch(() => {});

const FONTS = {
  "Cormorant-500": require("../assets/fonts/Cormorant-500.ttf"), "Cormorant-600": require("../assets/fonts/Cormorant-600.ttf"), "Cormorant-700": require("../assets/fonts/Cormorant-700.ttf"),
  "CormorantItalic-500": require("../assets/fonts/CormorantItalic-500.ttf"), "CormorantItalic-600": require("../assets/fonts/CormorantItalic-600.ttf"),
  "Figtree-400": require("../assets/fonts/Figtree-400.ttf"), "Figtree-500": require("../assets/fonts/Figtree-500.ttf"), "Figtree-600": require("../assets/fonts/Figtree-600.ttf"),
  "Figtree-700": require("../assets/fonts/Figtree-700.ttf"), "Figtree-800": require("../assets/fonts/Figtree-800.ttf"),
  "Mono-400": require("../assets/fonts/Mono-400.ttf"), "Mono-700": require("../assets/fonts/Mono-700.ttf"), Greek: require("../assets/fonts/Greek.ttf"),
};

const TABS = [["today", "Temple", "column"], ["library", "Library", "library"], ["arena", "Arena", "trophy"], ["scroll", "Wisebyte Scroll", "scroll"], ["me", "Account", "user"]];

class Boundary extends React.Component {
  state = { err: null };
  static getDerivedStateFromError(err) { return { err }; }
  render() {
    if (!this.state.err) return this.props.children;
    return (
      <View style={{ flex: 1, backgroundColor: C.ground, padding: 24, justifyContent: "center", gap: 12 }}>
        <Text style={{ color: C.ink, fontSize: 22, fontWeight: "600" }}>Something went wrong</Text>
        <Text style={{ color: C.ink2, fontSize: 14 }}>{String(this.state.err && (this.state.err.stack || this.state.err.message) || this.state.err).slice(0, 1200)}</Text>
        <Tap onPress={() => this.setState({ err: null })} style={{ alignSelf: "flex-start", paddingVertical: 12, paddingHorizontal: 18, borderRadius: 14, backgroundColor: C.accent }}>
          <Text style={{ color: C.accentInk, fontWeight: "700" }}>Try again</Text>
        </Tap>
      </View>
    );
  }
}

function TabBar() {
  const insets = useSafeAreaInsets();
  const cur = ui.tab === "inner" ? "library" : ui.tab;
  return (
    <View style={{ flexDirection: "row", backgroundColor: C.surface, borderTopWidth: 1, borderTopColor: C.line, paddingBottom: insets.bottom }}>
      {TABS.map(([k, n, ic]) => {
        const on = cur === k, col = on ? C.accent : C.ink2;
        return (
          <Tap key={k} onPress={() => goTab(k)} accessibilityLabel={n} style={{ flex: 1, alignItems: "center", gap: 3, paddingTop: 10, paddingBottom: 11, paddingHorizontal: 2 }}>
            {on ? <View style={{ position: "absolute", top: 0, left: "28%", right: "28%", height: 3, borderBottomLeftRadius: 3, borderBottomRightRadius: 3, backgroundColor: col }} /> : null}
            <Icon name={ic} size={22} color={col} />
            <Text numberOfLines={2} style={{ fontFamily: F.body6, fontSize: 11.5, lineHeight: 13, color: col, textAlign: "center" }}>{n}</Text>
          </Tap>
        );
      })}
    </View>
  );
}

function Screen() {
  const insets = useSafeAreaInsets();
  const ref = useRef(null);
  useEffect(() => { if (ref.current) ref.current.scrollTo({ y: 0, animated: false }); }, [ui.scrollTo0]);
  const Body = { today: TempleScreen, library: LibraryScreen, inner: InnerScreen, arena: ArenaScreen, me: AccountScreen }[ui.tab] || TempleScreen;
  return (
    <ScrollView ref={ref} style={{ flex: 1 }} keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingTop: insets.top + 14, paddingBottom: 28, paddingHorizontal: 16, gap: 18, maxWidth: 520, width: "100%", alignSelf: "center" }}>
      <Body />
    </ScrollView>
  );
}

function Toast() {
  if (!ui.toast) return null;
  return (
    <View pointerEvents="none" style={{ position: "absolute", left: 16, right: 16, bottom: 100, alignItems: "center" }}>
      <View style={{ backgroundColor: C.ink, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, maxWidth: 480 }}>
        <Text style={{ fontFamily: F.body6, fontSize: 14, color: C.ground, textAlign: "center" }}>{ui.toast}</Text>
      </View>
    </View>
  );
}

function Root() {
  const [, setV] = useState(0);
  useEffect(() => subscribe(v => setV(v)), []);
  const playing = !!E.player.P;
  return (
    <View style={{ flex: 1, backgroundColor: C.ground }}>
      <StatusBar style="light" />
      <View style={{ flex: 1 }}>{ui.tab === "scroll" ? <ScrollScreen /> : <Screen />}</View>
      <TabBar />
      <Sheets host="root" />
      <Modal visible={playing} animationType="slide" presentationStyle="fullScreen" onRequestClose={E.closePlayer}>
        <Boundary><View style={{ flex: 1 }}><Player /><Sheets host="player" /><Toast /></View></Boundary>
      </Modal>
      <Paywall />
      {!playing && !ui.paywall ? <Toast /> : null}
    </View>
  );
}

export default function App() {
  const [fontsOk, fontErr] = useFonts(FONTS);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    (async () => {
      await Store.loadAll();
      E.loadState();
      Notify.init();
      setReady(true);
      Purchases.init().catch(() => {});
      Auth.load().catch(() => {});
    })();
  }, []);
  const go = ready && (fontsOk || fontErr);
  useEffect(() => { if (go) SplashScreen.hideAsync().catch(() => {}); }, [go]);
  if (!go) return null;
  return (
    <SafeAreaProvider style={{ backgroundColor: C.ground }}>
      <Boundary><Root /></Boundary>
    </SafeAreaProvider>
  );
}
