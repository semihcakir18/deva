# deva

A simple CLI tool to quickly launch your projects from anywhere.

## What it does

Saves project paths and their startup commands so you can run them from any directory without navigating to the project folder. That's it.

## Installation

```bash
npm install -g deva
```

## Usage

### Add a project

Navigate to your project directory and run:

```bash
deva add
```

You'll be prompted for a project name and the command to run it.

### List projects

```bash
deva list                    # Show all saved projects
deva list <project-name>     # Show details for a specific project
```

### Run a project

```bash
deva run <project-name>      # Run a saved project
deva <project-name>          # Shorthand (same as above)
```

### Help

```bash
deva --help
deva -h
```

## Example workflow

```bash
# In your project directory
cd ~/projects/my-app
deva add
# Enter project name: my-app
# Enter command: npm run dev

# Later, from anywhere
deva my-app
# Runs "npm run dev" in ~/projects/my-app
```

## Config

Projects are stored in `~/.deva/config.json`. You can edit this file manually if needed.

## License

MIT
