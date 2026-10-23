.PHONY: lint build zip xpi crx sign clean

EXTENSION_NAME := omni
SOURCE_DIR_V2 := ./dist/v2
SOURCE_DIR_V3 := ./dist/v3
ARTIFACTS_DIR := $(CURDIR)/download
ARTIFACTS_DIR_V2 := $(ARTIFACTS_DIR)/v2
ARTIFACTS_DIR_V3 := $(ARTIFACTS_DIR)/v3

ZIP_FILE_V2 := $(ARTIFACTS_DIR_V2)/$(EXTENSION_NAME).zip
ZIP_FILE_V3 := $(ARTIFACTS_DIR_V3)/$(EXTENSION_NAME).zip
CRX_FILE_V2 := $(ARTIFACTS_DIR_V2)/$(EXTENSION_NAME).crx
CRX_FILE_V3 := $(ARTIFACTS_DIR_V3)/$(EXTENSION_NAME).crx
UNAME_S := $(shell uname -s)
ifeq ($(UNAME_S),Linux)
  CHROME := google-chrome
else
  CHROME := "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
endif

lint:
	pnpm web-ext lint --source-dir $(SOURCE_DIR_V2)
	pnpm web-ext lint --source-dir $(SOURCE_DIR_V3)

build: zip xpi crx
	cp README.md $(ARTIFACTS_DIR)/README.md

zip:
	mkdir -p $(ARTIFACTS_DIR_V2)
	mkdir -p $(ARTIFACTS_DIR_V3)
	cd $(SOURCE_DIR_V2) && zip -r $(ZIP_FILE_V2) .
	cd $(SOURCE_DIR_V3) && zip -r $(ZIP_FILE_V3) .

xpi:
	mkdir -p $(ARTIFACTS_DIR_V2)
	mkdir -p $(ARTIFACTS_DIR_V3)
	pnpm web-ext build 		--source-dir $(SOURCE_DIR_V2) 		--artifacts-dir $(ARTIFACTS_DIR_V2) 		--filename $(EXTENSION_NAME).xpi 		--overwrite-dest
	pnpm web-ext build 		--source-dir $(SOURCE_DIR_V3) 		--artifacts-dir $(ARTIFACTS_DIR_V3) 		--filename $(EXTENSION_NAME).xpi 		--overwrite-dest

crx:
	@if command -v $(CHROME) >/dev/null 2>&1; then \
		mkdir -p $(ARTIFACTS_DIR_V2); \
		mkdir -p $(ARTIFACTS_DIR_V3); \
		$(CHROME) --pack-extension=$(SOURCE_DIR_V2); \
		mv ./dist/v2.crx $(CRX_FILE_V2); \
		$(CHROME) --pack-extension=$(SOURCE_DIR_V3); \
		mv ./dist/v3.crx $(CRX_FILE_V3); \
		rm -f ./dist/v2.pem ./dist/v3.pem; \
	else \
		echo "Warning: Chrome not found at $(CHROME). Skipping CRX packaging."; \
	fi

clean:
	rm -rf $(ARTIFACTS_DIR)
