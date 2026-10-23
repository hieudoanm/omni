package palette

import (
	"encoding/json"
	"fmt"
	"strings"

	"github.com/AlecAivazis/survey/v2"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/colors/internal"
	"github.com/spf13/cobra"
)

func computePalette(hex internal.Hex, style string) string {
	var buf strings.Builder
	h, s, l, err := hex.ToHSL()
	if err != nil {
		fmt.Fprintln(&buf, "Error converting to HSL:", err)
		return strings.TrimRight(buf.String(), "\n")
	}
	var baseH, supportH, accentH float64
	switch style {
	case "Balanced professional (Triadic)":
		baseH = h
		supportH = h + 120
		accentH = h + 240
	case "High-contrast (Complementary)":
		baseH = h
		supportH = h + 30
		accentH = h + 180
	case "Soft aesthetic (Analogous)":
		baseH = h
		supportH = h - 30
		accentH = h + 30
	}
	for _, hue := range []*float64{&baseH, &supportH, &accentH} {
		for *hue < 0 {
			*hue += 360
		}
		for *hue >= 360 {
			*hue -= 360
		}
	}
	baseHex := internal.HSLToHex(internal.HSL{H: baseH, S: s, L: l})
	supportHex := internal.HSLToHex(internal.HSL{H: supportH, S: s, L: l})
	accentHex := internal.HSLToHex(internal.HSL{H: accentH, S: s, L: l})
	fmt.Fprintln(&buf, "")
	fmt.Fprintf(&buf, "Generated Palette:\n")
	fmt.Fprintf(&buf, "Base:    %s  (H=%.0f)\n", baseHex, baseH)
	fmt.Fprintf(&buf, "Support: %s  (H=%.0f)\n", supportHex, supportH)
	fmt.Fprintf(&buf, "Accent:  %s  (H=%.0f)\n", accentHex, accentH)
	return strings.TrimRight(buf.String(), "\n")
}

func runPalette(cmd *cobra.Command, args []string) error {
	jsonOutput, _ := cmd.Flags().GetBool("json")
	style, _ := cmd.Flags().GetString("style")
	fmt.Print("Enter base HEX (e.g. #ff6600): ")
	var hexInput string
	fmt.Scanln(&hexInput)
	hexInput = strings.TrimSpace(hexInput)
	if !internal.IsValidHex(hexInput) {
		fmt.Println("Invalid hex color.")
		return nil
	}
	hex := internal.Hex(hexInput)
	selected := style
	if selected == "" {
		paletteOptions := []string{
			"Balanced professional (Triadic)",
			"High-contrast (Complementary)",
			"Soft aesthetic (Analogous)",
		}
		prompt := &survey.Select{
			Message: "Choose palette style:",
			Options: paletteOptions,
		}
		survey.AskOne(prompt, &selected)
	}
	if jsonOutput {
		h, s, l, _ := hex.ToHSL()
		var baseH, supportH, accentH float64
		switch selected {
		case "Balanced professional (Triadic)":
			baseH = h
			supportH = h + 120
			accentH = h + 240
		case "High-contrast (Complementary)":
			baseH = h
			supportH = h + 30
			accentH = h + 180
		case "Soft aesthetic (Analogous)":
			baseH = h
			supportH = h - 30
			accentH = h + 30
		}
		for _, hue := range []*float64{&baseH, &supportH, &accentH} {
			for *hue < 0 {
				*hue += 360
			}
			for *hue >= 360 {
				*hue -= 360
			}
		}
		out, _ := json.MarshalIndent(map[string]interface{}{
			"palette": []string{
				internal.HSLToHex(internal.HSL{H: baseH, S: s, L: l}),
				internal.HSLToHex(internal.HSL{H: supportH, S: s, L: l}),
				internal.HSLToHex(internal.HSL{H: accentH, S: s, L: l}),
			},
		}, "", "  ")
		fmt.Println(string(out))
		return nil
	}
	fmt.Print(computePalette(hex, selected))
	return nil
}
