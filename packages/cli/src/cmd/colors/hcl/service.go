package hcl

import (
	"encoding/json"
	"fmt"
	"strings"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/colors/internal"
	"github.com/spf13/cobra"
)

func convertHCL(h, c, l float64) string {
	var buf strings.Builder
	hcl := internal.HCL{H: h, C: c, L: l}
	r, g, b, err := hcl.ToRGB()
	if err != nil {
		fmt.Fprintln(&buf, "Error (RGB)  :", err)
		return strings.TrimRight(buf.String(), "\n")
	}
	rgb := internal.RGB{R: r, G: g, B: b}
	hex, err := rgb.ToHex()
	if err != nil {
		fmt.Fprintln(&buf, "Error (HEX)  :", err)
	} else {
		fmt.Fprintf(&buf, "HEX    : %s\n", hex)
	}
	if !rgb.IsValid() {
		fmt.Fprintln(&buf, "Error (RGB)  : invalid RGB values")
	} else {
		fmt.Fprintf(&buf, "RGB    : rgb(%d, %d, %d)\n", r, g, b)
	}
	hHSL, sHSL, lHSL, err := rgb.ToHSL()
	if hHSL < 0 || sHSL < 0 || lHSL < 0 || err != nil {
		fmt.Fprintln(&buf, "Error (HSL)  : conversion failed")
	} else {
		fmt.Fprintf(&buf, "HSL    : h=%.2f°, s=%.2f%%, l=%.2f%%\n", hHSL, sHSL, lHSL)
	}
	oklL, oklC, oklH, err := rgb.ToOKLCH()
	if oklL < 0 || oklC < 0 || oklH < 0 || err != nil {
		fmt.Fprintln(&buf, "Error (OKLCH): conversion failed")
	} else {
		fmt.Fprintf(&buf, "OKLCH  : L=%.3f, C=%.3f, H=%.2f°\n", oklL, oklC, oklH)
	}
	cy, m, y, k, err := rgb.ToCMYK()
	if cy < 0 || m < 0 || y < 0 || k < 0 || err != nil {
		fmt.Fprintln(&buf, "Error (CMYK) : conversion failed")
	} else {
		fmt.Fprintf(&buf, "CMYK   : C=%.3f, M=%.3f, Y=%.3f, K=%.3f\n", cy, m, y, k)
	}
	return strings.TrimRight(buf.String(), "\n")
}

func runHCL(cmd *cobra.Command, args []string) error {
	jsonOutput, _ := cmd.Flags().GetBool("json")
	var h, c, l float64
	fmt.Print("Hue (0–360)      : ")
	fmt.Scanln(&h)
	fmt.Print("Chroma (0–100)   : ")
	fmt.Scanln(&c)
	fmt.Print("Lightness (0–100): ")
	fmt.Scanln(&l)
	if jsonOutput {
		hcl := internal.HCL{H: h, C: c, L: l}
		r, g, b, _ := hcl.ToRGB()
		hex, _ := internal.RGB{R: r, G: g, B: b}.ToHex()
		oklL, oklC, oklH, _ := internal.RGB{R: r, G: g, B: b}.ToOKLCH()
		out, _ := json.MarshalIndent(map[string]interface{}{
			"hex":   hex,
			"rgb":   fmt.Sprintf("rgb(%d, %d, %d)", r, g, b),
			"hcl":   fmt.Sprintf("h=%.2f°, c=%.2f, l=%.2f", h, c, l),
			"oklch": fmt.Sprintf("L=%.3f, C=%.3f, H=%.2f°", oklL, oklC, oklH),
		}, "", "  ")
		fmt.Println(string(out))
		return nil
	}
	fmt.Print(convertHCL(h, c, l))
	return nil
}
