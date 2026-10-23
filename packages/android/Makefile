GRADLE ?= ./gradlew
TASKS  ?= :app:assembleDebug

.PHONY: help format lint test build clean

help:
	@echo "omni android"
	@echo ""
	@echo "Targets:"
	@echo "  format     ./gradlew spotlessApply"
	@echo "  lint       ./gradlew :app:lintDebug"
	@echo "  test       ./gradlew :app:testDebugUnitTest"
	@echo "  build      ./gradlew :app:assembleDebug"
	@echo "  clean      ./gradlew clean"

format:
	$(GRADLE) spotlessApply

lint:
	$(GRADLE) :app:lintDebug

test:
	$(GRADLE) :app:testDebugUnitTest

build:
	$(GRADLE) $(TASKS)

clean:
	$(GRADLE) clean