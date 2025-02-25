<script>
import { GlLoadingIcon, GlIcon, GlButton } from '@gitlab/ui';

import { s__ } from '~/locale';

import workItemByIidQuery from '../../graphql/work_item_by_iid.query.graphql';
import { WIDGET_TYPE_LINKED_ITEMS, LINKED_CATEGORIES_MAP } from '../../constants';

import WidgetWrapper from '../widget_wrapper.vue';
import WorkItemRelationshipList from './work_item_relationship_list.vue';

export default {
  components: {
    GlLoadingIcon,
    GlIcon,
    GlButton,
    WidgetWrapper,
    WorkItemRelationshipList,
  },
  props: {
    workItemIid: {
      type: String,
      required: true,
    },
    workItemFullPath: {
      type: String,
      required: true,
    },
  },
  apollo: {
    workItem: {
      query: workItemByIidQuery,
      variables() {
        return {
          fullPath: this.workItemFullPath,
          iid: this.workItemIid,
        };
      },
      update(data) {
        return data.workspace.workItems.nodes[0] ?? {};
      },
      context: {
        isSingleRequest: true,
      },
      skip() {
        return !this.workItemIid;
      },
      error(e) {
        this.error = e.message || this.$options.i18n.fetchError;
      },
      async result() {
        // When work items are switched in a modal, the data props are not getting reset.
        // Thus, duplicating the work items in the list.
        // Here, the existing list are cleared before the new items are pushed.
        this.linksRelatesTo = [];
        this.linksIsBlockedBy = [];
        this.linksBlocks = [];

        this.linkedWorkItems.forEach((item) => {
          if (item.linkType === LINKED_CATEGORIES_MAP.RELATES_TO) {
            this.linksRelatesTo.push(item);
          } else if (item.linkType === LINKED_CATEGORIES_MAP.IS_BLOCKED_BY) {
            this.linksIsBlockedBy.push(item);
          } else if (item.linkType === LINKED_CATEGORIES_MAP.BLOCKS) {
            this.linksBlocks.push(item);
          }
        });
      },
    },
  },
  data() {
    return {
      error: '',
      linksRelatesTo: [],
      linksIsBlockedBy: [],
      linksBlocks: [],
      widgetName: 'linkeditems',
    };
  },
  computed: {
    canUpdate() {
      // This will be false untill we implement remove item mutation
      return false;
    },
    isLoading() {
      return this.$apollo.queries.workItem.loading;
    },
    linkedWorkItemsWidget() {
      return this.workItem?.widgets?.find((widget) => widget.type === WIDGET_TYPE_LINKED_ITEMS);
    },
    linkedWorkItems() {
      return this.linkedWorkItemsWidget?.linkedItems?.nodes || [];
    },
    linkedWorkItemsCount() {
      return this.linkedWorkItems.length;
    },
    isEmptyRelatedWorkItems() {
      return !this.error && this.linkedWorkItems.length === 0;
    },
  },
  i18n: {
    title: s__('WorkItem|Linked Items'),
    fetchError: s__('WorkItem|Something went wrong when fetching tasks. Please refresh this page.'),
    emptyStateMessage: s__(
      "WorkItem|Link work items together to show that they're related or that one is blocking others.",
    ),
    addChildButtonLabel: s__('WorkItem|Add'),
    relatedToTitle: s__('WorkItem|Related to'),
    blockingTitle: s__('WorkItem|Blocking'),
    blockedByTitle: s__('WorkItem|Blocked by'),
    addLinkedWorkItemButtonLabel: s__('WorkItem|Add'),
  },
};
</script>
<template>
  <widget-wrapper
    :error="error"
    class="work-item-relationships"
    :widget-name="widgetName"
    @dismissAlert="error = undefined"
  >
    <template #header>
      <div class="gl-new-card-title-wrapper">
        <h3 class="gl-new-card-title">
          {{ $options.i18n.title }}
        </h3>
        <div v-if="linkedWorkItemsCount" class="gl-new-card-count">
          <gl-icon name="link" class="gl-mr-2" />
          <span data-testid="linked-items-count">{{ linkedWorkItemsCount }}</span>
        </div>
      </div>
    </template>
    <template #header-right>
      <gl-button size="small" class="gl-ml-3">
        <slot name="add-button-text">{{ $options.i18n.addLinkedWorkItemButtonLabel }}</slot>
      </gl-button>
    </template>
    <template #body>
      <div class="gl-new-card-content">
        <gl-loading-icon v-if="isLoading" color="dark" class="gl-my-2" />
        <template v-else>
          <div v-if="isEmptyRelatedWorkItems" data-testid="links-empty">
            <p class="gl-new-card-empty">
              {{ $options.i18n.emptyStateMessage }}
            </p>
          </div>
          <template v-else>
            <work-item-relationship-list
              v-if="linksBlocks.length"
              :class="{
                'gl-pb-3 gl-mb-5 gl-border-b-1 gl-border-b-solid gl-border-b-gray-100':
                  linksIsBlockedBy.length,
              }"
              :linked-items="linksBlocks"
              :heading="$options.i18n.blockingTitle"
              :work-item-full-path="workItemFullPath"
              :can-update="canUpdate"
              @showModal="$emit('showModal', { event: $event.event, modalWorkItem: $event.child })"
            />
            <work-item-relationship-list
              v-if="linksIsBlockedBy.length"
              :class="{
                'gl-pb-3 gl-mb-5 gl-border-b-1 gl-border-b-solid gl-border-b-gray-100':
                  linksRelatesTo.length,
              }"
              :linked-items="linksIsBlockedBy"
              :heading="$options.i18n.blockedByTitle"
              :work-item-full-path="workItemFullPath"
              :can-update="canUpdate"
              @showModal="$emit('showModal', { event: $event.event, modalWorkItem: $event.child })"
            />
            <work-item-relationship-list
              v-if="linksRelatesTo.length"
              :linked-items="linksRelatesTo"
              :heading="$options.i18n.relatedToTitle"
              :work-item-full-path="workItemFullPath"
              :can-update="canUpdate"
              @showModal="$emit('showModal', { event: $event.event, modalWorkItem: $event.child })"
            />
          </template>
        </template>
      </div>
    </template>
  </widget-wrapper>
</template>
