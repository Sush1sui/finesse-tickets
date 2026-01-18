package common

import "fmt"

func parseColor(colorStr string) int {
	if len(colorStr) > 0 && colorStr[0] == '#' {
		colorStr = colorStr[1:]
	}

	var colorInt int64
	fmt.Sscanf(colorStr, "%x", &colorInt)
	if colorInt == 0 {
		return 0x5865F2 // Default to Discord blurple
	}
	return int(colorInt)
}