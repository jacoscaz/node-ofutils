
# ofutils

A collection of utility scripts for the OmniFocus task manager.

This project was born mainly out the author's frustration with the lack of time
tracking in OmniFocus and some curiosity towards the relatively new support for
JavaScript as an alternative to AppleScript in Mac OS automation (JXA).

## Status

Pre-alpha.

## Installation

```sh
npm i -g ofutils@alpha
ofutils --help
```

## Reports

```shell
ofutils report --help
Usage: ofutils-report [options]

Options:
  -t, --type <type>          report type (default: "time-spent")
  -g, --group-by <criteria>  grouping criteria (default: "date,project,task")
  -s, --sort <directions>    sorting directions (default: "desc,asc,asc")
  -f, --from <date>          from date (default: "2019-08-01")
  -t, --to <date>            to date (default: "2019-08-21")
  -h, --help                 output usage information
```

The report command is the entry point for all the reporting features. Reports
are rendered to a terminal GUI.

![terminal-based report GUI](https://raw.githubusercontent.com/jacoscaz/node-ofutils/master/screenshots/example-report.png "Gotta love terminal GUIs")

### Time spent

```sh
ofutils report -t time-spent
```

The _time spent_ report looks for tasks with notes indicating how much time has
been spent on them and computes the total worked hours per date. Each log entry 
must be entered in the "note" section of its task as a separate line formatted 
as follows:

```sh
spent 2019-08-20 1h
spent 2019-08-19 1h
```

## Resources

- https://developer.apple.com/library/archive/documentation/LanguagesUtilities/Conceptual/MacAutomationScriptingGuide/index.html
- https://developer.apple.com/library/archive/releasenotes/InterapplicationCommunication/RN-JavaScriptForAutomation/Articles/Introduction.html#//apple_ref/doc/uid/TP40014508
- https://github.com/nickrobinson/omnifocus
- https://github.com/jsit/omnifocus-3-applescript-guide
- https://discourse.omnigroup.com/t/example-of-applescript-to-get-tasks-from-specific-project/2707/2
