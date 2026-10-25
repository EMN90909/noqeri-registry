# noqeri/github 0.1.1 API Reference

## 28 exported functions

- githubActionsRunsUrl
- githubActionsWorkflowsUrl
- githubApiRoot
- githubBranchesUrl
- githubCollaboratorsUrl
- githubCommitsUrl
- githubContentsUrl
- githubCreateIssue
- githubCreatePull
- githubCredentialPresent
- githubGetRepo
- githubIssueUrl
- githubIssuesUrl
- githubLastStatus
- githubListIssues
- githubListPulls
- githubListReleases
- githubPathChar
- githubPullUrl
- githubPullsUrl
- githubReleasesUrl
- githubRepoNameValid
- githubRepoUrl
- githubRequest
- githubStatusRateLimited
- githubStatusRetryable
- githubStatusSuccess
- githubTagsUrl

## 2 external host bindings

- providerHttpJson
- providerHttpStatus

## Scope

GitHub REST API repository, pull request, issue, workflow, contents and release route builders with authenticated request wrappers and HTTP status handling.

## Limitations

Requires a secure host HTTP implementation and scoped GitHub token. Dynamic path components must be validated/encoded by caller. No pagination iterator, GraphQL client, webhook signature verifier, or GitHub App token minting is implemented.
