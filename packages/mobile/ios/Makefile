.PHONY: build test lint format format-check clean app

SCHEME := Omni
PROJECT := Omni.xcodeproj
DERIVED_DATA := build/DerivedData
# Override for device builds, e.g. make build DESTINATION="generic/platform=iOS"
DESTINATION ?= platform=iOS Simulator,name=iPhone 16

build:
	xcodebuild -project $(PROJECT) -scheme $(SCHEME) \
		-destination '$(DESTINATION)' \
		-derivedDataPath $(DERIVED_DATA) \
		build

test:
	xcodebuild -project $(PROJECT) -scheme $(SCHEME) \
		-destination '$(DESTINATION)' \
		-derivedDataPath $(DERIVED_DATA) \
		test

app: build
	@echo "App bundle:"
	@find $(DERIVED_DATA)/Build/Products -name "Omni.app" -maxdepth 2

lint: build

format:
	swiftformat Omni OmniTests

format-check:
	swiftformat Omni OmniTests --lint

clean:
	rm -rf build
