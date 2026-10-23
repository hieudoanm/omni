# TREE

```text
├── Docs/
│   ├── 00-overview/
│   │   └── [README.md](./Docs/00-overview/README.md)
│   ├── 01-requirements/
│   │   └── [README.md](./Docs/01-requirements/README.md)
│   ├── 02-features/
│   │   └── [README.md](./Docs/02-features/README.md)
│   ├── 03-user-stories/
│   │   └── [README.md](./Docs/03-user-stories/README.md)
│   ├── 04-architecture/
│   │   └── [README.md](./Docs/04-architecture/README.md)
│   ├── 05-data-model/
│   │   └── [README.md](./Docs/05-data-model/README.md)
│   ├── 06-api-specification/
│   │   └── [README.md](./Docs/06-api-specification/README.md)
│   ├── 07-ui-ux-design/
│   │   └── [README.md](./Docs/07-ui-ux-design/README.md)
│   ├── 08-tech-stack/
│   │   └── [README.md](./Docs/08-tech-stack/README.md)
│   ├── 09-testing-strategy/
│   │   └── [README.md](./Docs/09-testing-strategy/README.md)
│   ├── 10-implementation-plan/
│   │   └── [README.md](./Docs/10-implementation-plan/README.md)
│   ├── 11-deployment/
│   │   └── [README.md](./Docs/11-deployment/README.md)
│   ├── 12-operations/
│   │   └── [README.md](./Docs/12-operations/README.md)
│   ├── [00-overview.md](./Docs/00-overview.md)
│   ├── [01-requirements.md](./Docs/01-requirements.md)
│   ├── [02-features.md](./Docs/02-features.md)
│   ├── [03-user-stories.md](./Docs/03-user-stories.md)
│   ├── [04-architecture.md](./Docs/04-architecture.md)
│   ├── [05-data-model.md](./Docs/05-data-model.md)
│   ├── [06-api-specification.md](./Docs/06-api-specification.md)
│   ├── [07-ui-ux-design.md](./Docs/07-ui-ux-design.md)
│   ├── [08-tech-stack.md](./Docs/08-tech-stack.md)
│   ├── [09-testing-strategy.md](./Docs/09-testing-strategy.md)
│   ├── [10-implementation-plan.md](./Docs/10-implementation-plan.md)
│   ├── [11-deployment.md](./Docs/11-deployment.md)
│   ├── [12-operations.md](./Docs/12-operations.md)
│   └── [README.md](./Docs/README.md)
├── Resources/
│   ├── AppIcon.iconset/
│   │   ├── [AppIcon-render.swift](./Resources/AppIcon.iconset/AppIcon-render.swift)
│   │   └── [AppIcon-source.svg](./Resources/AppIcon.iconset/AppIcon-source.svg)
│   ├── [AppIcon.icns](./Resources/AppIcon.icns)
│   ├── [Info.plist](./Resources/Info.plist)
│   └── [Omni.entitlements](./Resources/Omni.entitlements)
├── Sources/
│   ├── App/
│   │   ├── Battery/
│   │   │   └── [BatteryViewModel.swift](./Sources/App/Battery/BatteryViewModel.swift)
│   │   ├── Clipboard/
│   │   │   └── [ClipboardViewModel.swift](./Sources/App/Clipboard/ClipboardViewModel.swift)
│   │   ├── Clock/
│   │   │   ├── [ClockViewModel.swift](./Sources/App/Clock/ClockViewModel.swift)
│   │   │   ├── [PomodoroViewModel.swift](./Sources/App/Clock/PomodoroViewModel.swift)
│   │   │   ├── [StopwatchViewModel.swift](./Sources/App/Clock/StopwatchViewModel.swift)
│   │   │   ├── [TimerViewModel.swift](./Sources/App/Clock/TimerViewModel.swift)
│   │   │   └── [WorldClockViewModel.swift](./Sources/App/Clock/WorldClockViewModel.swift)
│   │   ├── Front/
│   │   │   └── [AppsViewModel.swift](./Sources/App/Front/AppsViewModel.swift)
│   │   ├── Homebrew/
│   │   │   └── [HomebrewViewModel.swift](./Sources/App/Homebrew/HomebrewViewModel.swift)
│   │   ├── IP/
│   │   │   └── [IPViewModel.swift](./Sources/App/IP/IPViewModel.swift)
│   │   ├── Memory/
│   │   │   ├── [MemoryViewModel+MenuBar.swift](./Sources/App/Memory/MemoryViewModel+MenuBar.swift)
│   │   │   └── [MemoryViewModel.swift](./Sources/App/Memory/MemoryViewModel.swift)
│   │   ├── Network/
│   │   │   └── [NetworkViewModel.swift](./Sources/App/Network/NetworkViewModel.swift)
│   │   ├── Ports/
│   │   │   └── [PortsViewModel.swift](./Sources/App/Ports/PortsViewModel.swift)
│   │   ├── Shared/
│   │   │   ├── [AppViewModels.swift](./Sources/App/Shared/AppViewModels.swift)
│   │   │   ├── [DashboardRoute.swift](./Sources/App/Shared/DashboardRoute.swift)
│   │   │   ├── [DashboardRouter.swift](./Sources/App/Shared/DashboardRouter.swift)
│   │   │   ├── [DashboardSidebar.swift](./Sources/App/Shared/DashboardSidebar.swift)
│   │   │   ├── [LaunchAtLogin.swift](./Sources/App/Shared/LaunchAtLogin.swift)
│   │   │   ├── [MacOSXApp.swift](./Sources/App/Shared/MacOSXApp.swift)
│   │   │   ├── [MenuBarIcon.swift](./Sources/App/Shared/MenuBarIcon.swift)
│   │   │   ├── [MenuBarItemValue.swift](./Sources/App/Shared/MenuBarItemValue.swift)
│   │   │   ├── [MenuBarPanelPositioner.swift](./Sources/App/Shared/MenuBarPanelPositioner.swift)
│   │   │   ├── [SurfaceVisibilityMonitor.swift](./Sources/App/Shared/SurfaceVisibilityMonitor.swift)
│   │   │   └── [WindowPresenter.swift](./Sources/App/Shared/WindowPresenter.swift)
│   │   └── Workspaces/
│   │       └── [WorkspacesViewModel.swift](./Sources/App/Workspaces/WorkspacesViewModel.swift)
│   ├── Core/
│   │   ├── Models/
│   │   │   ├── Battery/
│   │   │   │   └── [BatteryInfo.swift](./Sources/Core/Models/Battery/BatteryInfo.swift)
│   │   │   ├── Clipboard/
│   │   │   │   ├── [ClipboardItem.swift](./Sources/Core/Models/Clipboard/ClipboardItem.swift)
│   │   │   │   └── [ClipboardStore.swift](./Sources/Core/Models/Clipboard/ClipboardStore.swift)
│   │   │   ├── Clock/
│   │   │   │   ├── [ClockCity.swift](./Sources/Core/Models/Clock/ClockCity.swift)
│   │   │   │   └── [WeatherSample.swift](./Sources/Core/Models/Clock/WeatherSample.swift)
│   │   │   ├── Front/
│   │   │   │   └── [RunningAppInfo.swift](./Sources/Core/Models/Front/RunningAppInfo.swift)
│   │   │   ├── Homebrew/
│   │   │   │   ├── [BrewError.swift](./Sources/Core/Models/Homebrew/BrewError.swift)
│   │   │   │   ├── [BrewServiceInfo.swift](./Sources/Core/Models/Homebrew/BrewServiceInfo.swift)
│   │   │   │   ├── [InstalledApp.swift](./Sources/Core/Models/Homebrew/InstalledApp.swift)
│   │   │   │   ├── [Package.swift](./Sources/Core/Models/Homebrew/Package.swift)
│   │   │   │   ├── [PackageStatus.swift](./Sources/Core/Models/Homebrew/PackageStatus.swift)
│   │   │   │   └── [PackageType.swift](./Sources/Core/Models/Homebrew/PackageType.swift)
│   │   │   ├── IP/
│   │   │   │   ├── [DNSResponse.swift](./Sources/Core/Models/IP/DNSResponse.swift)
│   │   │   │   └── [IPInfo.swift](./Sources/Core/Models/IP/IPInfo.swift)
│   │   │   ├── Memory/
│   │   │   │   ├── [CPUStats.swift](./Sources/Core/Models/Memory/CPUStats.swift)
│   │   │   │   ├── [DiskStats.swift](./Sources/Core/Models/Memory/DiskStats.swift)
│   │   │   │   ├── [MemoryStats.swift](./Sources/Core/Models/Memory/MemoryStats.swift)
│   │   │   │   ├── [SwapStats.swift](./Sources/Core/Models/Memory/SwapStats.swift)
│   │   │   │   └── [SystemInfo.swift](./Sources/Core/Models/Memory/SystemInfo.swift)
│   │   │   ├── Network/
│   │   │   │   ├── [NetworkSnapshots.swift](./Sources/Core/Models/Network/NetworkSnapshots.swift)
│   │   │   │   └── [NetworkStats.swift](./Sources/Core/Models/Network/NetworkStats.swift)
│   │   │   ├── Ports/
│   │   │   │   ├── [NetworkEndpoint.swift](./Sources/Core/Models/Ports/NetworkEndpoint.swift)
│   │   │   │   └── [PortInfo.swift](./Sources/Core/Models/Ports/PortInfo.swift)
│   │   │   ├── Shared/
│   │   │   │   ├── [MenuBarDisplay.swift](./Sources/Core/Models/Shared/MenuBarDisplay.swift)
│   │   │   │   ├── [MenuBarMetric.swift](./Sources/Core/Models/Shared/MenuBarMetric.swift)
│   │   │   │   ├── [MenuBarMetrics.swift](./Sources/Core/Models/Shared/MenuBarMetrics.swift)
│   │   │   │   ├── [SurfaceSection.swift](./Sources/Core/Models/Shared/SurfaceSection.swift)
│   │   │   │   └── [UsageThreshold.swift](./Sources/Core/Models/Shared/UsageThreshold.swift)
│   │   │   └── Workspaces/
│   │   │       ├── [NormalizedRect.swift](./Sources/Core/Models/Workspaces/NormalizedRect.swift)
│   │   │       ├── [ScreenInfo.swift](./Sources/Core/Models/Workspaces/ScreenInfo.swift)
│   │   │       ├── [Workspace.swift](./Sources/Core/Models/Workspaces/Workspace.swift)
│   │   │       └── [WorkspaceWindow.swift](./Sources/Core/Models/Workspaces/WorkspaceWindow.swift)
│   │   ├── Services/
│   │   │   ├── Applications/
│   │   │   │   └── [AppCatalog.swift](./Sources/Core/Services/Applications/AppCatalog.swift)
│   │   │   ├── Battery/
│   │   │   │   └── [BatteryInfoParsing.swift](./Sources/Core/Services/Battery/BatteryInfoParsing.swift)
│   │   │   ├── Clock/
│   │   │   │   ├── [OpenMeteoParser.swift](./Sources/Core/Services/Clock/OpenMeteoParser.swift)
│   │   │   │   └── [WeatherProviding.swift](./Sources/Core/Services/Clock/WeatherProviding.swift)
│   │   │   ├── Front/
│   │   │   │   ├── [RunningAppProviding.swift](./Sources/Core/Services/Front/RunningAppProviding.swift)
│   │   │   │   └── [RunningAppsDiscoveryService.swift](./Sources/Core/Services/Front/RunningAppsDiscoveryService.swift)
│   │   │   ├── Homebrew/
│   │   │   │   ├── [BrewClient.swift](./Sources/Core/Services/Homebrew/BrewClient.swift)
│   │   │   │   ├── [BrewExecutable.swift](./Sources/Core/Services/Homebrew/BrewExecutable.swift)
│   │   │   │   ├── [BrewParser.swift](./Sources/Core/Services/Homebrew/BrewParser.swift)
│   │   │   │   ├── [BrewService.swift](./Sources/Core/Services/Homebrew/BrewService.swift)
│   │   │   │   ├── [HomebrewService.swift](./Sources/Core/Services/Homebrew/HomebrewService.swift)
│   │   │   │   ├── [MockBrewClient.swift](./Sources/Core/Services/Homebrew/MockBrewClient.swift)
│   │   │   │   ├── [ProcessRunner.swift](./Sources/Core/Services/Homebrew/ProcessRunner.swift)
│   │   │   │   └── [SystemBrewClient.swift](./Sources/Core/Services/Homebrew/SystemBrewClient.swift)
│   │   │   ├── IP/
│   │   │   │   ├── [IPInfoParsing.swift](./Sources/Core/Services/IP/IPInfoParsing.swift)
│   │   │   │   └── [IPLookupServicing.swift](./Sources/Core/Services/IP/IPLookupServicing.swift)
│   │   │   ├── Network/
│   │   │   │   └── [NetworkInterfaceClassifying.swift](./Sources/Core/Services/Network/NetworkInterfaceClassifying.swift)
│   │   │   ├── Ports/
│   │   │   │   ├── [LsofParser.swift](./Sources/Core/Services/Ports/LsofParser.swift)
│   │   │   │   ├── [LsofPortDiscoveryService.swift](./Sources/Core/Services/Ports/LsofPortDiscoveryService.swift)
│   │   │   │   ├── [PortDiscovering.swift](./Sources/Core/Services/Ports/PortDiscovering.swift)
│   │   │   │   ├── [ProcessTerminating.swift](./Sources/Core/Services/Ports/ProcessTerminating.swift)
│   │   │   │   └── [SignalProcessTerminator.swift](./Sources/Core/Services/Ports/SignalProcessTerminator.swift)
│   │   │   └── Workspaces/
│   │   │       ├── [CoordinateConverter.swift](./Sources/Core/Services/Workspaces/CoordinateConverter.swift)
│   │   │       ├── [WindowListing.swift](./Sources/Core/Services/Workspaces/WindowListing.swift)
│   │   │       ├── [WorkspaceCapturing.swift](./Sources/Core/Services/Workspaces/WorkspaceCapturing.swift)
│   │   │       ├── [WorkspaceRestoring.swift](./Sources/Core/Services/Workspaces/WorkspaceRestoring.swift)
│   │   │       ├── [WorkspaceStore.swift](./Sources/Core/Services/Workspaces/WorkspaceStore.swift)
│   │   │       ├── [WorkspaceStoring.swift](./Sources/Core/Services/Workspaces/WorkspaceStoring.swift)
│   │   │       └── [WorkspaceWindowBuilder.swift](./Sources/Core/Services/Workspaces/WorkspaceWindowBuilder.swift)
│   │   ├── [BrewSettingsStore.swift](./Sources/Core/BrewSettingsStore.swift)
│   │   ├── [ByteFormatter.swift](./Sources/Core/ByteFormatter.swift)
│   │   ├── [ClockFormatter.swift](./Sources/Core/ClockFormatter.swift)
│   │   └── [SettingsStore.swift](./Sources/Core/SettingsStore.swift)
│   ├── Services/
│   │   ├── Battery/
│   │   │   └── [BatteryMonitor.swift](./Sources/Services/Battery/BatteryMonitor.swift)
│   │   ├── Clipboard/
│   │   │   ├── [ClipboardMonitor.swift](./Sources/Services/Clipboard/ClipboardMonitor.swift)
│   │   │   └── [PasteboardManager.swift](./Sources/Services/Clipboard/PasteboardManager.swift)
│   │   ├── Clock/
│   │   │   ├── [Chime.swift](./Sources/Services/Clock/Chime.swift)
│   │   │   └── [OpenMeteoWeatherService.swift](./Sources/Services/Clock/OpenMeteoWeatherService.swift)
│   │   ├── IP/
│   │   │   └── [IPLookupService.swift](./Sources/Services/IP/IPLookupService.swift)
│   │   ├── Memory/
│   │   │   ├── [CPUMonitor.swift](./Sources/Services/Memory/CPUMonitor.swift)
│   │   │   ├── [DiskMonitor.swift](./Sources/Services/Memory/DiskMonitor.swift)
│   │   │   ├── [MemoryMonitor.swift](./Sources/Services/Memory/MemoryMonitor.swift)
│   │   │   ├── [MemoryPressureMonitor.swift](./Sources/Services/Memory/MemoryPressureMonitor.swift)
│   │   │   ├── [SwapMonitor.swift](./Sources/Services/Memory/SwapMonitor.swift)
│   │   │   └── [SystemInfoMonitor.swift](./Sources/Services/Memory/SystemInfoMonitor.swift)
│   │   ├── Network/
│   │   │   ├── [IOKitNetworkInterfaceClassifier.swift](./Sources/Services/Network/IOKitNetworkInterfaceClassifier.swift)
│   │   │   └── [NetworkMonitor.swift](./Sources/Services/Network/NetworkMonitor.swift)
│   │   ├── Shared/
│   │   │   └── [MonitorError.swift](./Sources/Services/Shared/MonitorError.swift)
│   │   └── Workspaces/
│   │       ├── [AccessibilityManager.swift](./Sources/Services/Workspaces/AccessibilityManager.swift)
│   │       ├── [ApplicationLauncher.swift](./Sources/Services/Workspaces/ApplicationLauncher.swift)
│   │       ├── [CoreGraphicsWindowLister.swift](./Sources/Services/Workspaces/CoreGraphicsWindowLister.swift)
│   │       ├── [ScreenManager.swift](./Sources/Services/Workspaces/ScreenManager.swift)
│   │       ├── [WindowArranger.swift](./Sources/Services/Workspaces/WindowArranger.swift)
│   │       ├── [WorkspaceCaptureService.swift](./Sources/Services/Workspaces/WorkspaceCaptureService.swift)
│   │       └── [WorkspaceRestoreService.swift](./Sources/Services/Workspaces/WorkspaceRestoreService.swift)
│   └── Views/
│       ├── Apps/
│       │   └── [AppsView.swift](./Sources/Views/Apps/AppsView.swift)
│       ├── Battery/
│       │   └── [BatteryView.swift](./Sources/Views/Battery/BatteryView.swift)
│       ├── Clipboard/
│       │   ├── [ClipboardItemList.swift](./Sources/Views/Clipboard/ClipboardItemList.swift)
│       │   ├── [ClipboardListPane.swift](./Sources/Views/Clipboard/ClipboardListPane.swift)
│       │   ├── [ClipboardSidebarGroup.swift](./Sources/Views/Clipboard/ClipboardSidebarGroup.swift)
│       │   └── [ClipboardView.swift](./Sources/Views/Clipboard/ClipboardView.swift)
│       ├── Clock/
│       │   ├── [ClockFaceSizing.swift](./Sources/Views/Clock/ClockFaceSizing.swift)
│       │   ├── [ClockRing.swift](./Sources/Views/Clock/ClockRing.swift)
│       │   ├── [ClockSidebarGroup.swift](./Sources/Views/Clock/ClockSidebarGroup.swift)
│       │   ├── [ClockView.swift](./Sources/Views/Clock/ClockView.swift)
│       │   ├── [PomodoroView.swift](./Sources/Views/Clock/PomodoroView.swift)
│       │   ├── [StopwatchView.swift](./Sources/Views/Clock/StopwatchView.swift)
│       │   ├── [TimerView.swift](./Sources/Views/Clock/TimerView.swift)
│       │   ├── [WatchfaceView.swift](./Sources/Views/Clock/WatchfaceView.swift)
│       │   └── [WorldClockView.swift](./Sources/Views/Clock/WorldClockView.swift)
│       ├── Front/
│       │   ├── [AppRow.swift](./Sources/Views/Front/AppRow.swift)
│       │   ├── [AppsListView.swift](./Sources/Views/Front/AppsListView.swift)
│       │   └── [RunningAppsSectionView.swift](./Sources/Views/Front/RunningAppsSectionView.swift)
│       ├── Homebrew/
│       │   ├── [ApplicationsSidebarGroup.swift](./Sources/Views/Homebrew/ApplicationsSidebarGroup.swift)
│       │   ├── [AppTile.swift](./Sources/Views/Homebrew/AppTile.swift)
│       │   ├── [BrewAppRow.swift](./Sources/Views/Homebrew/BrewAppRow.swift)
│       │   ├── [BrewAppsView.swift](./Sources/Views/Homebrew/BrewAppsView.swift)
│       │   ├── [DiscoverView.swift](./Sources/Views/Homebrew/DiscoverView.swift)
│       │   ├── [HomebrewMissingView.swift](./Sources/Views/Homebrew/HomebrewMissingView.swift)
│       │   ├── [HomebrewView.swift](./Sources/Views/Homebrew/HomebrewView.swift)
│       │   ├── [InstalledView.swift](./Sources/Views/Homebrew/InstalledView.swift)
│       │   ├── [PackageDetailView.swift](./Sources/Views/Homebrew/PackageDetailView.swift)
│       │   ├── [PackageRow.swift](./Sources/Views/Homebrew/PackageRow.swift)
│       │   ├── [ServicesView.swift](./Sources/Views/Homebrew/ServicesView.swift)
│       │   └── [UpdatesView.swift](./Sources/Views/Homebrew/UpdatesView.swift)
│       ├── IP/
│       │   ├── [InfoRow.swift](./Sources/Views/IP/InfoRow.swift)
│       │   ├── [IPDetailsView.swift](./Sources/Views/IP/IPDetailsView.swift)
│       │   ├── [IPDNSLookupView.swift](./Sources/Views/IP/IPDNSLookupView.swift)
│       │   ├── [IPView.swift](./Sources/Views/IP/IPView.swift)
│       │   └── [JSONText.swift](./Sources/Views/IP/JSONText.swift)
│       ├── Memory/
│       │   ├── [CPUView.swift](./Sources/Views/Memory/CPUView.swift)
│       │   ├── [DiskView.swift](./Sources/Views/Memory/DiskView.swift)
│       │   ├── [MemoryView.swift](./Sources/Views/Memory/MemoryView.swift)
│       │   ├── [SwapView.swift](./Sources/Views/Memory/SwapView.swift)
│       │   └── [SystemInfoView.swift](./Sources/Views/Memory/SystemInfoView.swift)
│       ├── Network/
│       │   ├── [NetworkView.swift](./Sources/Views/Network/NetworkView.swift)
│       │   └── [TrafficView.swift](./Sources/Views/Network/TrafficView.swift)
│       ├── Ports/
│       │   ├── [PortListView.swift](./Sources/Views/Ports/PortListView.swift)
│       │   ├── [PortRow.swift](./Sources/Views/Ports/PortRow.swift)
│       │   └── [PortsView.swift](./Sources/Views/Ports/PortsView.swift)
│       ├── Resources/
│       │   ├── [OverviewView.swift](./Sources/Views/Resources/OverviewView.swift)
│       │   └── [ResourcesView.swift](./Sources/Views/Resources/ResourcesView.swift)
│       ├── Shared/
│       │   ├── DesignSystem/
│       │   │   ├── [CapsuleBadge.swift](./Sources/Views/Shared/DesignSystem/CapsuleBadge.swift)
│       │   │   ├── [ChipButton.swift](./Sources/Views/Shared/DesignSystem/ChipButton.swift)
│       │   │   ├── [CircleIconButton.swift](./Sources/Views/Shared/DesignSystem/CircleIconButton.swift)
│       │   │   ├── [Motion.swift](./Sources/Views/Shared/DesignSystem/Motion.swift)
│       │   │   ├── [Palette.swift](./Sources/Views/Shared/DesignSystem/Palette.swift)
│       │   │   ├── [Radius.swift](./Sources/Views/Shared/DesignSystem/Radius.swift)
│       │   │   ├── [SearchField.swift](./Sources/Views/Shared/DesignSystem/SearchField.swift)
│       │   │   ├── [Spacing.swift](./Sources/Views/Shared/DesignSystem/Spacing.swift)
│       │   │   ├── [SurfaceMetrics.swift](./Sources/Views/Shared/DesignSystem/SurfaceMetrics.swift)
│       │   │   └── [Typography.swift](./Sources/Views/Shared/DesignSystem/Typography.swift)
│       │   ├── [ContentLayout.swift](./Sources/Views/Shared/ContentLayout.swift)
│       │   ├── [DashboardView.swift](./Sources/Views/Shared/DashboardView.swift)
│       │   ├── [MenuBarView.swift](./Sources/Views/Shared/MenuBarView.swift)
│       │   ├── [ResourceMeter.swift](./Sources/Views/Shared/ResourceMeter.swift)
│       │   ├── [SectionCard.swift](./Sources/Views/Shared/SectionCard.swift)
│       │   ├── [SectionGrid.swift](./Sources/Views/Shared/SectionGrid.swift)
│       │   ├── [SettingsView.swift](./Sources/Views/Shared/SettingsView.swift)
│       │   ├── [SurfaceLayout.swift](./Sources/Views/Shared/SurfaceLayout.swift)
│       │   ├── [UnavailableView.swift](./Sources/Views/Shared/UnavailableView.swift)
│       │   ├── [UsageThresholdColor.swift](./Sources/Views/Shared/UsageThresholdColor.swift)
│       │   └── [WindowIdentifierTag.swift](./Sources/Views/Shared/WindowIdentifierTag.swift)
│       └── Workspaces/
│           ├── [WorkspaceRow.swift](./Sources/Views/Workspaces/WorkspaceRow.swift)
│           └── [WorkspacesView.swift](./Sources/Views/Workspaces/WorkspacesView.swift)
├── Tests/
│   └── Core/
│       ├── Models/
│       │   ├── Battery/
│       │   │   └── [BatteryInfoTests.swift](./Tests/Core/Models/Battery/BatteryInfoTests.swift)
│       │   ├── Clipboard/
│       │   │   ├── [ClipboardItemTests.swift](./Tests/Core/Models/Clipboard/ClipboardItemTests.swift)
│       │   │   └── [ClipboardStoreTests.swift](./Tests/Core/Models/Clipboard/ClipboardStoreTests.swift)
│       │   ├── Clock/
│       │   │   └── [WeatherSampleTests.swift](./Tests/Core/Models/Clock/WeatherSampleTests.swift)
│       │   ├── Homebrew/
│       │   │   └── [PackageModelTests.swift](./Tests/Core/Models/Homebrew/PackageModelTests.swift)
│       │   ├── Memory/
│       │   │   ├── [CPUStatsTests.swift](./Tests/Core/Models/Memory/CPUStatsTests.swift)
│       │   │   ├── [DiskStatsTests.swift](./Tests/Core/Models/Memory/DiskStatsTests.swift)
│       │   │   ├── [MemoryStatsTests.swift](./Tests/Core/Models/Memory/MemoryStatsTests.swift)
│       │   │   ├── [SwapStatsTests.swift](./Tests/Core/Models/Memory/SwapStatsTests.swift)
│       │   │   └── [SystemInfoTests.swift](./Tests/Core/Models/Memory/SystemInfoTests.swift)
│       │   ├── Network/
│       │   │   ├── [NetworkEndpointTests.swift](./Tests/Core/Models/Network/NetworkEndpointTests.swift)
│       │   │   └── [NetworkStatsTests.swift](./Tests/Core/Models/Network/NetworkStatsTests.swift)
│       │   ├── Ports/
│       │   │   └── [PortTests.swift](./Tests/Core/Models/Ports/PortTests.swift)
│       │   ├── Shared/
│       │   │   ├── [MenuBarDisplayTests.swift](./Tests/Core/Models/Shared/MenuBarDisplayTests.swift)
│       │   │   ├── [MenuBarMetricsTests.swift](./Tests/Core/Models/Shared/MenuBarMetricsTests.swift)
│       │   │   ├── [MenuBarMetricTests.swift](./Tests/Core/Models/Shared/MenuBarMetricTests.swift)
│       │   │   ├── [SurfaceSectionTests.swift](./Tests/Core/Models/Shared/SurfaceSectionTests.swift)
│       │   │   └── [UsageThresholdTests.swift](./Tests/Core/Models/Shared/UsageThresholdTests.swift)
│       │   └── Workspaces/
│       │       ├── [NormalizedRectTests.swift](./Tests/Core/Models/Workspaces/NormalizedRectTests.swift)
│       │       ├── [ScreenInfoTests.swift](./Tests/Core/Models/Workspaces/ScreenInfoTests.swift)
│       │       ├── [WorkspaceTests.swift](./Tests/Core/Models/Workspaces/WorkspaceTests.swift)
│       │       └── [WorkspaceWindowTests.swift](./Tests/Core/Models/Workspaces/WorkspaceWindowTests.swift)
│       ├── Services/
│       │   ├── Applications/
│       │   │   └── [AppCatalogTests.swift](./Tests/Core/Services/Applications/AppCatalogTests.swift)
│       │   ├── Battery/
│       │   │   └── [BatteryInfoParsingTests.swift](./Tests/Core/Services/Battery/BatteryInfoParsingTests.swift)
│       │   ├── Front/
│       │   │   └── [RunningAppsDiscoveryTests.swift](./Tests/Core/Services/Front/RunningAppsDiscoveryTests.swift)
│       │   ├── Homebrew/
│       │   │   ├── [BrewParserTests.swift](./Tests/Core/Services/Homebrew/BrewParserTests.swift)
│       │   │   └── [HomebrewServiceTests.swift](./Tests/Core/Services/Homebrew/HomebrewServiceTests.swift)
│       │   ├── IP/
│       │   │   └── [IPInfoParsingTests.swift](./Tests/Core/Services/IP/IPInfoParsingTests.swift)
│       │   ├── Ports/
│       │   │   ├── [LsofParserTests.swift](./Tests/Core/Services/Ports/LsofParserTests.swift)
│       │   │   └── [ProcessTerminationTests.swift](./Tests/Core/Services/Ports/ProcessTerminationTests.swift)
│       │   └── Workspaces/
│       │       ├── [CoordinateConverterTests.swift](./Tests/Core/Services/Workspaces/CoordinateConverterTests.swift)
│       │       ├── [WorkspaceStoreTests.swift](./Tests/Core/Services/Workspaces/WorkspaceStoreTests.swift)
│       │       └── [WorkspaceWindowBuilderTests.swift](./Tests/Core/Services/Workspaces/WorkspaceWindowBuilderTests.swift)
│       ├── [ByteFormatterTests.swift](./Tests/Core/ByteFormatterTests.swift)
│       ├── [ClockFormatterTests.swift](./Tests/Core/ClockFormatterTests.swift)
│       ├── [DesignSystemTests.swift](./Tests/Core/DesignSystemTests.swift)
│       └── [SettingsStoreTests.swift](./Tests/Core/SettingsStoreTests.swift)
├── [.gitignore](./.gitignore)
├── [AGENTS.md](./AGENTS.md)
├── [LICENSE](./LICENSE)
├── [Makefile](./Makefile)
├── [package.json](./package.json)
├── [Package.swift](./Package.swift)
├── [README.md](./README.md)
└── [TREE.md](./TREE.md)
```

96 directories, 260 files
