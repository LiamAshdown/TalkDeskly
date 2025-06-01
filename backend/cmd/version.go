package cmd

import (
	"fmt"

	"github.com/spf13/cobra"
)

var versionCmd = &cobra.Command{
	Use:   "version",
	Short: "Print the version number of TalkDeskly",
	Long:  `All software has versions. This is TalkDeskly's`,
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("TalkDeskly v0.0.1")
		fmt.Println("A modern chat application built with Go and React")
	},
}

func init() {
	rootCmd.AddCommand(versionCmd)
}
