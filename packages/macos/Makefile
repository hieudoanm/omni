.PHONY: build app dmg install clean dev test icons format lint

APP_NAME := Omni
BUNDLE_ID := io.github.hieudoanm.Omni
VERSION := 0.0.1

BUILD_DIR := build
APP_DIR := $(BUILD_DIR)/$(APP_NAME).app
CONTENTS_DIR := $(APP_DIR)/Contents
MACOS_DIR := $(CONTENTS_DIR)/MacOS
RESOURCES_DIR := $(CONTENTS_DIR)/Resources

SWIFT_BUILD_DIR := .build/release
BINARY := $(SWIFT_BUILD_DIR)/$(APP_NAME)

DMG_NAME := $(APP_NAME)-$(VERSION).dmg
DMG_PATH := $(BUILD_DIR)/$(DMG_NAME)

build: $(BINARY)

$(BINARY):
	swift build -c release

app: build icons
	@echo "Creating $(APP_NAME).app bundle..."
	@mkdir -p $(MACOS_DIR)
	@mkdir -p $(RESOURCES_DIR)
	@cp $(BINARY) $(MACOS_DIR)/$(APP_NAME)
	@cp Resources/Info.plist $(CONTENTS_DIR)/Info.plist
	@cp Resources/AppIcon.icns $(RESOURCES_DIR)/AppIcon.icns
	@codesign --force --sign - \
		--entitlements Resources/Omni.entitlements \
		$(APP_DIR)
	@echo "$(APP_NAME).app created at $(APP_DIR)"

icons:
	@echo "Generating app icons..."
	@mkdir -p $(BUILD_DIR)/AppIcon.iconset
	@swift Resources/AppIcon.iconset/AppIcon-render.swift \
		Resources/AppIcon.iconset/AppIcon-source.svg \
		$(BUILD_DIR)/AppIcon-master.png
	@sips -z 16 16 $(BUILD_DIR)/AppIcon-master.png --out $(BUILD_DIR)/AppIcon.iconset/icon_16x16.png
	@sips -z 32 32 $(BUILD_DIR)/AppIcon-master.png --out $(BUILD_DIR)/AppIcon.iconset/icon_16x16@2x.png
	@sips -z 32 32 $(BUILD_DIR)/AppIcon-master.png --out $(BUILD_DIR)/AppIcon.iconset/icon_32x32.png
	@sips -z 64 64 $(BUILD_DIR)/AppIcon-master.png --out $(BUILD_DIR)/AppIcon.iconset/icon_32x32@2x.png
	@sips -z 128 128 $(BUILD_DIR)/AppIcon-master.png --out $(BUILD_DIR)/AppIcon.iconset/icon_128x128.png
	@sips -z 256 256 $(BUILD_DIR)/AppIcon-master.png --out $(BUILD_DIR)/AppIcon.iconset/icon_128x128@2x.png
	@sips -z 256 256 $(BUILD_DIR)/AppIcon-master.png --out $(BUILD_DIR)/AppIcon.iconset/icon_256x256.png
	@sips -z 512 512 $(BUILD_DIR)/AppIcon-master.png --out $(BUILD_DIR)/AppIcon.iconset/icon_256x256@2x.png
	@sips -z 512 512 $(BUILD_DIR)/AppIcon-master.png --out $(BUILD_DIR)/AppIcon.iconset/icon_512x512.png
	@cp $(BUILD_DIR)/AppIcon-master.png $(BUILD_DIR)/AppIcon.iconset/icon_512x512@2x.png
	@iconutil -c icns $(BUILD_DIR)/AppIcon.iconset -o Resources/AppIcon.icns
	@echo "AppIcon.icns generated"

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
	@rm -rf $(BUILD_DIR) .build
	@echo "$(APP_NAME).app installed to /Applications"
	@echo "Opening $(APP_NAME).app..."
	@open /Applications/$(APP_NAME).app

clean:
	@swift package clean
	@rm -rf $(BUILD_DIR)
	@echo "Cleaned."

test:
	swift test

dev:
	@echo "Starting $(APP_NAME) in dev mode..."
	@swift build -c debug && .build/debug/$(APP_NAME)

format:
	swiftformat Sources Tests Package.swift

lint:
	swift build
