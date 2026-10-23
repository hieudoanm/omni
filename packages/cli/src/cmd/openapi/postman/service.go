package postman

import (
	"encoding/json"
	"fmt"
	"strings"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/openapi/internal"
)

func convertToPostman(spec internal.JSON) (internal.JSON, error) {
	info := internal.JSON{
		"name":        "Imported Collection",
		"_postman_id": "auto-generated",
		"description": "",
		"schema":      "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
	}

	if i := internal.GetMap(spec["info"]); i != nil {
		if t := internal.GetString(i["title"]); t != "" {
			info["name"] = t
		}
		if d := internal.GetString(i["description"]); d != "" {
			info["description"] = d
		}
	}

	var baseURL string
	if servers := internal.GetSlice(spec["servers"]); len(servers) > 0 {
		if s := internal.GetMap(servers[0]); s != nil {
			baseURL = internal.GetString(s["url"])
		}
	}

	tagMap := map[string][]internal.JSON{}

	paths := internal.GetMap(spec["paths"])
	if paths == nil {
		return nil, fmt.Errorf("invalid paths (check YAML structure)")
	}

	for path, methodsRaw := range paths {
		methods := internal.GetMap(methodsRaw)

		for method, opRaw := range methods {
			op := internal.GetMap(opRaw)

			tag := "default"
			if tags := internal.GetSlice(op["tags"]); len(tags) > 0 {
				tag = internal.GetString(tags[0])
			}

			name := strings.ToUpper(method) + " " + path
			if s := internal.GetString(op["summary"]); s != "" {
				name = s
			}

			var query []internal.JSON
			var pathVars []internal.JSON
			var headers []internal.JSON

			for _, pRaw := range internal.GetSlice(op["parameters"]) {
				p := internal.GetMap(pRaw)
				in := internal.GetString(p["in"])

				param := internal.JSON{
					"key":         internal.GetString(p["name"]),
					"value":       "",
					"description": internal.GetString(p["description"]),
				}

				if ex := p["example"]; ex != nil {
					param["value"] = fmt.Sprintf("%v", ex)
				}

				switch in {
				case "query":
					query = append(query, param)
				case "path":
					pathVars = append(pathVars, param)
				case "header":
					headers = append(headers, param)
				}
			}

			var body interface{}
			content := internal.GetMap(internal.GetMap(op["requestBody"])["content"])

			if mt := internal.GetMap(content["application/json"]); mt != nil {
				ex := mt["example"]

				if ex == nil {
					if examples := internal.GetMap(mt["examples"]); examples != nil {
						for _, v := range examples {
							ex = internal.GetMap(v)["value"]
							break
						}
					}
				}

				if ex == nil {
					ex = internal.SchemaToExample(internal.GetMap(mt["schema"]))
				}

				raw, _ := json.MarshalIndent(ex, "", "  ")

				body = internal.JSON{
					"mode": "raw",
					"raw":  string(raw),
					"options": internal.JSON{
						"raw": internal.JSON{"language": "json"},
					},
				}

				headers = append(headers, internal.JSON{
					"key":   "Content-Type",
					"value": "application/json",
				})
			}

			rawURL := baseURL + path

			req := internal.JSON{
				"method": strings.ToUpper(method),
				"header": headers,
				"url": internal.JSON{
					"raw":      rawURL,
					"path":     strings.Split(strings.Trim(path, "/"), "/"),
					"query":    query,
					"variable": pathVars,
				},
				"description": internal.GetString(op["description"]),
			}

			if body != nil {
				req["body"] = body
			}

			item := internal.JSON{
				"name":     name,
				"request":  req,
				"response": []interface{}{},
			}

			tagMap[tag] = append(tagMap[tag], item)
		}
	}

	var folders []internal.JSON
	for tag, items := range tagMap {
		folders = append(folders, internal.JSON{
			"name": tag,
			"item": items,
		})
	}

	return internal.JSON{
		"info": info,
		"item": folders,
		"variable": []internal.JSON{
			{
				"key":   "baseUrl",
				"value": baseURL,
				"type":  "string",
			},
		},
	}, nil
}
