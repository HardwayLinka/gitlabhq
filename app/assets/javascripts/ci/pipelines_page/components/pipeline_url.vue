<script>
import { GlIcon, GlLink, GlTooltipDirective } from '@gitlab/ui';
import { __ } from '~/locale';
import Tracking from '~/tracking';
import TooltipOnTruncate from '~/vue_shared/components/tooltip_on_truncate/tooltip_on_truncate.vue';
import UserAvatarLink from '~/vue_shared/components/user_avatar/user_avatar_link.vue';
import { ICONS, TRACKING_CATEGORIES } from '~/ci/constants';
import PipelineLabels from './pipeline_labels.vue';

export default {
  components: {
    GlIcon,
    GlLink,
    PipelineLabels,
    TooltipOnTruncate,
    UserAvatarLink,
  },
  directives: {
    GlTooltip: GlTooltipDirective,
  },
  mixins: [Tracking.mixin()],
  props: {
    pipeline: {
      type: Object,
      required: true,
    },
    pipelineScheduleUrl: {
      type: String,
      required: true,
    },
    pipelineKey: {
      type: String,
      required: true,
    },
    refClass: {
      type: String,
      required: false,
      default: '',
    },
  },
  computed: {
    mergeRequestRef() {
      return this.pipeline?.merge_request;
    },
    commitRef() {
      return this.pipeline?.ref;
    },
    commitTag() {
      return this.commitRef?.tag;
    },
    commitUrl() {
      return this.pipeline?.commit?.commit_path;
    },
    commitShortSha() {
      return this.pipeline?.commit?.short_id;
    },
    refUrl() {
      return this.commitRef?.ref_url || this.commitRef?.path;
    },
    tooltipTitle() {
      return this.mergeRequestRef?.title || this.commitRef?.name;
    },
    commitAuthor() {
      let commitAuthorInformation;
      const pipelineCommit = this.pipeline?.commit;
      const pipelineCommitAuthor = pipelineCommit?.author;

      if (!pipelineCommit) {
        return null;
      }

      // 1. person who is an author of a commit might be a GitLab user
      if (pipelineCommitAuthor) {
        // 2. if person who is an author of a commit is a GitLab user
        // they can have a GitLab avatar
        if (pipelineCommitAuthor?.avatar_url) {
          commitAuthorInformation = pipelineCommitAuthor;

          // 3. If GitLab user does not have avatar, they might have a Gravatar
        } else if (pipelineCommit.author_gravatar_url) {
          commitAuthorInformation = {
            ...pipelineCommitAuthor,
            avatar_url: pipelineCommit.author_gravatar_url,
          };
        }
        // 4. If committer is not a GitLab User, they can have a Gravatar
      } else {
        commitAuthorInformation = {
          avatar_url: pipelineCommit.author_gravatar_url,
          path: `mailto:${pipelineCommit.author_email}`,
          username: pipelineCommit.author_name,
        };
      }

      return commitAuthorInformation;
    },
    commitIcon() {
      let name = '';

      if (this.commitTag) {
        name = ICONS.TAG;
      } else if (this.mergeRequestRef) {
        name = ICONS.MR;
      } else {
        name = ICONS.BRANCH;
      }

      return name;
    },
    commitIconTooltipTitle() {
      switch (this.commitIcon) {
        case ICONS.TAG:
          return __('Tag');
        case ICONS.MR:
          return __('Merge Request');
        default:
          return __('Branch');
      }
    },
    commitTitle() {
      return this.pipeline?.commit?.title;
    },
    pipelineName() {
      return this.pipeline?.name;
    },
  },
  methods: {
    trackClick(action) {
      this.track(action, { label: TRACKING_CATEGORIES.table });
    },
  },
};
</script>
<template>
  <div class="pipeline-tags" data-testid="pipeline-url-table-cell">
    <div v-if="pipelineName" class="gl-mb-2" data-testid="pipeline-name-container">
      <span class="gl-display-flex">
        <tooltip-on-truncate
          :title="pipelineName"
          class="gl-flex-grow-1 gl-text-truncate gl-text-gray-900"
        >
          <gl-link
            :href="pipeline.path"
            class="gl-text-blue-600!"
            data-testid="pipeline-url-link"
            >{{ pipelineName }}</gl-link
          >
        </tooltip-on-truncate>
      </span>
    </div>

    <div v-if="!pipelineName" class="commit-title gl-mb-2" data-testid="commit-title-container">
      <span v-if="commitTitle" class="gl-display-flex">
        <tooltip-on-truncate
          :title="commitTitle"
          class="gl-flex-grow-1 gl-text-truncate gl-p-3 gl-ml-n3 gl-mr-n3 gl-mt-n3 gl-mb-n3"
        >
          <gl-link
            :href="commitUrl"
            class="commit-row-message gl-text-blue-600!"
            data-testid="commit-title"
            @click="trackClick('click_commit_title')"
            >{{ commitTitle }}</gl-link
          >
        </tooltip-on-truncate>
      </span>
      <span v-else class="gl-text-gray-500">{{
        __("Can't find HEAD commit for this branch")
      }}</span>
    </div>
    <div class="gl-mb-2">
      <gl-link
        :href="pipeline.path"
        class="gl-mr-1 gl-text-blue-500!"
        data-testid="pipeline-url-link"
        data-qa-selector="pipeline_url_link"
        @click="trackClick('click_pipeline_id')"
        >#{{ pipeline[pipelineKey] }}</gl-link
      >
      <!--Commit row-->
      <div class="gl-display-inline-flex gl-rounded-base gl-px-2 gl-bg-gray-50 gl-text-gray-700">
        <tooltip-on-truncate :title="tooltipTitle" truncate-target="child" placement="top">
          <gl-icon
            v-gl-tooltip
            :name="commitIcon"
            :title="commitIconTooltipTitle"
            :size="12"
            data-testid="commit-icon-type"
          />
          <gl-link
            v-if="mergeRequestRef"
            :href="mergeRequestRef.path"
            class="gl-font-sm gl-font-monospace gl-text-gray-700! gl-hover-text-gray-900!"
            :class="refClass"
            data-testid="merge-request-ref"
            @click="trackClick('click_mr_ref')"
            >{{ mergeRequestRef.iid }}</gl-link
          >
          <gl-link
            v-else
            :href="refUrl"
            class="gl-font-sm gl-font-monospace gl-text-gray-700! gl-hover-text-gray-900!"
            :class="refClass"
            data-testid="commit-ref-name"
            @click="trackClick('click_commit_name')"
            >{{ commitRef.name }}</gl-link
          >
        </tooltip-on-truncate>
      </div>
      <div
        class="gl-display-inline-block gl-rounded-base gl-font-sm gl-px-2 gl-bg-gray-50 gl-text-black-normal"
      >
        <gl-icon
          v-gl-tooltip
          name="commit"
          class="commit-icon gl-mr-1"
          :title="__('Commit')"
          :size="12"
          data-testid="commit-icon"
        />
        <gl-link
          :href="commitUrl"
          class="gl-font-sm gl-font-monospace gl-mr-0 gl-text-gray-700!"
          data-testid="commit-short-sha"
          @click="trackClick('click_commit_sha')"
          >{{ commitShortSha }}</gl-link
        >
      </div>
      <user-avatar-link
        v-if="commitAuthor"
        :link-href="commitAuthor.path"
        :img-src="commitAuthor.avatar_url"
        :img-size="16"
        :img-alt="commitAuthor.name"
        :tooltip-text="commitAuthor.name"
        class="gl-ml-1"
      />
      <!--End of commit row-->
    </div>
    <pipeline-labels :pipeline-schedule-url="pipelineScheduleUrl" :pipeline="pipeline" />
  </div>
</template>
