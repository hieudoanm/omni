package hex

import (
	"encoding/json"
	"fmt"
	"strings"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/colors/internal"
	"github.com/spf13/cobra"
)

func convertHex(input string) string {
	var buf strings.Builder
	hex := internal.Hex(input)
	r, g, b, err := hex.ToRGB()
	if err != nil {
		fmt.Fprintln(&buf, "Error (RGB)  :", err)
		return strings.TrimRight(buf.String(), "\n")
	}
	fmt.Fprintf(&buf, "RGB    : rgb(%d, %d, %d)\n", r, g, b)
	hHSL, sHSL, lHSL, err := hex.ToHSL()
	if err != nil {
		fmt.Fprintln(&buf, "Error (HSL)  :", err)
	} else {
		fmt.Fprintf(&buf, "HSL    : h=%.2f°, s=%.2f%%, l=%.2f%%\n", hHSL, sHSL, lHSL)
	}
	hHCL, cHCL, lHCL, err := hex.ToHCL()
	if err != nil {
		fmt.Fprintln(&buf, "Error (HCL)  :", err)
	} else {
		fmt.Fprintf(&buf, "HCL    : h=%.2f°, c=%.2f, l=%.2f\n", hHCL, cHCL, lHCL)
	}
	oklL, oklC, oklH, err := hex.ToOKLCH()
	if err != nil {
		fmt.Fprintln(&buf, "Error (OKLCH):", err)
	} else {
		fmt.Fprintf(&buf, "OKLCH  : L=%.3f, C=%.3f, H=%.2f°\n", oklL, oklC, oklH)
	}
	cy, m, y, k, err := hex.ToCMYK()
	if err != nil {
		fmt.Fprintln(&buf, "Error (CMYK) :", err)
	} else {
		fmt.Fprintf(&buf, "CMYK   : C=%.3f, M=%.3f, Y=%.3f, K=%.3f\n", cy, m, y, k)
	}
	return strings.TrimRight(buf.String(), "\n")
}

func runHex(cmd *cobra.Command, args []string) error {
	jsonOutput, _ := cmd.Flags().GetBool("json")
	fmt.Print("HEX: ")
	var hexInput string
	fmt.Scanln(&hexInput)
	if jsonOutput {
		hex := internal.Hex(hexInput)
		r, g, b, _ := hex.ToRGB()
		hHCL, cHCL, lHCL, _ := hex.ToHCL()
		oklL, oklC, oklH, _ := hex.ToOKLCH()
		out, _ := json.MarshalIndent(map[string]interface{}{
			"hex":   hexInput,
			"rgb":   fmt.Sprintf("rgb(%d, %d, %d)", r, g, b),
			"hcl":   fmt.Sprintf("h=%.2f°, c=%.2f, l=%.2f", hHCL, cHCL, lHCL),
			"oklch": fmt.Sprintf("L=%.3f, C=%.3f, H=%.2f°", oklL, oklC, oklH),
		}, "", "  ")
		fmt.Println(string(out))
		return nil
	}
	fmt.Print(convertHex(hexInput))
	return nil
}
