package common

import (
	"fmt"
	"math/rand"
	"net/http"
	"time"
)

func PingServerLoop(serverURL string) {
	fmt.Println("Server URL is: ", serverURL)
	if serverURL == "" {
		fmt.Println("Server URL is not set, skipping ping loop.")
		return
	}
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	for {
		minutes := r.Intn(5) + 10 // 10-14 inclusive
		fmt.Printf("Waiting %d minutes before pinging server...\n", minutes)
		time.Sleep(time.Duration(minutes) * time.Minute)
		resp, err := http.Get(serverURL)
		if err != nil {
			fmt.Printf("Ping failed: %v\n", err)
			continue
		}
		resp.Body.Close()
		if resp.StatusCode != http.StatusOK {
			fmt.Printf("Server returned non-200 status code: %d\n", resp.StatusCode)
			continue
		}
		fmt.Printf("Server is reachable, Status: %s\n", resp.Status)
	}
}