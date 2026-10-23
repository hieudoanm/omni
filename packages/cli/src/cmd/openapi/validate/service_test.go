package validate

import (
	"encoding/json"
	"strings"
	"testing"
)

func testSpec(t *testing.T, spec map[string]interface{}) map[string]interface{} {
	t.Helper()
	raw, err := json.Marshal(spec)
	if err != nil {
		t.Fatalf("marshal: %v", err)
	}
	var parsed map[string]interface{}
	if err := json.Unmarshal(raw, &parsed); err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	return parsed
}

func TestValidateSpecValid(t *testing.T) {
	spec := testSpec(t, map[string]interface{}{
		"openapi": "3.0.0",
		"info": map[string]interface{}{
			"title":   "Test API",
			"version": "1.0.0",
		},
		"paths": map[string]interface{}{
			"/pets": map[string]interface{}{
				"get": map[string]interface{}{
					"operationId": "listPets",
					"responses":   map[string]interface{}{"200": map[string]interface{}{"description": "OK"}},
				},
			},
		},
	})
	issues := validateSpec(spec)
	if len(issues) != 0 {
		t.Errorf("expected no issues, got %d: %v", len(issues), issues)
	}
}

func TestValidateSpecMissingOpenAPI(t *testing.T) {
	spec := testSpec(t, map[string]interface{}{
		"info": map[string]interface{}{"title": "T", "version": "1"},
	})
	issues := validateSpec(spec)
	if len(issues) == 0 {
		t.Fatal("expected issues")
	}
}

func TestValidateSpecInvalidOpenAPIVersion(t *testing.T) {
	spec := testSpec(t, map[string]interface{}{
		"openapi": "3",
		"info":    map[string]interface{}{"title": "T", "version": "1"},
		"paths":   map[string]interface{}{},
	})
	issues := validateSpec(spec)
	var found bool
	for _, i := range issues {
		if strings.Contains(i, "invalid openapi version") {
			found = true
			break
		}
	}
	if !found {
		t.Errorf("expected version format issue, got %v", issues)
	}
}

func TestValidateSpecMissingInfo(t *testing.T) {
	spec := testSpec(t, map[string]interface{}{
		"openapi": "3.0.0",
		"paths":   map[string]interface{}{},
	})
	issues := validateSpec(spec)
	if len(issues) == 0 {
		t.Fatal("expected issues for missing info")
	}
}

func TestValidateSpecMissingPaths(t *testing.T) {
	spec := testSpec(t, map[string]interface{}{
		"openapi": "3.0.0",
		"info":    map[string]interface{}{"title": "T", "version": "1"},
	})
	issues := validateSpec(spec)
	if len(issues) == 0 {
		t.Fatal("expected issues for missing paths")
	}
}

func TestValidateSpecPatchMethod(t *testing.T) {
	spec := testSpec(t, map[string]interface{}{
		"openapi": "3.0.0",
		"info":    map[string]interface{}{"title": "T", "version": "1"},
		"paths": map[string]interface{}{
			"/pets": map[string]interface{}{
				"patch": map[string]interface{}{
					"operationId": "updatePet",
					"responses":   map[string]interface{}{"200": map[string]interface{}{"description": "OK"}},
				},
			},
		},
	})
	issues := validateSpec(spec)
	if len(issues) != 0 {
		t.Errorf("patch is valid in OpenAPI, got issues: %v", issues)
	}
}

func TestValidateSpecMissingResponses(t *testing.T) {
	spec := testSpec(t, map[string]interface{}{
		"openapi": "3.0.0",
		"info":    map[string]interface{}{"title": "T", "version": "1"},
		"paths": map[string]interface{}{
			"/pets": map[string]interface{}{
				"get": map[string]interface{}{
					"operationId": "listPets",
				},
			},
		},
	})
	issues := validateSpec(spec)
	var found bool
	for _, i := range issues {
		if strings.Contains(i, "missing responses") {
			found = true
			break
		}
	}
	if !found {
		t.Errorf("expected missing responses issue, got %v", issues)
	}
}

