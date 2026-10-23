package serve

import (
	"testing"

	"github.com/spf13/cobra"
)

func TestTakesArgs_nil(t *testing.T) {
	cmd := &cobra.Command{}
	if !takesArgs(cmd) {
		t.Error("expected takesArgs to be true for nil Args")
	}
}

func TestTakesArgs_NoArgs(t *testing.T) {
	cmd := &cobra.Command{}
	cmd.Args = cobra.NoArgs
	got := takesArgs(cmd)
	if !got {
		t.Error("expected takesArgs to be true for NoArgs (current behavior)")
	}
}

func TestTakesArgs_ExactArgs(t *testing.T) {
	cmd := &cobra.Command{}
	cmd.Args = cobra.ExactArgs(1)
	if !takesArgs(cmd) {
		t.Error("expected takesArgs to be true for ExactArgs")
	}
}

func TestTakesArgs_MinimumNArgs(t *testing.T) {
	cmd := &cobra.Command{}
	cmd.Args = cobra.MinimumNArgs(1)
	if !takesArgs(cmd) {
		t.Error("expected takesArgs to be true for MinimumNArgs")
	}
}

func TestBuildSchema_noFlags(t *testing.T) {
	cmd := &cobra.Command{Use: "test"}
	schema := buildSchema(cmd)
	if schema.Type != "object" {
		t.Errorf("type = %q, want %q", schema.Type, "object")
	}
	if _, ok := schema.Properties["_args"]; !ok {
		t.Error("expected _args property when no flags")
	}
	if schema.Properties["_args"].Type != "array" {
		t.Errorf("_args type = %q, want %q", schema.Properties["_args"].Type, "array")
	}
}

func TestBuildSchema_withFlags(t *testing.T) {
	cmd := &cobra.Command{Use: "test"}
	cmd.Flags().String("name", "", "name description")
	cmd.Flags().Bool("verbose", false, "verbose mode")
	cmd.Flags().Int("count", 0, "count value")
	cmd.Flags().Float64("rate", 0, "rate value")
	cmd.Flags().StringSlice("items", nil, "item list")

	schema := buildSchema(cmd)

	props := schema.Properties

	if p, ok := props["name"]; !ok {
		t.Error("missing 'name' property")
	} else if p.Type != "string" {
		t.Errorf("name type = %q, want %q", p.Type, "string")
	}

	if p, ok := props["verbose"]; !ok {
		t.Error("missing 'verbose' property")
	} else if p.Type != "boolean" {
		t.Errorf("verbose type = %q, want %q", p.Type, "boolean")
	}

	if p, ok := props["count"]; !ok {
		t.Error("missing 'count' property")
	} else if p.Type != "integer" {
		t.Errorf("count type = %q, want %q", p.Type, "integer")
	}

	if p, ok := props["rate"]; !ok {
		t.Error("missing 'rate' property")
	} else if p.Type != "number" {
		t.Errorf("rate type = %q, want %q", p.Type, "number")
	}

	if p, ok := props["items"]; !ok {
		t.Error("missing 'items' property")
	} else if p.Type != "array" {
		t.Errorf("items type = %q, want %q", p.Type, "array")
	} else if p.Items == nil || p.Items.Type != "string" {
		t.Errorf("items items type = %v, want &{string}", p.Items)
	}

	if _, ok := props["help"]; ok {
		t.Error("help flag should not appear in schema")
	}
}

func TestBuildSchema_flagDefault(t *testing.T) {
	cmd := &cobra.Command{Use: "test"}
	cmd.Flags().String("name", "world", "name to greet")
	cmd.Flags().Int("count", 5, "repeat count")

	schema := buildSchema(cmd)

	if p, ok := schema.Properties["name"]; !ok {
		t.Error("missing 'name'")
	} else if p.Default != "world" {
		t.Errorf("name default = %v, want %q", p.Default, "world")
	}

	if p, ok := schema.Properties["count"]; !ok {
		t.Error("missing 'count'")
	} else if p.Default != "5" {
		t.Errorf("count default = %v, want %q", p.Default, "5")
	}
}

func TestBuildSchema_boolDefaultFalse(t *testing.T) {
	cmd := &cobra.Command{Use: "test"}
	cmd.Flags().Bool("verbose", false, "verbose")

	schema := buildSchema(cmd)
	if p, ok := schema.Properties["verbose"]; ok {
		if p.Default != nil {
			t.Errorf("expected nil default for bool with false default, got %v", p.Default)
		}
	}
}

func TestBuildSchema_usesShortDescriptionForEmptyLong(t *testing.T) {
	cmd := &cobra.Command{
		Use:   "test",
		Short: "short desc",
	}
	cmd.Flags().String("name", "", "name flag")
	cmd.Flags().Bool("verbose", false, "verbose flag")

	schema := buildSchema(cmd)

	if p, ok := schema.Properties["name"]; !ok {
		t.Error("missing 'name'")
	} else if p.Description != "name flag" {
		t.Errorf("name description = %q, want %q", p.Description, "name flag")
	}
}

func TestBuildSchema_flagDescription(t *testing.T) {
	cmd := &cobra.Command{Use: "test"}
	cmd.Flags().String("output", "", "path to output file")

	schema := buildSchema(cmd)
	p, ok := schema.Properties["output"]
	if !ok {
		t.Fatal("missing 'output' property")
	}
	if p.Description != "path to output file" {
		t.Errorf("description = %q, want %q", p.Description, "path to output file")
	}
}

func TestBuildSchema_alwaysHasArgsProperty(t *testing.T) {
	cmd := &cobra.Command{Use: "test"}
	schema := buildSchema(cmd)
	if _, ok := schema.Properties["_args"]; !ok {
		t.Error("expected _args property")
	}
}

func TestBuildSchema_schemaStructure(t *testing.T) {
	cmd := &cobra.Command{Use: "test"}
	cmd.Flags().String("name", "", "name")
	schema := buildSchema(cmd)

	if schema.Type != "object" {
		t.Errorf("schema type = %q, want %q", schema.Type, "object")
	}
	if len(schema.Properties) < 2 {
		t.Errorf("expected at least 2 properties (name + _args), got %d", len(schema.Properties))
	}
	if schema.Required != nil {
		t.Errorf("expected nil Required, got %v", schema.Required)
	}
}

func TestBuildSchema_nilArgsWithFlags(t *testing.T) {
	cmd := &cobra.Command{Use: "test"}
	cmd.Args = nil
	cmd.Flags().String("name", "", "name flag")

	schema := buildSchema(cmd)
	if _, ok := schema.Properties["name"]; !ok {
		t.Error("expected 'name' property")
	}
	if _, ok := schema.Properties["_args"]; !ok {
		t.Error("expected _args property when Args is nil")
	}
}
