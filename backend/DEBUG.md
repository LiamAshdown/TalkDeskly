# Debugging Go with Air

This project is configured to use Air for live reloading and VSCode for debugging.

## Prerequisites

Make sure you have the following tools installed:

1. **Delve** (Go debugger):

   ```bash
   go install github.com/go-delve/delve/cmd/dlv@latest
   ```

2. **Air** (Live reloading):
   ```bash
   go install github.com/cosmtrek/air@latest
   ```

## Debugging Process

You can now debug your application in one of two ways:

### Option 1: One-Click Debug (Recommended)

Simply use the "Attach to Air" debug configuration, which will:

1. Start Air automatically (via the "Start Air" task)
2. Attach the debugger to the running application

Steps:

- In VSCode, go to the Run and Debug panel (Ctrl+Shift+D)
- Select "Attach to Air" from the dropdown menu
- Click the green play button or press F5
- The terminal will open showing Air's output, and the debugger will attach automatically

### Option 2: Manual Steps

If you prefer to start Air separately:

1. **Start Air with debugging enabled**:

   You can start Air in two ways:

   **Option 1**: Using the VSCode task:

   - Press `Ctrl+Shift+P` and search for "Tasks: Run Task"
   - Select "Start Air" from the task list

   **Option 2**: Using the terminal:

   ```bash
   cd backend
   air
   ```

   Or use the local binary:

   ```bash
   cd backend
   ./bin/air.exe
   ```

   This will start your application with the Delve debugger running on port 2345.

2. **Attach VSCode debugger manually**:

   - In VSCode, go to the Run and Debug panel (Ctrl+Shift+D)
   - Right-click "Attach to Air" and select "Start Without Debugging" (this skips the preLaunchTask)
   - The debugger will attach to the already running Air process

## Using the Debugger

Once attached:

- Set breakpoints in your code
- The debugger will stop at your breakpoints
- You can inspect variables, step through code, etc.
- Air will still automatically reload your application when files change

## How It Works

The `.air.toml` configuration runs your application through Delve in headless mode, which allows VSCode to connect to it.

When you make changes to your code:

1. Air will rebuild your application
2. Delve will restart the application
3. Your VSCode debugger will remain attached

## Troubleshooting

- If the debugger doesn't connect, make sure port 2345 is not in use by another application
- You may need to restart Air if you encounter issues with the debugger
- Check the "Debug Console" in VSCode for error messages
- If Air is already running when you try to debug, you'll need to stop it first or use the "Start Without Debugging" approach
