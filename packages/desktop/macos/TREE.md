# TREE

```text
[docs](../../../docs/README.md) — product spec (00–12), in repo-level docs/
├── Omni/
│   ├── App/
│   │   ├── Battery/
│   │   │   └── [BatteryViewModel.swift](./Omni/App/Battery/BatteryViewModel.swift)
│   │   ├── Clipboard/
│   │   │   └── [ClipboardViewModel.swift](./Omni/App/Clipboard/ClipboardViewModel.swift)
│   │   ├── Clock/
│   │   │   ├── [ClockViewModel.swift](./Omni/App/Clock/ClockViewModel.swift)
│   │   │   ├── [PomodoroViewModel.swift](./Omni/App/Clock/PomodoroViewModel.swift)
│   │   │   ├── [StopwatchViewModel.swift](./Omni/App/Clock/StopwatchViewModel.swift)
│   │   │   ├── [TimerViewModel.swift](./Omni/App/Clock/TimerViewModel.swift)
│   │   │   └── [WorldClockViewModel.swift](./Omni/App/Clock/WorldClockViewModel.swift)
│   │   ├── Front/
│   │   │   └── [AppsViewModel.swift](./Omni/App/Front/AppsViewModel.swift)
│   │   ├── Homebrew/
│   │   │   └── [HomebrewViewModel.swift](./Omni/App/Homebrew/HomebrewViewModel.swift)
│   │   ├── IP/
│   │   │   └── [IPViewModel.swift](./Omni/App/IP/IPViewModel.swift)
│   │   ├── Memory/
│   │   │   ├── [MemoryViewModel+MenuBar.swift](./Omni/App/Memory/MemoryViewModel+MenuBar.swift)
│   │   │   └── [MemoryViewModel.swift](./Omni/App/Memory/MemoryViewModel.swift)
│   │   ├── Network/
│   │   │   └── [NetworkViewModel.swift](./Omni/App/Network/NetworkViewModel.swift)
│   │   ├── Ports/
│   │   │   └── [PortsViewModel.swift](./Omni/App/Ports/PortsViewModel.swift)
│   │   ├── Shared/
│   │   │   ├── [AppViewModels.swift](./Omni/App/Shared/AppViewModels.swift)
│   │   │   ├── [DashboardRoute.swift](./Omni/App/Shared/DashboardRoute.swift)
│   │   │   ├── [DashboardRouter.swift](./Omni/App/Shared/DashboardRouter.swift)
│   │   │   ├── [DashboardSidebar.swift](./Omni/App/Shared/DashboardSidebar.swift)
│   │   │   ├── [LaunchAtLogin.swift](./Omni/App/Shared/LaunchAtLogin.swift)
│   │   │   ├── [MacOSXApp.swift](./Omni/App/Shared/MacOSXApp.swift)
│   │   │   ├── [MenuBarIcon.swift](./Omni/App/Shared/MenuBarIcon.swift)
│   │   │   ├── [MenuBarItemValue.swift](./Omni/App/Shared/MenuBarItemValue.swift)
│   │   │   ├── [MenuBarPanelPositioner.swift](./Omni/App/Shared/MenuBarPanelPositioner.swift)
│   │   │   ├── [SurfaceVisibilityMonitor.swift](./Omni/App/Shared/SurfaceVisibilityMonitor.swift)
│   │   │   └── [WindowPresenter.swift](./Omni/App/Shared/WindowPresenter.swift)
│   │   └── Workspaces/
│   │       └── [WorkspacesViewModel.swift](./Omni/App/Workspaces/WorkspacesViewModel.swift)
│   ├── Resources/
│   │   └── Assets.xcassets/
│   │       ├── AppIcon.appiconset/
│   │       │   ├── [Contents.json](./Omni/Resources/Assets.xcassets/AppIcon.appiconset/Contents.json)
│   │       │   ├── [icon_128x128.png](./Omni/Resources/Assets.xcassets/AppIcon.appiconset/icon_128x128.png)
│   │       │   ├── [icon_128x128@2x.png](./Omni/Resources/Assets.xcassets/AppIcon.appiconset/icon_128x128@2x.png)
│   │       │   ├── [icon_16x16.png](./Omni/Resources/Assets.xcassets/AppIcon.appiconset/icon_16x16.png)
│   │       │   ├── [icon_16x16@2x.png](./Omni/Resources/Assets.xcassets/AppIcon.appiconset/icon_16x16@2x.png)
│   │       │   ├── [icon_256x256.png](./Omni/Resources/Assets.xcassets/AppIcon.appiconset/icon_256x256.png)
│   │       │   ├── [icon_256x256@2x.png](./Omni/Resources/Assets.xcassets/AppIcon.appiconset/icon_256x256@2x.png)
│   │       │   ├── [icon_32x32.png](./Omni/Resources/Assets.xcassets/AppIcon.appiconset/icon_32x32.png)
│   │       │   ├── [icon_32x32@2x.png](./Omni/Resources/Assets.xcassets/AppIcon.appiconset/icon_32x32@2x.png)
│   │       │   ├── [icon_512x512.png](./Omni/Resources/Assets.xcassets/AppIcon.appiconset/icon_512x512.png)
│   │       │   └── [icon_512x512@2x.png](./Omni/Resources/Assets.xcassets/AppIcon.appiconset/icon_512x512@2x.png)
│   │       └── [Contents.json](./Omni/Resources/Assets.xcassets/Contents.json)
│   ├── Services/
│   │   ├── Battery/
│   │   │   └── [BatteryMonitor.swift](./Omni/Services/Battery/BatteryMonitor.swift)
│   │   ├── Clipboard/
│   │   │   ├── [ClipboardMonitor.swift](./Omni/Services/Clipboard/ClipboardMonitor.swift)
│   │   │   └── [PasteboardManager.swift](./Omni/Services/Clipboard/PasteboardManager.swift)
│   │   ├── Clock/
│   │   │   ├── [Chime.swift](./Omni/Services/Clock/Chime.swift)
│   │   │   └── [OpenMeteoWeatherService.swift](./Omni/Services/Clock/OpenMeteoWeatherService.swift)
│   │   ├── IP/
│   │   │   └── [IPLookupService.swift](./Omni/Services/IP/IPLookupService.swift)
│   │   ├── Memory/
│   │   │   ├── [CPUMonitor.swift](./Omni/Services/Memory/CPUMonitor.swift)
│   │   │   ├── [DiskMonitor.swift](./Omni/Services/Memory/DiskMonitor.swift)
│   │   │   ├── [MemoryMonitor.swift](./Omni/Services/Memory/MemoryMonitor.swift)
│   │   │   ├── [MemoryPressureMonitor.swift](./Omni/Services/Memory/MemoryPressureMonitor.swift)
│   │   │   ├── [SwapMonitor.swift](./Omni/Services/Memory/SwapMonitor.swift)
│   │   │   └── [SystemInfoMonitor.swift](./Omni/Services/Memory/SystemInfoMonitor.swift)
│   │   ├── Network/
│   │   │   ├── [IOKitNetworkInterfaceClassifier.swift](./Omni/Services/Network/IOKitNetworkInterfaceClassifier.swift)
│   │   │   └── [NetworkMonitor.swift](./Omni/Services/Network/NetworkMonitor.swift)
│   │   ├── Shared/
│   │   │   └── [MonitorError.swift](./Omni/Services/Shared/MonitorError.swift)
│   │   └── Workspaces/
│   │       ├── [AccessibilityManager.swift](./Omni/Services/Workspaces/AccessibilityManager.swift)
│   │       ├── [ApplicationLauncher.swift](./Omni/Services/Workspaces/ApplicationLauncher.swift)
│   │       ├── [CoreGraphicsWindowLister.swift](./Omni/Services/Workspaces/CoreGraphicsWindowLister.swift)
│   │       ├── [ScreenManager.swift](./Omni/Services/Workspaces/ScreenManager.swift)
│   │       ├── [WindowArranger.swift](./Omni/Services/Workspaces/WindowArranger.swift)
│   │       ├── [WorkspaceCaptureService.swift](./Omni/Services/Workspaces/WorkspaceCaptureService.swift)
│   │       └── [WorkspaceRestoreService.swift](./Omni/Services/Workspaces/WorkspaceRestoreService.swift)
│   ├── Views/
│   │   ├── Apps/
│   │   │   └── [AppsView.swift](./Omni/Views/Apps/AppsView.swift)
│   │   ├── Battery/
│   │   │   └── [BatteryView.swift](./Omni/Views/Battery/BatteryView.swift)
│   │   ├── Clipboard/
│   │   │   ├── [ClipboardItemList.swift](./Omni/Views/Clipboard/ClipboardItemList.swift)
│   │   │   ├── [ClipboardListPane.swift](./Omni/Views/Clipboard/ClipboardListPane.swift)
│   │   │   ├── [ClipboardSidebarGroup.swift](./Omni/Views/Clipboard/ClipboardSidebarGroup.swift)
│   │   │   └── [ClipboardView.swift](./Omni/Views/Clipboard/ClipboardView.swift)
│   │   ├── Clock/
│   │   │   ├── [ClockFaceSizing.swift](./Omni/Views/Clock/ClockFaceSizing.swift)
│   │   │   ├── [ClockRing.swift](./Omni/Views/Clock/ClockRing.swift)
│   │   │   ├── [ClockSidebarGroup.swift](./Omni/Views/Clock/ClockSidebarGroup.swift)
│   │   │   ├── [ClockView.swift](./Omni/Views/Clock/ClockView.swift)
│   │   │   ├── [PomodoroView.swift](./Omni/Views/Clock/PomodoroView.swift)
│   │   │   ├── [StopwatchView.swift](./Omni/Views/Clock/StopwatchView.swift)
│   │   │   ├── [TimerView.swift](./Omni/Views/Clock/TimerView.swift)
│   │   │   ├── [WatchfaceView.swift](./Omni/Views/Clock/WatchfaceView.swift)
│   │   │   └── [WorldClockView.swift](./Omni/Views/Clock/WorldClockView.swift)
│   │   ├── Front/
│   │   │   ├── [AppRow.swift](./Omni/Views/Front/AppRow.swift)
│   │   │   ├── [AppsListView.swift](./Omni/Views/Front/AppsListView.swift)
│   │   │   └── [RunningAppsSectionView.swift](./Omni/Views/Front/RunningAppsSectionView.swift)
│   │   ├── Homebrew/
│   │   │   ├── [ApplicationsSidebarGroup.swift](./Omni/Views/Homebrew/ApplicationsSidebarGroup.swift)
│   │   │   ├── [AppTile.swift](./Omni/Views/Homebrew/AppTile.swift)
│   │   │   ├── [BrewAppRow.swift](./Omni/Views/Homebrew/BrewAppRow.swift)
│   │   │   ├── [BrewAppsView.swift](./Omni/Views/Homebrew/BrewAppsView.swift)
│   │   │   ├── [DiscoverView.swift](./Omni/Views/Homebrew/DiscoverView.swift)
│   │   │   ├── [HomebrewMissingView.swift](./Omni/Views/Homebrew/HomebrewMissingView.swift)
│   │   │   ├── [HomebrewView.swift](./Omni/Views/Homebrew/HomebrewView.swift)
│   │   │   ├── [InstalledView.swift](./Omni/Views/Homebrew/InstalledView.swift)
│   │   │   ├── [PackageDetailView.swift](./Omni/Views/Homebrew/PackageDetailView.swift)
│   │   │   ├── [PackageRow.swift](./Omni/Views/Homebrew/PackageRow.swift)
│   │   │   ├── [ServicesView.swift](./Omni/Views/Homebrew/ServicesView.swift)
│   │   │   └── [UpdatesView.swift](./Omni/Views/Homebrew/UpdatesView.swift)
│   │   ├── IP/
│   │   │   ├── [InfoRow.swift](./Omni/Views/IP/InfoRow.swift)
│   │   │   ├── [IPDetailsView.swift](./Omni/Views/IP/IPDetailsView.swift)
│   │   │   ├── [IPDNSLookupView.swift](./Omni/Views/IP/IPDNSLookupView.swift)
│   │   │   ├── [IPView.swift](./Omni/Views/IP/IPView.swift)
│   │   │   └── [JSONText.swift](./Omni/Views/IP/JSONText.swift)
│   │   ├── Memory/
│   │   │   ├── [CPUView.swift](./Omni/Views/Memory/CPUView.swift)
│   │   │   ├── [DiskView.swift](./Omni/Views/Memory/DiskView.swift)
│   │   │   ├── [MemoryView.swift](./Omni/Views/Memory/MemoryView.swift)
│   │   │   ├── [SwapView.swift](./Omni/Views/Memory/SwapView.swift)
│   │   │   └── [SystemInfoView.swift](./Omni/Views/Memory/SystemInfoView.swift)
│   │   ├── Network/
│   │   │   ├── [NetworkView.swift](./Omni/Views/Network/NetworkView.swift)
│   │   │   └── [TrafficView.swift](./Omni/Views/Network/TrafficView.swift)
│   │   ├── Ports/
│   │   │   ├── [PortListView.swift](./Omni/Views/Ports/PortListView.swift)
│   │   │   ├── [PortRow.swift](./Omni/Views/Ports/PortRow.swift)
│   │   │   └── [PortsView.swift](./Omni/Views/Ports/PortsView.swift)
│   │   ├── Resources/
│   │   │   ├── [OverviewView.swift](./Omni/Views/Resources/OverviewView.swift)
│   │   │   └── [ResourcesView.swift](./Omni/Views/Resources/ResourcesView.swift)
│   │   ├── Shared/
│   │   │   ├── DesignSystem/
│   │   │   │   ├── [CapsuleBadge.swift](./Omni/Views/Shared/DesignSystem/CapsuleBadge.swift)
│   │   │   │   ├── [ChipButton.swift](./Omni/Views/Shared/DesignSystem/ChipButton.swift)
│   │   │   │   ├── [CircleIconButton.swift](./Omni/Views/Shared/DesignSystem/CircleIconButton.swift)
│   │   │   │   ├── [Motion.swift](./Omni/Views/Shared/DesignSystem/Motion.swift)
│   │   │   │   ├── [Palette.swift](./Omni/Views/Shared/DesignSystem/Palette.swift)
│   │   │   │   ├── [Radius.swift](./Omni/Views/Shared/DesignSystem/Radius.swift)
│   │   │   │   ├── [SearchField.swift](./Omni/Views/Shared/DesignSystem/SearchField.swift)
│   │   │   │   ├── [Spacing.swift](./Omni/Views/Shared/DesignSystem/Spacing.swift)
│   │   │   │   ├── [SurfaceMetrics.swift](./Omni/Views/Shared/DesignSystem/SurfaceMetrics.swift)
│   │   │   │   └── [Typography.swift](./Omni/Views/Shared/DesignSystem/Typography.swift)
│   │   │   ├── [ContentLayout.swift](./Omni/Views/Shared/ContentLayout.swift)
│   │   │   ├── [DashboardView.swift](./Omni/Views/Shared/DashboardView.swift)
│   │   │   ├── [MenuBarView.swift](./Omni/Views/Shared/MenuBarView.swift)
│   │   │   ├── [ResourceMeter.swift](./Omni/Views/Shared/ResourceMeter.swift)
│   │   │   ├── [SectionCard.swift](./Omni/Views/Shared/SectionCard.swift)
│   │   │   ├── [SectionGrid.swift](./Omni/Views/Shared/SectionGrid.swift)
│   │   │   ├── [SettingsView.swift](./Omni/Views/Shared/SettingsView.swift)
│   │   │   ├── [SurfaceLayout.swift](./Omni/Views/Shared/SurfaceLayout.swift)
│   │   │   ├── [UnavailableView.swift](./Omni/Views/Shared/UnavailableView.swift)
│   │   │   ├── [UsageThresholdColor.swift](./Omni/Views/Shared/UsageThresholdColor.swift)
│   │   │   └── [WindowIdentifierTag.swift](./Omni/Views/Shared/WindowIdentifierTag.swift)
│   │   └── Workspaces/
│   │       ├── [WorkspaceRow.swift](./Omni/Views/Workspaces/WorkspaceRow.swift)
│   │       └── [WorkspacesView.swift](./Omni/Views/Workspaces/WorkspacesView.swift)
│   ├── [Info.plist](./Omni/Info.plist)
│   └── [Omni.entitlements](./Omni/Omni.entitlements)
├── Omni.xcodeproj/  (generated by xcodegen)
├── OmniCore/
│   ├── Models/
│   │   ├── Battery/
│   │   │   └── [BatteryInfo.swift](./OmniCore/Models/Battery/BatteryInfo.swift)
│   │   ├── Clipboard/
│   │   │   ├── [ClipboardItem.swift](./OmniCore/Models/Clipboard/ClipboardItem.swift)
│   │   │   └── [ClipboardStore.swift](./OmniCore/Models/Clipboard/ClipboardStore.swift)
│   │   ├── Clock/
│   │   │   ├── [ClockCity.swift](./OmniCore/Models/Clock/ClockCity.swift)
│   │   │   └── [WeatherSample.swift](./OmniCore/Models/Clock/WeatherSample.swift)
│   │   ├── Front/
│   │   │   └── [RunningAppInfo.swift](./OmniCore/Models/Front/RunningAppInfo.swift)
│   │   ├── Homebrew/
│   │   │   ├── [BrewError.swift](./OmniCore/Models/Homebrew/BrewError.swift)
│   │   │   ├── [BrewServiceInfo.swift](./OmniCore/Models/Homebrew/BrewServiceInfo.swift)
│   │   │   ├── [InstalledApp.swift](./OmniCore/Models/Homebrew/InstalledApp.swift)
│   │   │   ├── [Package.swift](./OmniCore/Models/Homebrew/Package.swift)
│   │   │   ├── [PackageStatus.swift](./OmniCore/Models/Homebrew/PackageStatus.swift)
│   │   │   └── [PackageType.swift](./OmniCore/Models/Homebrew/PackageType.swift)
│   │   ├── IP/
│   │   │   ├── [DNSResponse.swift](./OmniCore/Models/IP/DNSResponse.swift)
│   │   │   └── [IPInfo.swift](./OmniCore/Models/IP/IPInfo.swift)
│   │   ├── Memory/
│   │   │   ├── [CPUStats.swift](./OmniCore/Models/Memory/CPUStats.swift)
│   │   │   ├── [DiskStats.swift](./OmniCore/Models/Memory/DiskStats.swift)
│   │   │   ├── [MemoryStats.swift](./OmniCore/Models/Memory/MemoryStats.swift)
│   │   │   ├── [SwapStats.swift](./OmniCore/Models/Memory/SwapStats.swift)
│   │   │   └── [SystemInfo.swift](./OmniCore/Models/Memory/SystemInfo.swift)
│   │   ├── Network/
│   │   │   ├── [NetworkSnapshots.swift](./OmniCore/Models/Network/NetworkSnapshots.swift)
│   │   │   └── [NetworkStats.swift](./OmniCore/Models/Network/NetworkStats.swift)
│   │   ├── Ports/
│   │   │   ├── [NetworkEndpoint.swift](./OmniCore/Models/Ports/NetworkEndpoint.swift)
│   │   │   └── [PortInfo.swift](./OmniCore/Models/Ports/PortInfo.swift)
│   │   ├── Shared/
│   │   │   ├── [MenuBarDisplay.swift](./OmniCore/Models/Shared/MenuBarDisplay.swift)
│   │   │   ├── [MenuBarMetric.swift](./OmniCore/Models/Shared/MenuBarMetric.swift)
│   │   │   ├── [MenuBarMetrics.swift](./OmniCore/Models/Shared/MenuBarMetrics.swift)
│   │   │   ├── [SurfaceSection.swift](./OmniCore/Models/Shared/SurfaceSection.swift)
│   │   │   └── [UsageThreshold.swift](./OmniCore/Models/Shared/UsageThreshold.swift)
│   │   └── Workspaces/
│   │       ├── [NormalizedRect.swift](./OmniCore/Models/Workspaces/NormalizedRect.swift)
│   │       ├── [ScreenInfo.swift](./OmniCore/Models/Workspaces/ScreenInfo.swift)
│   │       ├── [Workspace.swift](./OmniCore/Models/Workspaces/Workspace.swift)
│   │       └── [WorkspaceWindow.swift](./OmniCore/Models/Workspaces/WorkspaceWindow.swift)
│   ├── Services/
│   │   ├── Applications/
│   │   │   └── [AppCatalog.swift](./OmniCore/Services/Applications/AppCatalog.swift)
│   │   ├── Battery/
│   │   │   └── [BatteryInfoParsing.swift](./OmniCore/Services/Battery/BatteryInfoParsing.swift)
│   │   ├── Clock/
│   │   │   ├── [OpenMeteoParser.swift](./OmniCore/Services/Clock/OpenMeteoParser.swift)
│   │   │   └── [WeatherProviding.swift](./OmniCore/Services/Clock/WeatherProviding.swift)
│   │   ├── Front/
│   │   │   ├── [RunningAppProviding.swift](./OmniCore/Services/Front/RunningAppProviding.swift)
│   │   │   └── [RunningAppsDiscoveryService.swift](./OmniCore/Services/Front/RunningAppsDiscoveryService.swift)
│   │   ├── Homebrew/
│   │   │   ├── [BrewClient.swift](./OmniCore/Services/Homebrew/BrewClient.swift)
│   │   │   ├── [BrewExecutable.swift](./OmniCore/Services/Homebrew/BrewExecutable.swift)
│   │   │   ├── [BrewParser.swift](./OmniCore/Services/Homebrew/BrewParser.swift)
│   │   │   ├── [BrewService.swift](./OmniCore/Services/Homebrew/BrewService.swift)
│   │   │   ├── [HomebrewService.swift](./OmniCore/Services/Homebrew/HomebrewService.swift)
│   │   │   ├── [MockBrewClient.swift](./OmniCore/Services/Homebrew/MockBrewClient.swift)
│   │   │   ├── [ProcessRunner.swift](./OmniCore/Services/Homebrew/ProcessRunner.swift)
│   │   │   └── [SystemBrewClient.swift](./OmniCore/Services/Homebrew/SystemBrewClient.swift)
│   │   ├── IP/
│   │   │   ├── [IPInfoParsing.swift](./OmniCore/Services/IP/IPInfoParsing.swift)
│   │   │   └── [IPLookupServicing.swift](./OmniCore/Services/IP/IPLookupServicing.swift)
│   │   ├── Network/
│   │   │   └── [NetworkInterfaceClassifying.swift](./OmniCore/Services/Network/NetworkInterfaceClassifying.swift)
│   │   ├── Ports/
│   │   │   ├── [LsofParser.swift](./OmniCore/Services/Ports/LsofParser.swift)
│   │   │   ├── [LsofPortDiscoveryService.swift](./OmniCore/Services/Ports/LsofPortDiscoveryService.swift)
│   │   │   ├── [PortDiscovering.swift](./OmniCore/Services/Ports/PortDiscovering.swift)
│   │   │   ├── [ProcessTerminating.swift](./OmniCore/Services/Ports/ProcessTerminating.swift)
│   │   │   └── [SignalProcessTerminator.swift](./OmniCore/Services/Ports/SignalProcessTerminator.swift)
│   │   └── Workspaces/
│   │       ├── [CoordinateConverter.swift](./OmniCore/Services/Workspaces/CoordinateConverter.swift)
│   │       ├── [WindowListing.swift](./OmniCore/Services/Workspaces/WindowListing.swift)
│   │       ├── [WorkspaceCapturing.swift](./OmniCore/Services/Workspaces/WorkspaceCapturing.swift)
│   │       ├── [WorkspaceRestoring.swift](./OmniCore/Services/Workspaces/WorkspaceRestoring.swift)
│   │       ├── [WorkspaceStore.swift](./OmniCore/Services/Workspaces/WorkspaceStore.swift)
│   │       ├── [WorkspaceStoring.swift](./OmniCore/Services/Workspaces/WorkspaceStoring.swift)
│   │       └── [WorkspaceWindowBuilder.swift](./OmniCore/Services/Workspaces/WorkspaceWindowBuilder.swift)
│   ├── [BrewSettingsStore.swift](./OmniCore/BrewSettingsStore.swift)
│   ├── [ByteFormatter.swift](./OmniCore/ByteFormatter.swift)
│   ├── [ClockFormatter.swift](./OmniCore/ClockFormatter.swift)
│   ├── [FileManager+AppSupport.swift](./OmniCore/FileManager+AppSupport.swift)
│   └── [SettingsStore.swift](./OmniCore/SettingsStore.swift)
├── OmniTests/
│   └── Core/
│       ├── Models/
│       │   ├── Battery/
│       │   │   └── [BatteryInfoTests.swift](./OmniTests/Core/Models/Battery/BatteryInfoTests.swift)
│       │   ├── Clipboard/
│       │   │   ├── [ClipboardItemTests.swift](./OmniTests/Core/Models/Clipboard/ClipboardItemTests.swift)
│       │   │   └── [ClipboardStoreTests.swift](./OmniTests/Core/Models/Clipboard/ClipboardStoreTests.swift)
│       │   ├── Clock/
│       │   │   └── [WeatherSampleTests.swift](./OmniTests/Core/Models/Clock/WeatherSampleTests.swift)
│       │   ├── Homebrew/
│       │   │   └── [PackageModelTests.swift](./OmniTests/Core/Models/Homebrew/PackageModelTests.swift)
│       │   ├── Memory/
│       │   │   ├── [CPUStatsTests.swift](./OmniTests/Core/Models/Memory/CPUStatsTests.swift)
│       │   │   ├── [DiskStatsTests.swift](./OmniTests/Core/Models/Memory/DiskStatsTests.swift)
│       │   │   ├── [MemoryStatsTests.swift](./OmniTests/Core/Models/Memory/MemoryStatsTests.swift)
│       │   │   ├── [SwapStatsTests.swift](./OmniTests/Core/Models/Memory/SwapStatsTests.swift)
│       │   │   └── [SystemInfoTests.swift](./OmniTests/Core/Models/Memory/SystemInfoTests.swift)
│       │   ├── Network/
│       │   │   ├── [NetworkEndpointTests.swift](./OmniTests/Core/Models/Network/NetworkEndpointTests.swift)
│       │   │   └── [NetworkStatsTests.swift](./OmniTests/Core/Models/Network/NetworkStatsTests.swift)
│       │   ├── Ports/
│       │   │   └── [PortTests.swift](./OmniTests/Core/Models/Ports/PortTests.swift)
│       │   ├── Shared/
│       │   │   ├── [MenuBarDisplayTests.swift](./OmniTests/Core/Models/Shared/MenuBarDisplayTests.swift)
│       │   │   ├── [MenuBarMetricsTests.swift](./OmniTests/Core/Models/Shared/MenuBarMetricsTests.swift)
│       │   │   ├── [MenuBarMetricTests.swift](./OmniTests/Core/Models/Shared/MenuBarMetricTests.swift)
│       │   │   ├── [SurfaceSectionTests.swift](./OmniTests/Core/Models/Shared/SurfaceSectionTests.swift)
│       │   │   └── [UsageThresholdTests.swift](./OmniTests/Core/Models/Shared/UsageThresholdTests.swift)
│       │   └── Workspaces/
│       │       ├── [NormalizedRectTests.swift](./OmniTests/Core/Models/Workspaces/NormalizedRectTests.swift)
│       │       ├── [ScreenInfoTests.swift](./OmniTests/Core/Models/Workspaces/ScreenInfoTests.swift)
│       │       ├── [WorkspaceTests.swift](./OmniTests/Core/Models/Workspaces/WorkspaceTests.swift)
│       │       └── [WorkspaceWindowTests.swift](./OmniTests/Core/Models/Workspaces/WorkspaceWindowTests.swift)
│       ├── Services/
│       │   ├── Applications/
│       │   │   └── [AppCatalogTests.swift](./OmniTests/Core/Services/Applications/AppCatalogTests.swift)
│       │   ├── Battery/
│       │   │   └── [BatteryInfoParsingTests.swift](./OmniTests/Core/Services/Battery/BatteryInfoParsingTests.swift)
│       │   ├── Front/
│       │   │   └── [RunningAppsDiscoveryTests.swift](./OmniTests/Core/Services/Front/RunningAppsDiscoveryTests.swift)
│       │   ├── Homebrew/
│       │   │   ├── [BrewParserTests.swift](./OmniTests/Core/Services/Homebrew/BrewParserTests.swift)
│       │   │   └── [HomebrewServiceTests.swift](./OmniTests/Core/Services/Homebrew/HomebrewServiceTests.swift)
│       │   ├── IP/
│       │   │   └── [IPInfoParsingTests.swift](./OmniTests/Core/Services/IP/IPInfoParsingTests.swift)
│       │   ├── Ports/
│       │   │   ├── [LsofParserTests.swift](./OmniTests/Core/Services/Ports/LsofParserTests.swift)
│       │   │   └── [ProcessTerminationTests.swift](./OmniTests/Core/Services/Ports/ProcessTerminationTests.swift)
│       │   └── Workspaces/
│       │       ├── [CoordinateConverterTests.swift](./OmniTests/Core/Services/Workspaces/CoordinateConverterTests.swift)
│       │       ├── [WorkspaceStoreTests.swift](./OmniTests/Core/Services/Workspaces/WorkspaceStoreTests.swift)
│       │       └── [WorkspaceWindowBuilderTests.swift](./OmniTests/Core/Services/Workspaces/WorkspaceWindowBuilderTests.swift)
│       ├── [ByteFormatterTests.swift](./OmniTests/Core/ByteFormatterTests.swift)
│       ├── [ClockFormatterTests.swift](./OmniTests/Core/ClockFormatterTests.swift)
│       ├── [DesignSystemTests.swift](./OmniTests/Core/DesignSystemTests.swift)
│       └── [SettingsStoreTests.swift](./OmniTests/Core/SettingsStoreTests.swift)
├── [.gitignore](./.gitignore)
├── [AGENTS.md](./AGENTS.md)
├── [LICENSE](./LICENSE)
├── [Makefile](./Makefile)
├── [package.json](./package.json)
├── [project.yml](./project.yml)
├── [README.md](./README.md)
└── [TREE.md](./TREE.md)
```
