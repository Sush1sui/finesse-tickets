package main

import (
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/Sush1sui/fns-tickets/internal/bot"
	"github.com/Sush1sui/fns-tickets/internal/common"
	"github.com/Sush1sui/fns-tickets/internal/config"
	"github.com/Sush1sui/fns-tickets/internal/server/routes"
)

func main() {
	err := config.New()
	if err != nil {
		fmt.Println("Error initializing configuration:", err)
	}

	addr := fmt.Sprintf(":%s", config.GlobalConfig.Port)
	router := routes.NewRouter()

	go func() {
		if err := http.ListenAndServe(addr, router); err != nil {
			fmt.Printf("Error starting server: %v\n", err)
		}
	}()

	go bot.StartBot()


	go func() {
		common.PingServerLoop(config.GlobalConfig.ServerUrl)
	}()

	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)
	<-sigChan
}
