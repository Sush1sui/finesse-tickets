package common

import (
	"fmt"
	"runtime"
	"time"
)

func TrackMemoryUsage() {
	var m runtime.MemStats

	for {
		// Read current memory statistics into 'm'
		runtime.ReadMemStats(&m)

		// Clear the console (using ANSI escape codes)
		fmt.Print("\033[H\033[2J")

		fmt.Println("--- Go Memory Monitor (Live) ---")
		fmt.Printf("Time: %s\n", time.Now().Format("15:04:05"))
		fmt.Println("--------------------------------")

		// Convert bytes to MB for readability
		allocMB := float64(m.Alloc) / 1024 / 1024
		sysMB := float64(m.Sys) / 1024 / 1024
		totalAllocMB := float64(m.TotalAlloc) / 1024 / 1024

		// Print the stats
		fmt.Printf("Alloc (Heap): %8.2f MB\n", allocMB)
		fmt.Printf("Sys (OS RAM): %8.2f MB\n", sysMB)
		fmt.Printf("TotalAlloc  : %8.2f MB\n", totalAllocMB)
		fmt.Printf("Num GC      : %8d\n", m.NumGC)

		fmt.Println("--------------------------------")
		fmt.Println("Press Ctrl+C to stop")

		// Wait 1 second before updating again
		time.Sleep(1 * time.Second)
	}
}