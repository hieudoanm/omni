package colors

import "testing"

func TestColors(t *testing.T) {
	originalEnableColor := enableColor
	defer func() { enableColor = originalEnableColor }()

	enableColor = true
	if Green("test") != "\033[32mtest\033[0m" {
		t.Errorf("Green failed with color enabled")
	}
	if Red("test") != "\033[31mtest\033[0m" {
		t.Errorf("Red failed with color enabled")
	}
	if Yellow("test") != "\033[33mtest\033[0m" {
		t.Errorf("Yellow failed with color enabled")
	}
	if Dim("test") != "\033[2mtest\033[0m" {
		t.Errorf("Dim failed with color enabled")
	}
	if Cyan("test") != "\033[36mtest\033[0m" {
		t.Errorf("Cyan failed with color enabled")
	}
	if Blue("test") != "\033[34mtest\033[0m" {
		t.Errorf("Blue failed with color enabled")
	}
	if Gray("test") != "\033[90mtest\033[0m" {
		t.Errorf("Gray failed with color enabled")
	}
	if Bold("test") != "\033[1mtest\033[0m" {
		t.Errorf("Bold failed with color enabled")
	}

	enableColor = false
	if Green("test") != "test" {
		t.Errorf("Green failed with color disabled")
	}
	if Red("test") != "test" {
		t.Errorf("Red failed with color disabled")
	}
	if Yellow("test") != "test" {
		t.Errorf("Yellow failed with color disabled")
	}
	if Dim("test") != "test" {
		t.Errorf("Dim failed with color disabled")
	}
	if Cyan("test") != "test" {
		t.Errorf("Cyan failed with color disabled")
	}
	if Blue("test") != "test" {
		t.Errorf("Blue failed with color disabled")
	}
	if Gray("test") != "test" {
		t.Errorf("Gray failed with color disabled")
	}
	if Bold("test") != "test" {
		t.Errorf("Bold failed with color disabled")
	}
}
