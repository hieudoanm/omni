package internal

import (
	"encoding/json"
	"testing"
)

func TestGetMap(t *testing.T) {
	m := map[string]interface{}{"key": "val"}
	if got := GetMap(m); got == nil {
		t.Error("GetMap should return the map")
	}
	if got := GetMap("not a map"); got != nil {
		t.Error("GetMap should return nil for non-map")
	}
	if got := GetMap(nil); got != nil {
		t.Error("GetMap should return nil for nil")
	}
}

func TestGetSlice(t *testing.T) {
	s := []interface{}{1, 2, 3}
	if got := GetSlice(s); got == nil {
		t.Error("GetSlice should return the slice")
	}
	if got := GetSlice("not a slice"); got != nil {
		t.Error("GetSlice should return nil for non-slice")
	}
}

func TestGetString(t *testing.T) {
	if got := GetString("hello"); got != "hello" {
		t.Errorf("GetString = %q", got)
	}
	if got := GetString(42); got != "" {
		t.Errorf("GetString should return empty for non-string, got %q", got)
	}
	if got := GetString(nil); got != "" {
		t.Errorf("GetString should return empty for nil")
	}
}

func TestSchemaToExample(t *testing.T) {
	tests := []struct {
		name   string
		schema map[string]interface{}
		want   interface{}
	}{
		{"has example", map[string]interface{}{"example": "hello"}, "hello"},
		{"has default", map[string]interface{}{"default": 42}, 42},
		{"string type", map[string]interface{}{"type": "string"}, "string"},
		{"string with enum", map[string]interface{}{"type": "string", "enum": []interface{}{"a", "b"}}, "a"},
		{"integer type", map[string]interface{}{"type": "integer"}, 0},
		{"number type", map[string]interface{}{"type": "number"}, 0},
		{"boolean type", map[string]interface{}{"type": "boolean"}, true},
		{"array type", map[string]interface{}{"type": "array", "items": map[string]interface{}{"type": "string"}}, []interface{}{"string"}},
		{"object type", map[string]interface{}{
			"type": "object",
			"properties": map[string]interface{}{
				"name": map[string]interface{}{"type": "string"},
			},
		}, map[string]interface{}{"name": "string"}},
		{"nil schema", nil, nil},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := SchemaToExample(tt.schema)
			if !jsonEqual(got, tt.want) {
				t.Errorf("got %v (%T), want %v (%T)", got, got, tt.want, tt.want)
			}
		})
	}
}

func jsonEqual(a, b interface{}) bool {
	aj, _ := json.Marshal(a)
	bj, _ := json.Marshal(b)
	return string(aj) == string(bj)
}

func TestParseOpenAPI(t *testing.T) {
	jsonSpec := `{"openapi":"3.0.0","info":{"title":"Test API","version":"1.0"},"paths":{}}`
	spec, err := ParseOpenAPI([]byte(jsonSpec))
	if err != nil {
		t.Fatalf("parse JSON: %v", err)
	}
	if spec["openapi"] != "3.0.0" {
		t.Errorf("openapi = %v", spec["openapi"])
	}
}

func TestParseOpenAPIInvalid(t *testing.T) {
	_, err := ParseOpenAPI([]byte("not valid json or yaml"))
	if err == nil {
		t.Error("expected error for invalid input")
	}
}

func TestNormalizeYAML(t *testing.T) {
	nested := map[interface{}]interface{}{
		"key": map[interface{}]interface{}{
			"inner": "val",
		},
	}
	result := NormalizeYAML(nested)
	m, ok := result.(map[string]interface{})
	if !ok {
		t.Fatalf("expected map[string]interface{}, got %T", result)
	}
	if m["key"] == nil {
		t.Fatal("expected nested key")
	}
	inner, ok := m["key"].(map[string]interface{})
	if !ok {
		t.Fatalf("expected nested map[string]interface{}, got %T", m["key"])
	}
	if inner["inner"] != "val" {
		t.Errorf("inner = %v", inner["inner"])
	}
}

func TestNormalizeYAML_slice(t *testing.T) {
	input := []interface{}{
		map[interface{}]interface{}{"key": "val"},
		"simple",
		42,
	}
	result := NormalizeYAML(input)
	slice, ok := result.([]interface{})
	if !ok {
		t.Fatalf("expected []interface{}, got %T", result)
	}
	if len(slice) != 3 {
		t.Fatalf("expected 3 elements, got %d", len(slice))
	}
	m, ok := slice[0].(map[string]interface{})
	if !ok {
		t.Fatalf("expected map[string]interface{}, got %T", slice[0])
	}
	if m["key"] != "val" {
		t.Errorf("expected 'val', got %v", m["key"])
	}
	if slice[1] != "simple" {
		t.Errorf("expected 'simple', got %v", slice[1])
	}
	if slice[2] != 42 {
		t.Errorf("expected 42, got %v", slice[2])
	}
}

func TestNormalizeYAML_nil(t *testing.T) {
	if got := NormalizeYAML(nil); got != nil {
		t.Errorf("expected nil, got %v", got)
	}
}

func TestNormalizeYAML_simpleTypes(t *testing.T) {
	if got := NormalizeYAML("hello"); got != "hello" {
		t.Errorf("expected 'hello', got %v", got)
	}
	if got := NormalizeYAML(42); got != 42 {
		t.Errorf("expected 42, got %v", got)
	}
	if got := NormalizeYAML(true); got != true {
		t.Errorf("expected true, got %v", got)
	}
}
