# linear-watcher
Custom tool designed to watch linear activity and initiate ClaudeCode agents to refine Issues and deliver functionality.

## Working Folder
At install time, a working folder is established into the workspace:
    `./.linear-watcher`
This is the runtime folder used by the linear-watcher framework

```bash
/aimeup                                 # package root
  /.linear-watcher                      # .gitignore
    /prompts                            # Deployment target for all prompts. Packages install here for ic-runner to use
    /config.json                        # config file
    /work                               # Default location for the work folder
      /lcr-<linearid>                   # each issue processed gets a dedicted work folder
        /issue-operation-log.md         # High-level log that is appended to as operations are performed
        /op-<operation>-YYYYMMDDHHMMSS  # Each operation attempt gets a dedicated folder
          /master-prompt-YYYYMMDDHHMMSS.md     # Merged prompt constructed for the operation run
          /<linearid>-original-issue.md # Issue body before being processed by the operation
          /<linearid>-updated-issue.md  # Issue body after updates were performed by the operation
          /<linearid>-comment-<X>.md    # comments to be added to the issue, sequenced if multiple
          /context-dump.md              # CC's context dump at the end of its operation
          /operation-report.json        # Small json showing ClaudeCode's opinion about the status of the run
```

## lc-runner
This command-line tool (lc-runner) automates execution of predefined workflows based on Linear issue status. When a developer provides an issue ID, the tool checks its status, maps it to a configured command, prepares a run folder, and invokes Claude Code in headless mode. It persists execution context and updates Linear with success or failure.

It can support these operations:
- `Tasking` - Create tasks required to delivery Issues that are in the state of `Tasking-ai`
- `Delivery