func TestValidateSpecDuplicateOpID(t *testing.T) {
	spec := testSpec(t, map[string]interface{}{
		"openapi": "3.0.0",
		"info":    map[string]interface{}{"title": "T", "version": "1"},
		"paths": map[string]interface{}{
			"/pets": map[string]interface{}{
				"get": map[string]interface{}{
					"operationId": "listPets",
					"responses":   map[string]interface{}{"200": map[string]interface{}{"description": "OK"}},
				},
			},
			"/pets/{id}": map[string]interface{}{
				"get": map[string]interface{}{
					"operationId": "listPets",
					"responses":   map[string]interface{}{"200": map[string]interface{}{"description": "OK"}},
				},
			},
		},
	})
	issues := validateSpec(spec)
	var found bool
	for _, i := range issues {
		if strings.Contains(i, "duplicate operationId") {
			found = true
			break
		}
	}
	if !found {
		t.Errorf("expected duplicate operationId issue, got %v", issues)
	}
}

func TestValidatePathNotStartingWithSlash(t *testing.T) {
	spec := testSpec(t, map[string]interface{}{
		"openapi": "3.0.0",
		"info":    map[string]interface{}{"title": "T", "version": "1"},
		"paths": map[string]interface{}{
			"pets": map[string]interface{}{
				"get": map[string]interface{}{
					"operationId": "listPets",
					"responses":   map[string]interface{}{"200": map[string]interface{}{"description": "OK"}},
				},
			},
		},
	})
	issues := validateSpec(spec)
	var found bool
	for _, i := range issues {
		if strings.Contains(i, "should start with /") {
			found = true
			break
		}
	}
	if !found {
		t.Errorf("expected path format issue, got %v", issues)
	}
}

func TestValidateSpecWithJSONRoundtrip(t *testing.T) {
	spec := testSpec(t, map[string]interface{}{
		"openapi": "3.0.0",
		"info":    map[string]interface{}{"title": "T", "version": "1"},
		"paths":   map[string]interface{}{},
	})
	issues := validateSpec(spec)
	if len(issues) != 0 {
		t.Errorf("valid spec has issues: %v", issues)
	}
}

func TestValidateSpecInvalidMethod(t *testing.T) {
	spec := testSpec(t, map[string]interface{}{
		"openapi": "3.0.0",
		"info":    map[string]interface{}{"title": "T", "version": "1"},
		"paths": map[string]interface{}{
			"/pets": map[string]interface{}{
				"foo": map[string]interface{}{
					"responses": map[string]interface{}{"200": map[string]interface{}{"description": "OK"}},
				},
			},
		},
	})
	issues := validateSpec(spec)
	var found bool
	for _, i := range issues {
		if strings.Contains(i, "invalid method") {
			found = true
			break
		}
	}
	if !found {
		t.Errorf("expected invalid method issue, got %v", issues)
	}
}

func TestValidatePaths_SkipsXPrefixPath(t *testing.T) {
	paths := map[string]interface{}{
		"x-internal": map[string]interface{}{"get": map[string]interface{}{}},
		"/pets": map[string]interface{}{
			"get": map[string]interface{}{
				"operationId": "listPets",
				"responses":   map[string]interface{}{"200": map[string]interface{}{"description": "OK"}},
			},
		},
	}
	issues := validatePaths(paths)
	for _, i := range issues {
		if strings.Contains(i, "x-internal") {
			t.Errorf("expected x- prefixed path to be skipped, got issue: %s", i)
		}
	}
	if len(issues) != 0 {
		t.Errorf("expected no issues, got %v", issues)
	}
}

func TestValidatePaths_SkipsXPrefixMethod(t *testing.T) {
	paths := map[string]interface{}{
		"/pets": map[string]interface{}{
			"x-internal": map[string]interface{}{},
			"get": map[string]interface{}{
				"operationId": "listPets",
				"responses":   map[string]interface{}{"200": map[string]interface{}{"description": "OK"}},
			},
		},
	}
	issues := validatePaths(paths)
	for _, i := range issues {
		if strings.Contains(i, "x-internal") {
			t.Errorf("expected x- prefixed method to be skipped, got issue: %s", i)
		}
	}
	if len(issues) != 0 {
		t.Errorf("expected no issues, got %v", issues)
	}
}

func TestValidatePaths_NonObjectOperation(t *testing.T) {
	paths := map[string]interface{}{
		"/pets": map[string]interface{}{
			"get": "not an object",
		},
	}
	issues := validatePaths(paths)
	var found bool
	for _, i := range issues {
		if strings.Contains(i, "must be an object") {
			found = true
			break
		}
	}
	if !found {
		t.Errorf("expected non-object operation issue, got %v", issues)
	}
}
