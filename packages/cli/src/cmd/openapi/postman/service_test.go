package postman

import (
	"encoding/json"
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/openapi/internal"
)

func TestConvertToPostman(t *testing.T) {
	raw, err := json.Marshal(internal.JSON{
		"openapi": "3.0.0",
		"info": map[string]interface{}{
			"title":       "Pet Store",
			"description": "A pet store API",
		},
		"servers": []interface{}{
			map[string]interface{}{"url": "https://api.example.com/v1"},
		},
		"paths": map[string]interface{}{
			"/pets": map[string]interface{}{
				"get": map[string]interface{}{
					"tags":    []interface{}{"pets"},
					"summary": "List all pets",
					"parameters": []interface{}{
						map[string]interface{}{
							"name":        "limit",
							"in":          "query",
							"description": "Max results",
							"example":     10,
						},
					},
					"responses": map[string]interface{}{
						"200": map[string]interface{}{"description": "OK"},
					},
				},
				"post": map[string]interface{}{
					"tags":    []interface{}{"pets"},
					"summary": "Create a pet",
					"requestBody": map[string]interface{}{
						"content": map[string]interface{}{
							"application/json": map[string]interface{}{
								"schema": map[string]interface{}{
									"type": "object",
									"properties": map[string]interface{}{
										"name": map[string]interface{}{"type": "string"},
									},
								},
							},
						},
					},
				},
			},
		},
	})
	if err != nil {
		t.Fatalf("marshal: %v", err)
	}

	var spec internal.JSON
	if err := json.Unmarshal(raw, &spec); err != nil {
		t.Fatalf("unmarshal: %v", err)
	}

	result, err := convertToPostman(spec)
	if err != nil {
		t.Fatalf("convertToPostman: %v", err)
	}

	out, _ := json.Marshal(result)
	var norm map[string]interface{}
	if err := json.Unmarshal(out, &norm); err != nil {
		t.Fatalf("unmarshal result: %v", err)
	}

	info := internal.GetMap(norm["info"])
	if info == nil {
		t.Fatal("missing info")
	}
	if info["name"] != "Pet Store" {
		t.Errorf("name = %v", info["name"])
	}

	items := internal.GetSlice(norm["item"])
	if items == nil || len(items) == 0 {
		t.Fatal("expected at least one item folder")
	}
	folder := internal.GetMap(items[0])
	if folder == nil {
		t.Fatal("expected folder")
	}
	if folder["name"] != "pets" {
		t.Errorf("folder name = %v", folder["name"])
	}

	folderItems := internal.GetSlice(folder["item"])
	if folderItems == nil || len(folderItems) != 2 {
		t.Fatalf("expected 2 items in folder, got %d", len(folderItems))
	}

	names := map[string]bool{}
	for _, fi := range folderItems {
		m := internal.GetMap(fi)
		if m == nil {
			t.Fatal("expected item map")
		}
		names[internal.GetString(m["name"])] = true
	}
	if !names["List all pets"] {
		t.Error("missing item 'List all pets'")
	}
	if !names["Create a pet"] {
		t.Error("missing item 'Create a pet'")
	}
}
