# Obsidian Tagger

An interactive CLI tool to update Obsidian markdown notes with AI-generated tags from YAML configuration files.

## Features

- Interactive multi-select interface to choose YAML files
- Automatically merges tags with existing frontmatter (no duplicates)
- Tracks processed YAML files to avoid reprocessing
- Colored terminal output for clear feedback
- Gracefully handles missing files and errors
- Preserves existing frontmatter fields

## Prerequisites

- Node.js 18+ and npm
- An Obsidian vault with daily notes in `Dailies/` folder

## Installation

1. Clone or download this repository
2. Install dependencies:

```bash
npm install
```

## Setup

Set the `OBSIDIAN_VAULT_PATH` environment variable to point to your Obsidian vault:

```bash
export OBSIDIAN_VAULT_PATH=/path/to/your/obsidian/vault
```

You can add this to your shell profile (`.bashrc`, `.zshrc`, etc.) to make it permanent.

## Usage

### 1. Generate YAML Configuration

Place your AI-generated YAML files in the `yamls/` directory. Each YAML file should have this structure:

```yaml
entries:
  - note: Dailies/2025-11-03.md
    tags:
      - work
      - meetings
      - project-alpha
  - note: Dailies/2025-11-04.md
    tags:
      - personal
      - learning
```

### 2. Run the Tool

Simply run the convenience script:

```bash
./run.sh
```

Or use npm directly:

```bash
npm run dev
```

The tool will:
1. Check for unprocessed YAML files
2. Show an interactive selection menu
3. Process selected files and update markdown notes
4. Track processed files in `states.json`

### 3. Example Output

```
🏷️  Obsidian Tagger CLI

Found 1 unprocessed YAML file(s):

  • 2025-11-dailies-tags.yaml (18 notes)

? Select YAML files to process: (Press <space> to select)
  ◉ 2025-11-dailies-tags.yaml

Processing 2025-11-dailies-tags.yaml...
  ✓ Dailies/2025-11-03.md - Added 6 tags
  ✓ Dailies/2025-11-04.md - Added 5 tags (2 new, 3 existing)
  ! Dailies/2025-11-05.md - File not found, skipping
  ...

═══════════════════════════════════════
Summary:
  ✓ Success: 17 notes updated
  ! Skipped: 1 note (file not found)
  ✗ Failed: 0 notes
═══════════════════════════════════════

State saved. Run again to see only unprocessed YAML files.
```

## How It Works

### Tag Merging

If a markdown file already has tags in its frontmatter:

**Before:**
```markdown
---
tags:
  - existing-tag
---

# My Daily Note
...
```

**After processing with new tags `[work, meetings]`:**
```markdown
---
tags:
  - existing-tag
  - work
  - meetings
---

# My Daily Note
...
```

The tool:
- Preserves existing tags
- Adds new tags that don't exist
- Removes duplicates
- Creates frontmatter if it doesn't exist

### State Tracking

The `states.json` file tracks which YAML files have been processed:

```json
{
  "processedYamls": [
    "2025-11-dailies-tags.yaml",
    "2025-12-dailies-tags.yaml"
  ]
}
```

When you run the tool again, it will only show YAML files that haven't been processed yet.

## Project Structure

```
obsidian-tagger/
├── src/
│   ├── index.ts                 # CLI entry point
│   ├── config/
│   │   └── constants.ts         # Environment variables & paths
│   ├── services/
│   │   ├── yamlService.ts       # YAML file operations
│   │   ├── markdownService.ts   # Markdown frontmatter handling
│   │   └── stateService.ts      # Persistence layer
│   ├── models/
│   │   └── types.ts             # TypeScript interfaces
│   └── utils/
│       └── tagMerger.ts         # Tag deduplication logic
├── yamls/                       # Place YAML config files here
├── states.json                  # Tracks processed files
├── package.json
└── tsconfig.json
```

## Building for Production

To build the TypeScript code:

```bash
npm run build
```

To run the built version:

```bash
npm start
```

## Troubleshooting

### Error: OBSIDIAN_VAULT_PATH environment variable is not set

Set the environment variable:

```bash
export OBSIDIAN_VAULT_PATH=/path/to/your/vault
```

### Error: Vault path does not exist

Verify the path is correct and the directory exists:

```bash
echo $OBSIDIAN_VAULT_PATH
ls $OBSIDIAN_VAULT_PATH
```

### Files are being skipped

Check that the note paths in your YAML files match the actual file paths in your vault. Paths are relative to `$OBSIDIAN_VAULT_PATH`.

### Want to reprocess a YAML file

Remove the filename from `states.json` and run the tool again.

## Development

The tool is built with:
- **TypeScript** - Type safety
- **inquirer** - Interactive CLI prompts
- **gray-matter** - Markdown frontmatter parsing
- **js-yaml** - YAML parsing
- **chalk** - Colored terminal output

### Development Mode

```bash
npm run dev
```

This uses `tsx` to run TypeScript directly without a build step.

## License

MIT
