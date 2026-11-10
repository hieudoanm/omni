.PHONY: build app dmg install clean dev test format format-check lint

SCHEME := Omni
PROJECT := Omni.xcodeproj
DERIVED_DATA := build/DerivedData
DESTINATION := platform=macOS

APP_NAME := Omni
VERSION := 0.0.1

BUILD_DIR := build
APP_DIR := $(BUILD_DIR)/$(APP_NAME).app
PRODUCTS_DIR := $(DERIVED_DATA)/Build/Products/Release

DMG_NAME := $(APP_NAME)-$(VERSION).dmg
DMG_PATH := $(BUILD_DIR)/$(DMG_NAME)

build:
	xcodebuild -project $(PROJECT) -scheme $(SCHEME) \
		-configuration Release \
		-destination '$(DESTINATION)' \
		-derivedDataPath $(DERIVED_DATA) \
		build

app: build
	@echo "Staging $(APP_NAME).app..."
	@mkdir -p $(BUILD_DIR)
	@rm -rf $(APP_DIR)
	@cp -R $(PRODUCTS_DIR)/$(APP_NAME).app $(APP_DIR)
	@echo "$(APP_NAME).app created at $(APP_DIR)"

dmg: app
	@echo "Creating $(DMG_NAME)..."
	@mkdir -p $(BUILD_DIR)/dmg-staging
	@cp -R $(APP_DIR) $(BUILD_DIR)/dmg-staging/
	@ln -s /Applications $(BUILD_DIR)/dmg-staging/Applications
	@hdiutil create \
		-volname "$(APP_NAME)" \
		-srcfolder $(BUILD_DIR)/dmg-staging \
		-ov \
		-format UDZO \
		$(DMG_PATH)
	@rm -rf $(BUILD_DIR)/dmg-staging
	@echo "$(DMG_NAME) created at $(DMG_PATH)"

install: app
	@echo "Installing $(APP_NAME).app to /Applications..."
	@osascript -e 'quit app "$(APP_NAME)"' 2>/dev/null || true
	@rm -rf /Applications/$(APP_NAME).app
	@cp -R $(APP_DIR) /Applications/
	@rm -rf $(BUILD_DIR)
	@echo "$(APP_NAME).app installed to /Applications"
	@echo "Opening $(APP_NAME).app..."
	@open /Applications/$(APP_NAME).app

clean:
	rm -rf $(BUILD_DIR)
	xcodebuild -project $(PROJECT) -scheme $(SCHEME) \
		-derivedDataPath $(DERIVED_DATA) clean
	@echo "Cleaned."

test:
	xcodebuild -project $(PROJECT) -scheme $(SCHEME) \
		-destination '$(DESTINATION)' \
		-derivedDataPath $(DERIVED_DATA) \
		test

dev:
	@echo "Starting $(APP_NAME) in dev mode..."
	@xcodebuild -project $(PROJECT) -scheme $(SCHEME) \
		-configuration Debug \
		-destination '$(DESTINATION)' \
		-derivedDataPath $(DERIVED_DATA) \
		build
	@$(DERIVED_DATA)/Build/Products/Debug/$(APP_NAME).app/Contents/MacOS/$(APP_NAME) &

format:
	swiftformat Omni OmniCore OmniTests

format-check:
	swiftformat Omni OmniCore OmniTests --lint

lint:
	xcodebuild -project $(PROJECT) -scheme $(SCHEME) \
		-destination '$(DESTINATION)' \
		-derivedDataPath $(DERIVED_DATA) \
		build
