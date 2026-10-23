package oklch

import (
	"encoding/json"
	"fmt"
	"strings"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/colors/internal"
	"github.com/spf13/cobra"
)

func convertOKLCH(L, C, H float64) string {
	var buf strings.Builder
	oklch := internal.OKLCH{L: L, C: C, H: H}
	r, g, b, err := oklch.ToRGB()
	if err != nil {
		fmt.Fprintln(&buf, "Error (RGB)  :", err)
		return strings.TrimRight(buf.String(), "\n")
	}
	rgb := internal.RGB{R: r, G: g, B: b}
	hex, _ := rgb.ToHex()
	fmt.Fprintf(&buf, "HEX    : %s\n", hex)
	fmt.Fprintf(&buf, "RGB    : rgb(%d, %d, %d)\n", r, g, b)
	hHSL, sHSL, lHSL, _ := rgb.ToHSL()
	fmt.Fprintf(&buf, "HSL    : h=%.2f°, s=%.2f%%, l=%.2f%%\n", hHSL, sHSL, lHSL)
	hHCL, cHCL, lHCL, _ := rgb.ToHCL()
	fmt.Fprintf(&buf, "HCL    : h=%.2f°, c=%.2f, l=%.2f\n", hHCL, cHCL, lHCL)
	fmt.Fprintf(&buf, "OKLCH  : L=%.3f, C=%.3f, H=%.2f°\n", L, C, H)
	cy, m, y, k, _ := rgb.ToCMYK()
	fmt.Fprintf(&buf, "CMYK   : C=%.3f, M=%.3f, Y=%.3f, K=%.3f\n", cy, m, y, k)
	return strings.TrimRight(buf.String(), "\n")
}

func runOKLCH(cmd *cobra.Command, args []string) error {
	jsonOutput, _ := cmd.Flags().GetBool("json")
	var L, C, H float64
	fmt.Print("Lightness (0–1) : ")
	fmt.Scanln(&L)
	fmt.Print("Chroma (0–1)    : ")
	fmt.Scanln(&C)
	fmt.Print("Hue (0–360)     : ")
	fmt.Scanln(&H)
	if jsonOutput {
		oklch := internal.OKLCH{L: L, C: C, H: H}
		r, g, b, _ := oklch.ToRGB()
		hex, _ := internal.RGB{R: r, G: g, B: b}.ToHex()
		hHCL, cHCL, lHCL, _ := internal.RGB{R: r, G: g, B: b}.ToHCL()
		out, _ := json.MarshalIndent(map[string]interface{}{
			"hex":   hex,
			"rgb":   fmt.Sprintf("rgb(%d, %d, %d)", r, g, b),
			"hcl":   fmt.Sprintf("h=%.2f°, c=%.2f, l=%.2f", hHCL, cHCL, lHCL),
			"oklch": fmt.Sprintf("L=%.3f, C=%.3f, H=%.2f°", L, C, H),
		}, "", "  ")
		fmt.Println(string(out))
		return nil
	}
	fmt.Print(convertOKLCH(L, C, H))
	return nil
}
