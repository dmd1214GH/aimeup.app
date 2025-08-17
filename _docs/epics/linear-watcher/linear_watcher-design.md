# Linear Watcher Design
Linear-Watcher (Watcher) is a batch program used coordinate work between Linear (issue tracking) and Claude Code (AI Agent).


## Watcher Process Overview:
1. Read Linear Issues (Linear API) in certain states
1. Prepare Issues for AI processing (attach prompts, format)
1. Invoke Claude Code terminals perform tasks defined by the prompt and Issue
1. Monitor for completion
1. Transmit results back to Linear (Linear API)

## Physical Footprint
Both the source code used to create the runtime Watcher, as well as the Watcher's runtime elements, will reside within the aimeup monorepo.  

```
/aimeup
  /.linear-watcher
    /prompts
      /... configurable prompt files .md
    /linear-watcher           # Runtime executable file
    /config.yaml
```


## config.yaml
```
linearurl: https://api.linear.app/graphql
#apiKey comes from $LINEAR_API_KEY; do not put secrets here
projects: <projects to scan>   # Whatever the API needs, config here
maxAgents: 3
promptFolder: 3
actions:
  - name: Groom
    promptFile: groom-prompt.md
    user: "Grooming Agent"
    when: { statusIn: ["Spec Needed"] }
    onComplete:
      setStatus: "Groom Review"    # optional; SSR MVP can ignore if comment-only
      reassignTo: "reporter"    # or explicit handle
  action:
    actionName: <Task>
    user: <tasking agent name>
    status: <tasking request status>
    prompt: </prompts file to use tasking request>
  action:
    actionName: <Deliver>
    user: <delivery agent name>
    status: <delivery request status>
    prompt: </prompts file to use delivery request>
  action:
    actionName: <Test>
    user: <testing agent name>
    status: <testing request status>
    prompt: </prompts file to use testing request>


```



