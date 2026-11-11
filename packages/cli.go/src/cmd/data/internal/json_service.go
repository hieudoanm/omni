package internal

import (
	"encoding/json"
	"fmt"
	"os"
	"strings"
)

func ParseJSON(input []byte) (interface{}, error) {
	var data interface{}
	if err := json.Unmarshal(input, &data); err != nil {
		return nil, fmt.Errorf("parse json: %w", err)
	}
	return data, nil
}

func OutputJSON(data interface{}) string {
	b, _ := json.MarshalIndent(data, "", "  ")
	return string(b)
}

func JSONDiff(file1, file2 string) error {
	a, err := os.ReadFile(file1)
	if err != nil {
		return fmt.Errorf("read %s: %w", file1, err)
	}
	b, err := os.ReadFile(file2)
	if err != nil {
		return fmt.Errorf("read %s: %w", file2, err)
	}

	var va, vb interface{}
	json.Unmarshal(a, &va)
	json.Unmarshal(b, &vb)

	ba, _ := json.MarshalIndent(va, "", "  ")
	bb, _ := json.MarshalIndent(vb, "", "  ")

	linesA := strings.Split(string(ba), "\n")
	linesB := strings.Split(string(bb), "\n")

	max := len(linesA)
	if len(linesB) > max {
		max = len(linesB)
	}

	for i := 0; i < max; i++ {
		var la, lb string
		if i < len(linesA) {
			la = linesA[i]
		}
		if i < len(linesB) {
			lb = linesB[i]
		}
		if la != lb {
			if la != "" {
				fmt.Printf("- %s\n", la)
			}
			if lb != "" {
				fmt.Printf("+ %s\n", lb)
			}
		}
	}
	return nil
}

func JSONMerge(baseFile, patchFile string) error {
	base, err := os.ReadFile(baseFile)
	if err != nil {
		return fmt.Errorf("read base: %w", err)
	}
	patch, err := os.ReadFile(patchFile)
	if err != nil {
		return fmt.Errorf("read patch: %w", err)
	}

	var baseMap, patchMap map[string]interface{}
	if err := json.Unmarshal(base, &baseMap); err != nil {
		return fmt.Errorf("parse base: %w", err)
	}
	if err := json.Unmarshal(patch, &patchMap); err != nil {
		return fmt.Errorf("parse patch: %w", err)
	}

	for k, v := range patchMap {
		baseMap[k] = v
	}

	out, err := json.MarshalIndent(baseMap, "", "  ")
	if err != nil {
		return err
	}
	fmt.Println(string(out))
	return nil
}

func JSONQuery(data interface{}, query string) (interface{}, error) {
	parts := strings.Split(query, ".")
	current := data
	for _, part := range parts {
		if part == "" {
			continue
		}
		if strings.HasSuffix(part, "]") {
			idx := strings.Index(part, "[")
			if idx >= 0 {
				key := part[:idx]
				var arrIdx int
				fmt.Sscanf(part[idx+1:len(part)-1], "%d", &arrIdx)

				if key != "" {
					m, ok := current.(map[string]interface{})
					if !ok {
						return nil, fmt.Errorf("expected object at %s", key)
					}
					current = m[key]
				}

				arr, ok := current.([]interface{})
				if !ok {
					return nil, fmt.Errorf("expected array at index %d", arrIdx)
				}
				if arrIdx >= len(arr) {
					return nil, fmt.Errorf("index %d out of bounds", arrIdx)
				}
				current = arr[arrIdx]
			}
		} else {
			m, ok := current.(map[string]interface{})
			if !ok {
				return nil, fmt.Errorf("expected object at %s", part)
			}
			var found bool
			current, found = m[part]
			if !found {
				return nil, fmt.Errorf("key %s not found", part)
			}
		}
	}
	return current, nil
}
