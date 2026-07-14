# Graph Report - .  (2026-07-14)

## Corpus Check
- 146 files · ~74,483 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 646 nodes · 1503 edges · 36 communities (27 shown, 9 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 31 edges (avg confidence: 0.75)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- App Layout & UI Shell
- Detail Screens & UI Cards
- Android Player & Native Video Bridge
- App State, Updates & Modals
- Android App Logging Backend
- Node Package Dependencies
- Media Search & Catalog Services
- User Feedback & Logs UI
- React Native Entry Configuration
- Trakt Synchronization Queue
- Sync Health & Connectivity Monitor
- Sync Performance Telemetry
- Native APK Download & Installer
- Chromecast Playback Controller
- Chromecast Options Provider
- Native Bridge Module Definition
- Video Streaming & Downloader
- Android Main Activity Setup
- Android Application Lifecycle Setup
- App Error Handling Boundary
- TypeScript Compiler Configuration
- Android Gradle Build Wrapper
- Releases Migration Scripts
- Metro Bundler Configuration
- Common Empty State Component
- GitHub Actions APK Build Workflow
- Project Documentation
- App Versioning Hooks

## God Nodes (most connected - your core abstractions)
1. `PlayerActivity` - 54 edges
2. `useSettingsContext()` - 42 edges
3. `theme` - 36 edges
4. `TraktSyncQueue` - 29 edges
5. `SyncHealthMonitor` - 23 edges
6. `SyncTelemetry` - 20 edges
7. `useAppContext()` - 18 edges
8. `useStreamActions()` - 18 edges
9. `showToast()` - 17 edges
10. `VideoPlayer()` - 17 edges

## Surprising Connections (you probably didn't know these)
- `App()` --calls--> `hydrateStorage()`  [EXTRACTED]
  App.jsx → src/services/storageService.js
- `Providers()` --references--> `react`  [EXTRACTED]
  src/app/providers.jsx → package.json
- `SourcesScreen()` --references--> `react`  [EXTRACTED]
  src/screens/settings/SourcesScreen.jsx → package.json
- `useStreamActions()` --indirect_call--> `copyMagnet()`  [INFERRED]
  src/hooks/useStreamActions.js → src/utils/streamHelpers.js
- `PlayerActivity` --references--> `CastController`  [EXTRACTED]
  android/app/src/main/java/com/com.veerverma.torrent/PlayerActivity.java → android/app/src/main/java/com/com.veerverma.torrent/CastController.java

## Import Cycles
- None detected.

## Communities (36 total, 9 thin omitted)

### Community 0 - "App Layout & UI Shell"
Cohesion: 0.06
Nodes (68): Layout(), SettingsModal, styles, VideoPlayer, ResultCard(), styles, Loader(), styles (+60 more)

### Community 1 - "Detail Screens & UI Cards"
Cohesion: 0.06
Nodes (40): ContinueWatchingCard(), styles, EpisodeCard(), styles, PosterCard(), styles, useContinueWatching(), useNavigate() (+32 more)

### Community 2 - "Android Player & Native Video Bridge"
Cohesion: 0.07
Nodes (19): Intent, Override, PlayerView, UnstableApi, WritableMap, PlayerActivity, AppCompatActivity, AudioManager (+11 more)

### Community 3 - "App State, Updates & Modals"
Cohesion: 0.08
Nodes (35): react, Providers(), styles, UpdateSection(), styles, UpdateChecker(), AppProvider(), PlayerProvider() (+27 more)

### Community 4 - "Android App Logging Backend"
Cohesion: 0.08
Nodes (15): AppLogger, Context, Intent, Override, Promise, ReactApplicationContext, ReactMethod, WritableMap (+7 more)

### Community 5 - "Node Package Dependencies"
Cohesion: 0.05
Nodes (43): dependencies, lucide-react-native, react-native, @react-native-async-storage/async-storage, @react-native-clipboard/clipboard, @react-native/new-app-screen, react-native-qrcode-svg, react-native-safe-area-context (+35 more)

### Community 6 - "Media Search & Catalog Services"
Cohesion: 0.14
Nodes (28): useCatalogContext(), useSearch(), catalogCache, fetchAddonCatalogRails(), fetchAddonManifest(), fetchCatalog(), getStoredManifests(), pruneManifests() (+20 more)

### Community 7 - "User Feedback & Logs UI"
Cohesion: 0.13
Nodes (23): showToast(), styles, LogsSection(), styles, CrossDeviceSyncIndicator(), formatRelativeTime(), styles, performInitialTraktSync() (+15 more)

### Community 8 - "React Native Entry Configuration"
Cohesion: 0.09
Nodes (17): App(), displayName, name, styles, HomePage, HomeScreen, MoviePage, MovieScreen (+9 more)

### Community 12 - "Native APK Download & Installer"
Cohesion: 0.18
Nodes (7): ApkUpdaterModule, Override, Promise, ReactApplicationContext, ReactMethod, WritableMap, ReactContextBaseJavaModule

### Community 13 - "Chromecast Playback Controller"
Cohesion: 0.26
Nodes (9): CastController, ExoPlayerHolder, Context, Override, PlayerView, UnstableApi, CastPlayer, Player (+1 more)

### Community 14 - "Chromecast Options Provider"
Cohesion: 0.39
Nodes (6): CastOptionsProvider, Context, Override, CastOptions, OptionsProvider, SessionProvider

### Community 15 - "Native Bridge Module Definition"
Cohesion: 0.39
Nodes (6): Override, ReactApplicationContext, TorrentDebridPackage, NativeModule, ReactPackage, ViewManager

### Community 16 - "Video Streaming & Downloader"
Cohesion: 0.50
Nodes (6): createM3uDownload(), openDirectDownload(), openExternalPlayer(), isAndroid(), isIOS(), isMobile()

### Community 17 - "Android Main Activity Setup"
Cohesion: 0.29
Nodes (4): MainActivity, ReactActivity, ReactActivityDelegate, String

### Community 18 - "Android Application Lifecycle Setup"
Cohesion: 0.33
Nodes (4): MainApplication, Application, ReactApplication, ReactHost

### Community 20 - "TypeScript Compiler Configuration"
Cohesion: 0.33
Nodes (5): compilerOptions, types, exclude, extends, include

### Community 21 - "Android Gradle Build Wrapper"
Cohesion: 0.83
Nodes (3): gradlew script, die(), warn()

### Community 22 - "Releases Migration Scripts"
Cohesion: 0.67
Nodes (3): main(), run(), TEMP_DIR

## Knowledge Gaps
- **109 isolated node(s):** `styles`, `displayName`, `{ getDefaultConfig, mergeConfig }`, `config`, `name` (+104 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `Node Package Dependencies` to `App State, Updates & Modals`?**
  _High betweenness centrality (0.083) - this node is a cross-community bridge._
- **Why does `react` connect `App State, Updates & Modals` to `Node Package Dependencies`?**
  _High betweenness centrality (0.083) - this node is a cross-community bridge._
- **Why does `useSettingsContext()` connect `App Layout & UI Shell` to `Detail Screens & UI Cards`, `App State, Updates & Modals`, `Media Search & Catalog Services`, `User Feedback & Logs UI`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **What connects `styles`, `displayName`, `{ getDefaultConfig, mergeConfig }` to the rest of the system?**
  _110 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App Layout & UI Shell` be split into smaller, more focused modules?**
  _Cohesion score 0.057852844107940206 - nodes in this community are weakly interconnected._
- **Should `Detail Screens & UI Cards` be split into smaller, more focused modules?**
  _Cohesion score 0.06377204884667571 - nodes in this community are weakly interconnected._
- **Should `Android Player & Native Video Bridge` be split into smaller, more focused modules?**
  _Cohesion score 0.07213114754098361 - nodes in this community are weakly interconnected._