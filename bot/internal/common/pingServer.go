package common

import (
	"math/rand"
	"net/http"
	"time"
)

func PingServerLoop(serverURL string) {
	if serverURL == "" {
		return
	}
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	for {
		minutes := r.Intn(5) + 10 // 10-14 inclusive
		time.Sleep(time.Duration(minutes) * time.Minute)
		resp, err := http.Get(serverURL)
		if err != nil {
			continue
		}
		resp.Body.Close()
	}
}