---
stage: Manage
group: Import and Integrate
info: To determine the technical writer assigned to the Stage/Group associated with this page, see https://about.gitlab.com/handbook/product/ux/technical-writing/#assignments
---

# Project integrations **(FREE ALL)**

NOTE:
This page contains information about configuring project integrations on GitLab.com. For administrator documentation, see [Project integration administration](../../../administration/settings/project_integration_management.md).

You can integrate with external applications to add functionality to GitLab.

You can view and manage integrations at the:

- [Instance level](../../../administration/settings/project_integration_management.md#manage-instance-level-default-settings-for-a-project-integration) (self-managed GitLab)
- [Group level](#manage-group-level-default-settings-for-a-project-integration)

You can use:

- [Instance-level or group-level default settings for a project integration](#use-instance-level-or-group-level-default-settings-for-a-project-integration)
- [Custom settings for a project or group integration](#use-custom-settings-for-a-project-or-group-integration)

## Manage group-level default settings for a project integration

Prerequisite:

- You must have at least the Maintainer role for the group.

To manage group-level default settings for a project integration:

1. On the left sidebar, select **Search or go to** and find your group.
1. Select **Settings > Integrations**.
1. Select an integration.
1. Complete the fields.
1. Select **Save changes**.

WARNING:
This may affect all or most of the subgroups and projects belonging to the group. Review the details below.

If this is the first time you are setting up group-level settings for an integration:

- The integration is enabled for all subgroups and projects belonging to the group that don't already have
  this integration configured, if you have the **Enable integration** toggle turned on in the group-level
  settings.
- Subgroups and projects that already have the integration configured are not affected, but can choose to use
  the inherited settings at any time.

When you make further changes to the group defaults:

- They are immediately applied to all subgroups and projects belonging to the group that have the integration
  set to use default settings.
- They are immediately applied to newer subgroups and projects, even those created after you last saved defaults for the
  integration. If your group-level default setting has the **Enable integration** toggle turned on,
  the integration is automatically enabled for all such subgroups and projects.
- Subgroups and projects with custom settings selected for the integration are not immediately affected and
  may choose to use the latest defaults at any time.

If [instance-level settings](../../../administration/settings/project_integration_management.md#manage-instance-level-default-settings-for-a-project-integration)
have also been configured for the same integration, projects in the group inherit settings from the group.

Only the entire settings for an integration can be inherited. Per-field inheritance
is proposed in [epic 2137](https://gitlab.com/groups/gitlab-org/-/epics/2137).

### Remove a group-level default setting

Prerequisite:

- You must have at least the Maintainer role for the group.

To remove a group-level default setting:

1. On the left sidebar, select **Search or go to** and find your group.
1. Select **Settings > Integrations**.
1. Select an integration.
1. Select **Reset** and confirm.

Resetting a group-level default setting removes integrations that use default settings and belong to a project or subgroup of the group.

## Use instance-level or group-level default settings for a project integration

Prerequisite:

- You must have at least the Maintainer role for the project.

To use instance-level or group-level default settings for a project integration:

1. On the left sidebar, select **Search or go to** and find your project.
1. Select **Settings > Integrations**.
1. Select an integration.
1. On the right, from the dropdown list, select **Use default settings**.
1. Under **Enable integration**, ensure the **Active** checkbox is selected.
1. Complete the fields.
1. Select **Save changes**.

## Use custom settings for a project or group integration

Prerequisite:

- You must have at least the Maintainer role for the project or group.

To use custom settings for a project or group integration:

1. On the left sidebar, select **Search or go to** and find your project or group.
1. Select **Settings > Integrations**.
1. Select an integration.
1. On the right, from the dropdown list, select **Use custom settings**.
1. Under **Enable integration**, ensure the **Active** checkbox is selected.
1. Complete the fields.
1. Select **Save changes**.

## Available integrations

| Integration                                                                 | Description                                                           | Integration hooks      |
|-----------------------------------------------------------------------------|-----------------------------------------------------------------------|------------------------|
| [Asana](asana.md)                                                           | Add commit messages as comments to Asana tasks.                       | **{dotted-circle}** No |
| Assembla                                                                    | Manage projects.                                                      | **{dotted-circle}** No |
| [Atlassian Bamboo](bamboo.md)                                               | Run CI/CD pipelines with Atlassian Bamboo.                            | **{check-circle}** Yes |
| [Bugzilla](bugzilla.md)                                                     | Use Bugzilla as the issue tracker.                                    | **{dotted-circle}** No |
| Buildkite                                                                   | Run CI/CD pipelines with Buildkite.                                   | **{check-circle}** Yes |
| Campfire                                                                    | Connect to chat.                                                      | **{dotted-circle}** No |
| [ClickUp](clickup.md)                                                       | Use ClickUp as the issue tracker.                                     | **{dotted-circle}** No |
| [Confluence Workspace](../../../api/integrations.md#confluence-integration) | Use Confluence Cloud Workspace as an internal wiki.                   | **{dotted-circle}** No |
| [Custom issue tracker](custom_issue_tracker.md)                             | Use a custom issue tracker.                                           | **{dotted-circle}** No |
| [Datadog](../../../integration/datadog.md)                                  | Trace your GitLab pipelines with Datadog.                             | **{check-circle}** Yes |
| [Discord Notifications](discord_notifications.md)                           | Send notifications about project events to a Discord channel.         | **{dotted-circle}** No |
| Drone                                                                       | Run CI/CD pipelines with Drone.                                       | **{check-circle}** Yes |
| [Emails on push](emails_on_push.md)                                         | Send commits and diff of each push by email.                          | **{dotted-circle}** No |
| [Engineering Workflow Management (EWM)](ewm.md)                             | Use IBM Engineering Workflow Management as the issue tracker.         | **{dotted-circle}** No |
| [External wiki](../wiki/index.md#link-an-external-wiki)                     | Link an external wiki.                                                | **{dotted-circle}** No |
| [GitHub](github.md)                                                         | Obtain statuses for commits and pull requests.                        | **{dotted-circle}** No |
| [GitLab for Slack app](gitlab_slack_application.md)                         | Use Slack's official GitLab application.                              | **{dotted-circle}** No |
| [Google Chat](hangouts_chat.md)                                             | Send notifications from your GitLab project to a room in Google Chat. | **{dotted-circle}** No |
| [Harbor](harbor.md)                                                         | Use Harbor as the container registry.                                 | **{dotted-circle}** No |
| [irker (IRC gateway)](irker.md)                                             | Send IRC messages.                                                    | **{dotted-circle}** No |
| [Jenkins](../../../integration/jenkins.md)                                  | Run CI/CD pipelines with Jenkins.                                     | **{check-circle}** Yes |
| JetBrains TeamCity                                                          | Run CI/CD pipelines with TeamCity.                                    | **{check-circle}** Yes |
| [Jira](../../../integration/jira/index.md)                                  | Use Jira as the issue tracker.                                        | **{dotted-circle}** No |
| [Mattermost notifications](mattermost.md)                                   | Send notifications about project events to Mattermost channels.       | **{dotted-circle}** No |
| [Mattermost slash commands](mattermost_slash_commands.md)                   | Perform common tasks with slash commands.                             | **{dotted-circle}** No |
| [Microsoft Teams notifications](microsoft_teams.md)                         | Receive event notifications.                                          | **{dotted-circle}** No |
| Packagist                                                                   | Keep your PHP dependencies updated on Packagist.                      | **{check-circle}** Yes |
| [Pipeline status emails](pipeline_status_emails.md)                         | Send the pipeline status to a list of recipients by email.            | **{dotted-circle}** No |
| [Pivotal Tracker](pivotal_tracker.md)                                       | Add commit messages as comments to Pivotal Tracker stories.           | **{dotted-circle}** No |
| [Pumble](pumble.md)                                                         | Send event notifications to a Pumble channel.                         | **{dotted-circle}** No |
| Pushover                                                                    | Get real-time notifications on your device.                           | **{dotted-circle}** No |
| [Redmine](redmine.md)                                                       | Use Redmine as the issue tracker.                                     | **{dotted-circle}** No |
| [Slack slash commands](slack_slash_commands.md)                             | Enable slash commands in a workspace.                                 | **{dotted-circle}** No |
| [Squash TM](squash_tm.md)                                                   | Update Squash TM requirements when GitLab issues are modified.        | **{check-circle}** Yes |
| [Telegram](telegram.md)                                                     | Send notifications about project events to Telegram.                  | **{dotted-circle}** No |
| [Unify Circuit](unify_circuit.md)                                           | Send notifications about project events to Unify Circuit.             | **{dotted-circle}** No |
| [Webex Teams](webex_teams.md)                                               | Receive events notifications.                                         | **{dotted-circle}** No |
| [YouTrack](youtrack.md)                                                     | Use YouTrack as the issue tracker.                                    | **{dotted-circle}** No |

## Project webhooks

Some integrations use [webhooks](webhooks.md) for external applications.

You can configure a project webhook to listen for specific events
like pushes, issues, or merge requests. When the webhook is triggered,
GitLab sends a POST request with data to a specified webhook URL.

For a list of integrations that use webhooks, see [Available integrations](#available-integrations).

## Push hook limit

If a single push includes changes to more than three branches or tags, integrations
supported by `push_hooks` and `tag_push_hooks` events are not executed.

To change the number of supported branches or tags, configure the
[`push_event_hooks_limit` setting](../../../api/settings.md#list-of-settings-that-can-be-accessed-via-api-calls).

## SSL verification

By default, the SSL certificate for outgoing HTTP requests is verified based on
an internal list of certificate authorities. The SSL certificate cannot
be self-signed.

You can disable SSL verification when you configure
[webhooks](webhooks.md#configure-a-webhook-in-gitlab) and some integrations.

## Related topics

- [Integrations API](../../../api/integrations.md)
- [Integration development guidelines](../../../development/integrations/index.md)
- [GitLab Developer Portal](https://developer.gitlab.com)
