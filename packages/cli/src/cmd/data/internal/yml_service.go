package internal

import (
	"encoding/json"
	"fmt"

	"gopkg.in/yaml.v3"
)

func ParseYAML(input []byte) (interface{}, error) {
	var data interface{}
	if err := yaml.Unmarshal(input, &data); err != nil {
		return nil, fmt.Errorf("parse yaml: %w", err)
	}
	return data, nil
}

func ValidateYAML(input []byte) error {
	var data interface{}
	return yaml.Unmarshal(input, &data)
}

func FormatYAML(data interface{}) (string, error) {
	out, err := yaml.Marshal(&data)
	if err != nil {
		return "", err
	}
	return string(out), nil
}

func ConvertYAMLToJSON(data interface{}) string {
	b, _ := json.MarshalIndent(data, "", "  ")
	return string(b)
}
