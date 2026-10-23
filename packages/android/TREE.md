# TREE

```text
├── app/
│   ├── src/
│   │   ├── main/
│   │   │   ├── kotlin/
│   │   │   │   └── io/
│   │   │   │       └── github/
│   │   │   │           └── hieudoanm/
│   │   │   │               ├── block/
│   │   │   │               │   ├── accessibility/
│   │   │   │               │   │   └── [FocusAccessibilityService.kt](./app/src/main/kotlin/io/github/hieudoanm/block/accessibility/FocusAccessibilityService.kt)
│   │   │   │               │   ├── activity/
│   │   │   │               │   │   ├── [BlockActivity.kt](./app/src/main/kotlin/io/github/hieudoanm/block/activity/BlockActivity.kt)
│   │   │   │               │   │   └── [MainActivity.kt](./app/src/main/kotlin/io/github/hieudoanm/block/activity/MainActivity.kt)
│   │   │   │               │   ├── data/
│   │   │   │               │   │   ├── database/
│   │   │   │               │   │   │   ├── [AppDao.kt](./app/src/main/kotlin/io/github/hieudoanm/block/data/database/AppDao.kt)
│   │   │   │               │   │   │   └── [FocusDatabase.kt](./app/src/main/kotlin/io/github/hieudoanm/block/data/database/FocusDatabase.kt)
│   │   │   │               │   │   ├── entity/
│   │   │   │               │   │   │   ├── [BlockedApp.kt](./app/src/main/kotlin/io/github/hieudoanm/block/data/entity/BlockedApp.kt)
│   │   │   │               │   │   │   └── [Schedule.kt](./app/src/main/kotlin/io/github/hieudoanm/block/data/entity/Schedule.kt)
│   │   │   │               │   │   └── preferences/
│   │   │   │               │   │       └── [SettingsDataStore.kt](./app/src/main/kotlin/io/github/hieudoanm/block/data/preferences/SettingsDataStore.kt)
│   │   │   │               │   ├── di/
│   │   │   │               │   │   └── [AppModule.kt](./app/src/main/kotlin/io/github/hieudoanm/block/di/AppModule.kt)
│   │   │   │               │   ├── navigation/
│   │   │   │               │   │   └── [NavGraph.kt](./app/src/main/kotlin/io/github/hieudoanm/block/navigation/NavGraph.kt)
│   │   │   │               │   ├── repository/
│   │   │   │               │   │   └── [FocusRepository.kt](./app/src/main/kotlin/io/github/hieudoanm/block/repository/FocusRepository.kt)
│   │   │   │               │   └── ui/
│   │   │   │               │       ├── apps/
│   │   │   │               │       │   ├── [AppListScreen.kt](./app/src/main/kotlin/io/github/hieudoanm/block/ui/apps/AppListScreen.kt)
│   │   │   │               │       │   └── [AppListViewModel.kt](./app/src/main/kotlin/io/github/hieudoanm/block/ui/apps/AppListViewModel.kt)
│   │   │   │               │       ├── block/
│   │   │   │               │       │   └── [BlockScreen.kt](./app/src/main/kotlin/io/github/hieudoanm/block/ui/block/BlockScreen.kt)
│   │   │   │               │       ├── home/
│   │   │   │               │       │   ├── [HomeScreen.kt](./app/src/main/kotlin/io/github/hieudoanm/block/ui/home/HomeScreen.kt)
│   │   │   │               │       │   └── [HomeViewModel.kt](./app/src/main/kotlin/io/github/hieudoanm/block/ui/home/HomeViewModel.kt)
│   │   │   │               │       ├── settings/
│   │   │   │               │       │   ├── [SettingsScreen.kt](./app/src/main/kotlin/io/github/hieudoanm/block/ui/settings/SettingsScreen.kt)
│   │   │   │               │       │   └── [SettingsViewModel.kt](./app/src/main/kotlin/io/github/hieudoanm/block/ui/settings/SettingsViewModel.kt)
│   │   │   │               │       └── theme/
│   │   │   │               │           ├── [Color.kt](./app/src/main/kotlin/io/github/hieudoanm/block/ui/theme/Color.kt)
│   │   │   │               │           └── [Theme.kt](./app/src/main/kotlin/io/github/hieudoanm/block/ui/theme/Theme.kt)
│   │   │   │               ├── nfc/
│   │   │   │               │   ├── activity/
│   │   │   │               │   │   └── [MainActivity.kt](./app/src/main/kotlin/io/github/hieudoanm/nfc/activity/MainActivity.kt)
│   │   │   │               │   ├── data/
│   │   │   │               │   │   ├── database/
│   │   │   │               │   │   │   ├── [AppDatabase.kt](./app/src/main/kotlin/io/github/hieudoanm/nfc/data/database/AppDatabase.kt)
│   │   │   │               │   │   │   ├── [TagHistoryDao.kt](./app/src/main/kotlin/io/github/hieudoanm/nfc/data/database/TagHistoryDao.kt)
│   │   │   │               │   │   │   └── [TagProfileDao.kt](./app/src/main/kotlin/io/github/hieudoanm/nfc/data/database/TagProfileDao.kt)
│   │   │   │               │   │   ├── entity/
│   │   │   │               │   │   │   ├── [TagHistory.kt](./app/src/main/kotlin/io/github/hieudoanm/nfc/data/entity/TagHistory.kt)
│   │   │   │               │   │   │   └── [TagProfile.kt](./app/src/main/kotlin/io/github/hieudoanm/nfc/data/entity/TagProfile.kt)
│   │   │   │               │   │   ├── nfc/
│   │   │   │               │   │   │   ├── [HceApduService.kt](./app/src/main/kotlin/io/github/hieudoanm/nfc/data/nfc/HceApduService.kt)
│   │   │   │               │   │   │   ├── [NdefReader.kt](./app/src/main/kotlin/io/github/hieudoanm/nfc/data/nfc/NdefReader.kt)
│   │   │   │               │   │   │   ├── [NdefWriter.kt](./app/src/main/kotlin/io/github/hieudoanm/nfc/data/nfc/NdefWriter.kt)
│   │   │   │               │   │   │   ├── [TagDispatcher.kt](./app/src/main/kotlin/io/github/hieudoanm/nfc/data/nfc/TagDispatcher.kt)
│   │   │   │               │   │   │   └── [TagTechInspector.kt](./app/src/main/kotlin/io/github/hieudoanm/nfc/data/nfc/TagTechInspector.kt)
│   │   │   │               │   │   ├── preferences/
│   │   │   │               │   │   │   └── [SettingsDataStore.kt](./app/src/main/kotlin/io/github/hieudoanm/nfc/data/preferences/SettingsDataStore.kt)
│   │   │   │               │   │   └── repository/
│   │   │   │               │   │       └── [NfcRepository.kt](./app/src/main/kotlin/io/github/hieudoanm/nfc/data/repository/NfcRepository.kt)
│   │   │   │               │   ├── di/
│   │   │   │               │   │   └── [AppModule.kt](./app/src/main/kotlin/io/github/hieudoanm/nfc/di/AppModule.kt)
│   │   │   │               │   ├── domain/
│   │   │   │               │   │   └── model/
│   │   │   │               │   │       ├── [NdefRecordModel.kt](./app/src/main/kotlin/io/github/hieudoanm/nfc/domain/model/NdefRecordModel.kt)
│   │   │   │               │   │       └── [TagInfo.kt](./app/src/main/kotlin/io/github/hieudoanm/nfc/domain/model/TagInfo.kt)
│   │   │   │               │   ├── navigation/
│   │   │   │               │   │   └── [NavGraph.kt](./app/src/main/kotlin/io/github/hieudoanm/nfc/navigation/NavGraph.kt)
│   │   │   │               │   └── ui/
│   │   │   │               │       ├── history/
│   │   │   │               │       │   ├── [HistoryScreen.kt](./app/src/main/kotlin/io/github/hieudoanm/nfc/ui/history/HistoryScreen.kt)
│   │   │   │               │       │   └── [HistoryViewModel.kt](./app/src/main/kotlin/io/github/hieudoanm/nfc/ui/history/HistoryViewModel.kt)
│   │   │   │               │       ├── home/
│   │   │   │               │       │   ├── [HomeScreen.kt](./app/src/main/kotlin/io/github/hieudoanm/nfc/ui/home/HomeScreen.kt)
│   │   │   │               │       │   └── [HomeViewModel.kt](./app/src/main/kotlin/io/github/hieudoanm/nfc/ui/home/HomeViewModel.kt)
│   │   │   │               │       ├── settings/
│   │   │   │               │       │   ├── [SettingsScreen.kt](./app/src/main/kotlin/io/github/hieudoanm/nfc/ui/settings/SettingsScreen.kt)
│   │   │   │               │       │   └── [SettingsViewModel.kt](./app/src/main/kotlin/io/github/hieudoanm/nfc/ui/settings/SettingsViewModel.kt)
│   │   │   │               │       └── theme/
│   │   │   │               │           ├── [Color.kt](./app/src/main/kotlin/io/github/hieudoanm/nfc/ui/theme/Color.kt)
│   │   │   │               │           └── [Theme.kt](./app/src/main/kotlin/io/github/hieudoanm/nfc/ui/theme/Theme.kt)
│   │   │   │               └── omni/
│   │   │   │                   ├── activity/
│   │   │   │                   │   └── [MainActivity.kt](./app/src/main/kotlin/io/github/hieudoanm/omni/activity/MainActivity.kt)
│   │   │   │                   ├── ui/
│   │   │   │                   │   ├── home/
│   │   │   │                   │   │   └── [HomeScreen.kt](./app/src/main/kotlin/io/github/hieudoanm/omni/ui/home/HomeScreen.kt)
│   │   │   │                   │   └── theme/
│   │   │   │                   │       ├── [Color.kt](./app/src/main/kotlin/io/github/hieudoanm/omni/ui/theme/Color.kt)
│   │   │   │                   │       └── [Theme.kt](./app/src/main/kotlin/io/github/hieudoanm/omni/ui/theme/Theme.kt)
│   │   │   │                   └── [OmniApp.kt](./app/src/main/kotlin/io/github/hieudoanm/omni/OmniApp.kt)
│   │   │   ├── res/
│   │   │   │   ├── drawable/
│   │   │   │   │   ├── [ic_launcher_background.xml](./app/src/main/res/drawable/ic_launcher_background.xml)
│   │   │   │   │   └── [ic_launcher_foreground.xml](./app/src/main/res/drawable/ic_launcher_foreground.xml)
│   │   │   │   ├── mipmap-anydpi-v26/
│   │   │   │   │   └── [ic_launcher.xml](./app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml)
│   │   │   │   ├── values/
│   │   │   │   │   ├── [colors.xml](./app/src/main/res/values/colors.xml)
│   │   │   │   │   ├── [strings.xml](./app/src/main/res/values/strings.xml)
│   │   │   │   │   └── [themes.xml](./app/src/main/res/values/themes.xml)
│   │   │   │   └── xml/
│   │   │   │       ├── [accessibility_service_config.xml](./app/src/main/res/xml/accessibility_service_config.xml)
│   │   │   │       └── [apduservice.xml](./app/src/main/res/xml/apduservice.xml)
│   │   │   └── [AndroidManifest.xml](./app/src/main/AndroidManifest.xml)
│   │   └── test/
│   │       ├── kotlin/
│   │       │   └── io/
│   │       │       └── github/
│   │       │           └── hieudoanm/
│   │       │               ├── block/
│   │       │               │   ├── accessibility/
│   │       │               │   │   └── [FocusAccessibilityServiceTest.kt](./app/src/test/kotlin/io/github/hieudoanm/block/accessibility/FocusAccessibilityServiceTest.kt)
│   │       │               │   ├── activity/
│   │       │               │   │   ├── [BlockActivityTest.kt](./app/src/test/kotlin/io/github/hieudoanm/block/activity/BlockActivityTest.kt)
│   │       │               │   │   └── [MainActivityTest.kt](./app/src/test/kotlin/io/github/hieudoanm/block/activity/MainActivityTest.kt)
│   │       │               │   ├── data/
│   │       │               │   │   ├── database/
│   │       │               │   │   │   ├── [AppDaoTest.kt](./app/src/test/kotlin/io/github/hieudoanm/block/data/database/AppDaoTest.kt)
│   │       │               │   │   │   └── [FocusDatabaseTest.kt](./app/src/test/kotlin/io/github/hieudoanm/block/data/database/FocusDatabaseTest.kt)
│   │       │               │   │   ├── entity/
│   │       │               │   │   │   ├── [BlockedAppTest.kt](./app/src/test/kotlin/io/github/hieudoanm/block/data/entity/BlockedAppTest.kt)
│   │       │               │   │   │   └── [ScheduleTest.kt](./app/src/test/kotlin/io/github/hieudoanm/block/data/entity/ScheduleTest.kt)
│   │       │               │   │   └── preferences/
│   │       │               │   │       └── [SettingsDataStoreTest.kt](./app/src/test/kotlin/io/github/hieudoanm/block/data/preferences/SettingsDataStoreTest.kt)
│   │       │               │   ├── di/
│   │       │               │   │   └── [AppModuleTest.kt](./app/src/test/kotlin/io/github/hieudoanm/block/di/AppModuleTest.kt)
│   │       │               │   ├── navigation/
│   │       │               │   │   └── [NavGraphTest.kt](./app/src/test/kotlin/io/github/hieudoanm/block/navigation/NavGraphTest.kt)
│   │       │               │   ├── repository/
│   │       │               │   │   └── [FocusRepositoryTest.kt](./app/src/test/kotlin/io/github/hieudoanm/block/repository/FocusRepositoryTest.kt)
│   │       │               │   └── ui/
│   │       │               │       ├── apps/
│   │       │               │       │   ├── [AppListScreenTest.kt](./app/src/test/kotlin/io/github/hieudoanm/block/ui/apps/AppListScreenTest.kt)
│   │       │               │       │   └── [AppListViewModelTest.kt](./app/src/test/kotlin/io/github/hieudoanm/block/ui/apps/AppListViewModelTest.kt)
│   │       │               │       ├── block/
│   │       │               │       │   └── [BlockScreenTest.kt](./app/src/test/kotlin/io/github/hieudoanm/block/ui/block/BlockScreenTest.kt)
│   │       │               │       ├── home/
│   │       │               │       │   ├── [HomeScreenTest.kt](./app/src/test/kotlin/io/github/hieudoanm/block/ui/home/HomeScreenTest.kt)
│   │       │               │       │   └── [HomeViewModelTest.kt](./app/src/test/kotlin/io/github/hieudoanm/block/ui/home/HomeViewModelTest.kt)
│   │       │               │       ├── settings/
│   │       │               │       │   ├── [SettingsScreenTest.kt](./app/src/test/kotlin/io/github/hieudoanm/block/ui/settings/SettingsScreenTest.kt)
│   │       │               │       │   └── [SettingsViewModelTest.kt](./app/src/test/kotlin/io/github/hieudoanm/block/ui/settings/SettingsViewModelTest.kt)
│   │       │               │       └── theme/
│   │       │               │           ├── [ColorTest.kt](./app/src/test/kotlin/io/github/hieudoanm/block/ui/theme/ColorTest.kt)
│   │       │               │           └── [ThemeTest.kt](./app/src/test/kotlin/io/github/hieudoanm/block/ui/theme/ThemeTest.kt)
│   │       │               ├── nfc/
│   │       │               │   └── [NfcModuleSmokeTest.kt](./app/src/test/kotlin/io/github/hieudoanm/nfc/NfcModuleSmokeTest.kt)
│   │       │               └── omni/
│   │       │                   ├── activity/
│   │       │                   │   └── [MainActivityTest.kt](./app/src/test/kotlin/io/github/hieudoanm/omni/activity/MainActivityTest.kt)
│   │       │                   └── ui/
│   │       │                       └── home/
│   │       │                           └── [HomeScreenTest.kt](./app/src/test/kotlin/io/github/hieudoanm/omni/ui/home/HomeScreenTest.kt)
│   │       └── resources/
│   │           └── [robolectric.properties](./app/src/test/resources/robolectric.properties)
│   ├── [build.gradle.kts](./app/build.gradle.kts)
│   ├── [gradle.lockfile](./app/gradle.lockfile)
│   ├── [lint.xml](./app/lint.xml)
│   └── [proguard-rules.pro](./app/proguard-rules.pro)
├── docs/
│   ├── 00-overview/
│   │   └── [README.md](./docs/00-overview/README.md)
│   ├── 01-requirements/
│   │   └── [README.md](./docs/01-requirements/README.md)
│   ├── 02-features/
│   │   └── [README.md](./docs/02-features/README.md)
│   ├── 03-user-stories/
│   │   └── [README.md](./docs/03-user-stories/README.md)
│   ├── 04-architecture/
│   │   └── [README.md](./docs/04-architecture/README.md)
│   ├── 05-data-model/
│   │   └── [README.md](./docs/05-data-model/README.md)
│   ├── 06-api-specification/
│   │   └── [README.md](./docs/06-api-specification/README.md)
│   ├── 07-ui-ux-design/
│   │   └── [README.md](./docs/07-ui-ux-design/README.md)
│   ├── 08-tech-stack/
│   │   └── [README.md](./docs/08-tech-stack/README.md)
│   ├── 09-testing-strategy/
│   │   └── [README.md](./docs/09-testing-strategy/README.md)
│   ├── 10-implementation-plan/
│   │   └── [README.md](./docs/10-implementation-plan/README.md)
│   ├── 11-deployment/
│   │   └── [README.md](./docs/11-deployment/README.md)
│   ├── 12-operations/
│   │   └── [README.md](./docs/12-operations/README.md)
│   ├── [00-overview.md](./docs/00-overview.md)
│   ├── [01-requirements.md](./docs/01-requirements.md)
│   ├── [02-features.md](./docs/02-features.md)
│   ├── [03-user-stories.md](./docs/03-user-stories.md)
│   ├── [04-architecture.md](./docs/04-architecture.md)
│   ├── [05-data-model.md](./docs/05-data-model.md)
│   ├── [06-api-specification.md](./docs/06-api-specification.md)
│   ├── [07-ui-ux-design.md](./docs/07-ui-ux-design.md)
│   ├── [08-tech-stack.md](./docs/08-tech-stack.md)
│   ├── [09-testing-strategy.md](./docs/09-testing-strategy.md)
│   ├── [10-implementation-plan.md](./docs/10-implementation-plan.md)
│   ├── [11-deployment.md](./docs/11-deployment.md)
│   ├── [12-operations.md](./docs/12-operations.md)
│   └── [README.md](./docs/README.md)
├── gradle/
│   └── wrapper/
│       ├── [gradle-wrapper.jar](./gradle/wrapper/gradle-wrapper.jar)
│       └── [gradle-wrapper.properties](./gradle/wrapper/gradle-wrapper.properties)
├── [.gitignore](./.gitignore)
├── [AGENTS.md](./AGENTS.md)
├── [build.gradle.kts](./build.gradle.kts)
├── [gradle.properties](./gradle.properties)
├── [gradlew](./gradlew)
├── [gradlew.bat](./gradlew.bat)
├── [Makefile](./Makefile)
├── [package.json](./package.json)
├── [README.md](./README.md)
├── [settings.gradle.kts](./settings.gradle.kts)
└── [TREE.md](./TREE.md)
```

93 directories, 127 files
