package internal

import (
	"testing"
)

func TestResolveText_WithArgs(t *testing.T) {
	text, err := ResolveText([]string{"hello"})
	if err != nil {
		t.Fatal(err)
	}
	if text != "hello" {
		t.Errorf("ResolveText = %q, want %q", text, "hello")
	}
}

func TestResolveText_MultipleArgs(t *testing.T) {
	text, err := ResolveText([]string{"first", "second"})
	if err != nil {
		t.Fatal(err)
	}
	if text != "first" {
		t.Errorf("ResolveText = %q, want %q", text, "first")
	}
}

func TestResolveText_EmptyArgs(t *testing.T) {
	_, err := ResolveText([]string{})
	if err == nil {
		t.Skip("interactive survey succeeded (running in a terminal)")
	}
}

func TestToBraille(t *testing.T) {
	if ToBraille("hello") != "⠓⠑⠇⠇⠕" {
		t.Errorf(`ToBraille("hello") = %q`, ToBraille("hello"))
	}
	if ToBraille("Hello") != "⠓⠑⠇⠇⠕" {
		t.Errorf(`ToBraille("Hello") = %q`, ToBraille("Hello"))
	}
}

func TestToMorse(t *testing.T) {
	if ToMorse("sos") != "... --- ..." {
		t.Errorf(`ToMorse("sos") = %q`, ToMorse("sos"))
	}
	if ToMorse("SOS") != "... --- ..." {
		t.Errorf(`ToMorse("SOS") = %q`, ToMorse("SOS"))
	}
}

func TestCapitalise(t *testing.T) {
	if Capitalise("hello world") != "Hello World" {
		t.Errorf(`Capitalise("hello world") = %q`, Capitalise("hello world"))
	}
	if Capitalise("") != "" {
		t.Errorf(`Capitalise("") = %q`, Capitalise(""))
	}
}

func TestDeburr(t *testing.T) {
	if Deburr("héllo wörld") != "hello world" {
		t.Errorf(`Deburr("héllo wörld") = %q`, Deburr("héllo wörld"))
	}
	if Deburr("café") != "cafe" {
		t.Errorf(`Deburr("café") = %q`, Deburr("café"))
	}
}

func TestToKebabCase(t *testing.T) {
	if ToKebabCase("helloWorld") != "hello-world" {
		t.Errorf(`ToKebabCase("helloWorld") = %q`, ToKebabCase("helloWorld"))
	}
	if ToKebabCase("Hello World") != "hello-world" {
		t.Errorf(`ToKebabCase("Hello World") = %q`, ToKebabCase("Hello World"))
	}
}

func TestToSnakeCase(t *testing.T) {
	if ToSnakeCase("helloWorld") != "hello_world" {
		t.Errorf(`ToSnakeCase("helloWorld") = %q`, ToSnakeCase("helloWorld"))
	}
	if ToSnakeCase("Hello World") != "hello_world" {
		t.Errorf(`ToSnakeCase("Hello World") = %q`, ToSnakeCase("Hello World"))
	}
}

func TestToCamelCase(t *testing.T) {
	if ToCamelCase("hello world") != "helloWorld" {
		t.Errorf(`ToCamelCase("hello world") = %q`, ToCamelCase("hello world"))
	}
	if ToCamelCase("Hello-World") != "helloWorld" {
		t.Errorf(`ToCamelCase("Hello-World") = %q`, ToCamelCase("Hello-World"))
	}
}

func TestToPascalCase(t *testing.T) {
	if ToPascalCase("hello world") != "HelloWorld" {
		t.Errorf(`ToPascalCase("hello world") = %q`, ToPascalCase("hello world"))
	}
	if ToPascalCase("hello_world") != "HelloWorld" {
		t.Errorf(`ToPascalCase("hello_world") = %q`, ToPascalCase("hello_world"))
	}
}

func TestSlug(t *testing.T) {
	if Slug("Hello World!") != "hello-world" {
		t.Errorf(`Slug("Hello World!") = %q`, Slug("Hello World!"))
	}
	if Slug("  extra  spaces  ") != "extra-spaces" {
		t.Errorf(`Slug("  extra  spaces  ") = %q`, Slug("  extra  spaces  "))
	}
}
