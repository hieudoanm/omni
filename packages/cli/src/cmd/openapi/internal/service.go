package internal

import (
	"encoding/json"
	"fmt"

	"gopkg.in/yaml.v3"
)

type JSON map[string]interface{}

func GetMap(v interface{}) map[string]interface{} {
	if m, ok := v.(map[string]interface{}); ok {
		return m
	}
	return nil
}

func GetSlice(v interface{}) []interface{} {
	if s, ok := v.([]interface{}); ok {
		return s
	}
	return nil
}

func GetString(v interface{}) string {
	if s, ok := v.(string); ok {
		return s
	}
	return ""
}

func NormalizeYAML(i interface{}) interface{} {
	switch v := i.(type) {
	case map[interface{}]interface{}:
		m := map[string]interface{}{}
		for k, val := range v {
			m[fmt.Sprintf("%v", k)] = NormalizeYAML(val)
		}
		return m
	case []interface{}:
		for i, val := range v {
			v[i] = NormalizeYAML(val)
		}
	}
	return i
}

func ParseOpenAPI(data []byte) (JSON, error) {
	var spec JSON

	if err := json.Unmarshal(data, &spec); err == nil {
		return spec, nil
	}

	var raw interface{}
	if err := yaml.Unmarshal(data, &raw); err != nil {
		return nil, err
	}

	normalized := NormalizeYAML(raw)

	result, ok := normalized.(map[string]interface{})
	if !ok {
		return nil, fmt.Errorf("failed to parse OpenAPI spec")
	}

	return result, nil
}

func SchemaToExample(schema map[string]interface{}) interface{} {
	if schema == nil {
		return nil
	}

	if ex, ok := schema["example"]; ok {
		return ex
	}

	if def, ok := schema["default"]; ok {
		return def
	}

	typ := GetString(schema["type"])

	switch typ {
	case "string":
		if enum, ok := schema["enum"].([]interface{}); ok && len(enum) > 0 {
			return enum[0]
		}
		return "string"

	case "integer", "number":
		return 0

	case "boolean":
		return true

	case "array":
		items := GetMap(schema["items"])
		return []interface{}{SchemaToExample(items)}

	case "object":
		props := GetMap(schema["properties"])
		obj := map[string]interface{}{}
		for k, v := range props {
			obj[k] = SchemaToExample(GetMap(v))
		}
		return obj
	}

	return nil
}
