<script>
import { GlAvatar, GlLink } from '@gitlab/ui';
import { getIdFromGraphQLId } from '~/graphql_shared/utils';

export default {
  components: {
    GlAvatar,
    GlLink,
  },
  props: {
    job: {
      type: Object,
      required: true,
    },
  },
  computed: {
    pipelineId() {
      const id = getIdFromGraphQLId(this.job.pipeline.id);
      return `#${id}`;
    },
    pipelinePath() {
      return this.job.pipeline?.path;
    },
    pipelineUserAvatar() {
      return this.job.pipeline?.user?.avatarUrl;
    },
    userPath() {
      return this.job.pipeline?.user?.webPath;
    },
    showAvatar() {
      return this.job.pipeline?.user;
    },
  },
};
</script>

<template>
  <div>
    <div class="gl-p-3 gl-mt-n3">
      <gl-link
        class="gl-text-truncate gl-ml-n3 gl-text-gray-500!"
        :href="pipelinePath"
        data-testid="pipeline-id"
      >
        {{ pipelineId }}
      </gl-link>
    </div>
    <div class="gl-font-sm gl-text-secondary gl-mt-n2">
      <span>{{ __('created by') }}</span>
      <gl-link v-if="showAvatar" :href="userPath" data-testid="pipeline-user-link">
        <gl-avatar :src="pipelineUserAvatar" :size="16" />
      </gl-link>
      <span v-else>{{ __('API') }}</span>
    </div>
  </div>
</template>
