package validate

import (
	"fmt"
	"regexp"
	"strings"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/openapi/internal"
)

var validMethods = []string{"get", "put", "post", "delete", "options", "head", "patch", "trace"}

func validateSpec(spec internal.JSON) []string {
	var issues []string

	openapiVer := internal.GetString(spec["openapi"])
	if openapiVer == "" {
		issues = append(issues, "missing required field: openapi")
	} else if !regexp.MustCompile(`^\d+\.\d+\.\d+$`).MatchString(openapiVer) {
		issues = append(issues, fmt.Sprintf("invalid openapi version: %q (expected semver)", openapiVer))
	}

	info := internal.GetMap(spec["info"])
	if info == nil {
		issues = append(issues, "missing required object: info")
	} else {
		if internal.GetString(info["title"]) == "" {
			issues = append(issues, "info.title is required")
		}
		if internal.GetString(info["version"]) == "" {
			issues = append(issues, "info.version is required")
		}
	}

	paths := internal.GetMap(spec["paths"])
	if paths == nil {
		issues = append(issues, "missing required object: paths")
	} else {
		issues = append(issues, validatePaths(paths)...)
	}

	return issues
}

func validatePaths(paths map[string]interface{}) []string {
	var issues []string
	validMethodsSet := make(map[string]bool, len(validMethods))
	for _, m := range validMethods {
		validMethodsSet[m] = true
	}

	seenOpIDs := map[string]string{}

	for path, methodsRaw := range paths {
		if strings.HasPrefix(path, "x-") {
			continue
		}
		if !strings.HasPrefix(path, "/") {
			issues = append(issues, fmt.Sprintf("path %q should start with /", path))
		}

		methods := internal.GetMap(methodsRaw)
		if methods == nil {
			continue
		}

		for method, opRaw := range methods {
			if strings.HasPrefix(method, "x-") {
				continue
			}
			if !validMethodsSet[strings.ToLower(method)] {
				issues = append(issues, fmt.Sprintf("path %q: invalid method %q", path, method))
				continue
			}

			op := internal.GetMap(opRaw)
			if op == nil {
				issues = append(issues, fmt.Sprintf("%s %s: operation must be an object", strings.ToUpper(method), path))
				continue
			}

			responses := internal.GetMap(op["responses"])
			if responses == nil || len(responses) == 0 {
				issues = append(issues, fmt.Sprintf("%s %s: missing responses", strings.ToUpper(method), path))
			}

			if opID := internal.GetString(op["operationId"]); opID != "" {
				if existingPath, ok := seenOpIDs[opID]; ok {
					issues = append(issues, fmt.Sprintf("duplicate operationId %q (%s %s and %s)", opID, existingPath, path, method))
				} else {
					seenOpIDs[opID] = strings.ToUpper(method) + " " + path
				}
			}
		}
	}

	return issues
}
