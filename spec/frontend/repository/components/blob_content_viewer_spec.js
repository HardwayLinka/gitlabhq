import { GlLoadingIcon } from '@gitlab/ui';
import { mount, shallowMount } from '@vue/test-utils';
import Vue, { nextTick } from 'vue';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import VueApollo from 'vue-apollo';
import createMockApollo from 'helpers/mock_apollo_helper';
import waitForPromises from 'helpers/wait_for_promises';
import BlobContent from '~/blob/components/blob_content.vue';
import BlobHeader from '~/blob/components/blob_header.vue';
import BlobButtonGroup from '~/repository/components/blob_button_group.vue';
import BlobContentViewer from '~/repository/components/blob_content_viewer.vue';
import BlobEdit from '~/repository/components/blob_edit.vue';
import ForkSuggestion from '~/repository/components/fork_suggestion.vue';
import { loadViewer } from '~/repository/components/blob_viewers';
import DownloadViewer from '~/repository/components/blob_viewers/download_viewer.vue';
import EmptyViewer from '~/repository/components/blob_viewers/empty_viewer.vue';
import SourceViewer from '~/vue_shared/components/source_viewer/source_viewer.vue';
import blobInfoQuery from '~/repository/queries/blob_info.query.graphql';
import { redirectTo } from '~/lib/utils/url_utility';
import { isLoggedIn } from '~/lib/utils/common_utils';
import { extendedWrapper } from 'helpers/vue_test_utils_helper';
import {
  simpleViewerMock,
  richViewerMock,
  projectMock,
  userPermissionsMock,
  propsMock,
  refMock,
} from '../mock_data';

jest.mock('~/repository/components/blob_viewers');
jest.mock('~/lib/utils/url_utility');
jest.mock('~/lib/utils/common_utils');

let wrapper;
let mockResolver;

const mockAxios = new MockAdapter(axios);

const createComponent = async (mockData = {}, mountFn = shallowMount) => {
  Vue.use(VueApollo);

  const {
    blob = simpleViewerMock,
    empty = projectMock.repository.empty,
    pushCode = userPermissionsMock.pushCode,
    forkProject = userPermissionsMock.forkProject,
    downloadCode = userPermissionsMock.downloadCode,
    createMergeRequestIn = userPermissionsMock.createMergeRequestIn,
    isBinary,
    inject = {},
    highlightJs = true,
  } = mockData;

  const project = {
    ...projectMock,
    userPermissions: {
      pushCode,
      forkProject,
      downloadCode,
      createMergeRequestIn,
    },
    repository: {
      empty,
      blobs: { nodes: [blob] },
    },
  };

  mockResolver = jest.fn().mockResolvedValue({
    data: { isBinary, project },
  });

  const fakeApollo = createMockApollo([[blobInfoQuery, mockResolver]]);

  wrapper = extendedWrapper(
    mountFn(BlobContentViewer, {
      apolloProvider: fakeApollo,
      propsData: propsMock,
      mixins: [{ data: () => ({ ref: refMock }) }],
      provide: {
        targetBranch: 'test',
        originalBranch: 'default-ref',
        ...inject,
        glFeatures: {
          highlightJs,
        },
      },
    }),
  );

  // setData usage is discouraged. See https://gitlab.com/groups/gitlab-org/-/epics/7330 for details
  // eslint-disable-next-line no-restricted-syntax
  wrapper.setData({ project, isBinary });

  await waitForPromises();
};

describe('Blob content viewer component', () => {
  const findLoadingIcon = () => wrapper.findComponent(GlLoadingIcon);
  const findBlobHeader = () => wrapper.findComponent(BlobHeader);
  const findBlobEdit = () => wrapper.findComponent(BlobEdit);
  const findPipelineEditor = () => wrapper.findByTestId('pipeline-editor');
  const findBlobContent = () => wrapper.findComponent(BlobContent);
  const findBlobButtonGroup = () => wrapper.findComponent(BlobButtonGroup);
  const findForkSuggestion = () => wrapper.findComponent(ForkSuggestion);

  beforeEach(() => {
    isLoggedIn.mockReturnValue(true);
  });

  afterEach(() => {
    wrapper.destroy();
    mockAxios.reset();
  });

  it('renders a GlLoadingIcon component', () => {
    createComponent();

    expect(findLoadingIcon().exists()).toBe(true);
  });

  describe('simple viewer', () => {
    it('renders a BlobHeader component', async () => {
      await createComponent();

      expect(findBlobHeader().props('activeViewerType')).toEqual('simple');
      expect(findBlobHeader().props('hasRenderError')).toEqual(false);
      expect(findBlobHeader().props('hideViewerSwitcher')).toEqual(true);
      expect(findBlobHeader().props('blob')).toEqual(simpleViewerMock);
    });

    it('renders a BlobContent component', async () => {
      await createComponent();

      expect(findBlobContent().props('isRawContent')).toBe(true);
      expect(findBlobContent().props('activeViewer')).toEqual({
        fileType: 'text',
        tooLarge: false,
        type: 'simple',
        renderError: null,
      });
    });

    describe('legacy viewers', () => {
      it('loads a legacy viewer when a the fileType is text and the highlightJs feature is turned off', async () => {
        await createComponent({
          blob: { ...simpleViewerMock, fileType: 'text', highlightJs: false },
        });

        expect(mockAxios.history.get).toHaveLength(1);
        expect(mockAxios.history.get[0].url).toEqual('some_file.js?format=json&viewer=simple');
      });

      it('loads a legacy viewer when a viewer component is not available', async () => {
        await createComponent({ blob: { ...simpleViewerMock, fileType: 'unknown' } });

        expect(mockAxios.history.get).toHaveLength(1);
        expect(mockAxios.history.get[0].url).toEqual('some_file.js?format=json&viewer=simple');
      });
    });
  });

  describe('rich viewer', () => {
    it('renders a BlobHeader component', async () => {
      await createComponent({ blob: richViewerMock });

      expect(findBlobHeader().props('activeViewerType')).toEqual('rich');
      expect(findBlobHeader().props('hasRenderError')).toEqual(false);
      expect(findBlobHeader().props('hideViewerSwitcher')).toEqual(false);
      expect(findBlobHeader().props('blob')).toEqual(richViewerMock);
    });

    it('renders a BlobContent component', async () => {
      await createComponent({ blob: richViewerMock });

      expect(findBlobContent().props('isRawContent')).toBe(true);
      expect(findBlobContent().props('activeViewer')).toEqual({
        fileType: 'markup',
        tooLarge: false,
        type: 'rich',
        renderError: null,
      });
    });

    it('updates viewer type when viewer changed is clicked', async () => {
      await createComponent({ blob: richViewerMock });

      expect(findBlobContent().props('activeViewer')).toEqual(
        expect.objectContaining({
          type: 'rich',
        }),
      );
      expect(findBlobHeader().props('activeViewerType')).toEqual('rich');

      findBlobHeader().vm.$emit('viewer-changed', 'simple');
      await nextTick();

      expect(findBlobHeader().props('activeViewerType')).toEqual('simple');
      expect(findBlobContent().props('activeViewer')).toEqual(
        expect.objectContaining({
          type: 'simple',
        }),
      );
    });
  });

  describe('legacy viewers', () => {
    it('loads a legacy viewer when a viewer component is not available', async () => {
      await createComponent({ blob: { ...richViewerMock, fileType: 'unknown' } });

      expect(mockAxios.history.get).toHaveLength(1);
      expect(mockAxios.history.get[0].url).toEqual('some_file.js?format=json&viewer=rich');
    });
  });

  describe('Blob viewer', () => {
    afterEach(() => {
      loadViewer.mockRestore();
    });

    it('does not render a BlobContent component if a Blob viewer is available', async () => {
      loadViewer.mockReturnValue(() => true);
      await createComponent({ blob: richViewerMock });
      await waitForPromises();
      expect(findBlobContent().exists()).toBe(false);
    });

    it.each`
      viewer        | loadViewerReturnValue
      ${'empty'}    | ${EmptyViewer}
      ${'download'} | ${DownloadViewer}
      ${'text'}     | ${SourceViewer}
    `('renders viewer component for $viewer files', async ({ viewer, loadViewerReturnValue }) => {
      loadViewer.mockReturnValue(loadViewerReturnValue);

      createComponent({
        blob: {
          ...simpleViewerMock,
          fileType: 'null',
          simpleViewer: {
            ...simpleViewerMock.simpleViewer,
            fileType: viewer,
          },
        },
      });

      await waitForPromises();

      expect(loadViewer).toHaveBeenCalledWith(viewer, false);
      expect(wrapper.findComponent(loadViewerReturnValue).exists()).toBe(true);
    });
  });

  describe('BlobHeader action slot', () => {
    const { ideEditPath, editBlobPath } = simpleViewerMock;

    it('renders BlobHeaderEdit buttons in simple viewer', async () => {
      await createComponent({ inject: { BlobContent: true, BlobReplace: true } }, mount);

      expect(findBlobEdit().props()).toMatchObject({
        editPath: editBlobPath,
        webIdePath: ideEditPath,
        showEditButton: true,
      });
    });

    it('renders BlobHeaderEdit button in rich viewer', async () => {
      await createComponent({ blob: richViewerMock }, mount);

      expect(findBlobEdit().props()).toMatchObject({
        editPath: editBlobPath,
        webIdePath: ideEditPath,
        showEditButton: true,
      });
    });

    it('renders BlobHeaderEdit button for binary files', async () => {
      await createComponent({ blob: richViewerMock, isBinary: true }, mount);

      expect(findBlobEdit().props()).toMatchObject({
        editPath: editBlobPath,
        webIdePath: ideEditPath,
        showEditButton: false,
      });
    });

    it('renders Pipeline Editor button for .gitlab-ci files', async () => {
      const pipelineEditorPath = 'some/path/.gitlab-ce';
      const blob = { ...simpleViewerMock, pipelineEditorPath };
      await createComponent({ blob, inject: { BlobContent: true, BlobReplace: true } }, mount);

      expect(findPipelineEditor().exists()).toBe(true);
      expect(findPipelineEditor().attributes('href')).toBe(pipelineEditorPath);
    });

    describe('blob header binary file', () => {
      it('passes the correct isBinary value when viewing a binary file', async () => {
        await createComponent({ blob: richViewerMock, isBinary: true });

        expect(findBlobHeader().props('isBinary')).toBe(true);
      });

      it('passes the correct header props when viewing a non-text file', async () => {
        await createComponent(
          {
            blob: {
              ...simpleViewerMock,
              simpleViewer: {
                ...simpleViewerMock.simpleViewer,
                fileType: 'image',
              },
            },
            isBinary: true,
          },
          mount,
        );

        expect(findBlobHeader().props('hideViewerSwitcher')).toBe(true);
        expect(findBlobHeader().props('isBinary')).toBe(true);
        expect(findBlobEdit().props('showEditButton')).toBe(false);
      });
    });

    describe('BlobButtonGroup', () => {
      const { name, path, replacePath, webPath } = simpleViewerMock;
      const {
        userPermissions: { pushCode, downloadCode },
        repository: { empty },
      } = projectMock;

      afterEach(() => {
        delete gon.current_user_id;
        delete gon.current_username;
      });

      it('renders component', async () => {
        window.gon.current_user_id = 1;
        window.gon.current_username = 'root';

        await createComponent({ pushCode, downloadCode, empty }, mount);

        expect(findBlobButtonGroup().props()).toMatchObject({
          name,
          path,
          replacePath,
          deletePath: webPath,
          canPushCode: pushCode,
          canLock: true,
          isLocked: false,
          emptyRepo: empty,
        });
      });

      it('does not render if not logged in', async () => {
        isLoggedIn.mockReturnValueOnce(false);

        await createComponent();

        expect(findBlobButtonGroup().exists()).toBe(false);
      });
    });
  });

  describe('blob info query', () => {
    it.each`
      highlightJs | shouldFetchRawText
      ${true}     | ${true}
      ${false}    | ${false}
    `(
      'calls blob info query with shouldFetchRawText: $shouldFetchRawText when highlightJs (feature flag): $highlightJs',
      async ({ highlightJs, shouldFetchRawText }) => {
        await createComponent({ highlightJs });

        expect(mockResolver).toHaveBeenCalledWith(expect.objectContaining({ shouldFetchRawText }));
      },
    );

    it('is called with originalBranch value if the prop has a value', async () => {
      await createComponent({ inject: { originalBranch: 'some-branch' } });

      expect(mockResolver).toHaveBeenCalledWith(
        expect.objectContaining({
          ref: 'some-branch',
        }),
      );
    });

    it('is called with ref value if the originalBranch prop has no value', async () => {
      await createComponent();

      expect(mockResolver).toHaveBeenCalledWith(
        expect.objectContaining({
          ref: 'default-ref',
        }),
      );
    });
  });

  describe('edit blob', () => {
    beforeEach(() => createComponent({}, mount));

    it('simple edit redirects to the simple editor', () => {
      findBlobEdit().vm.$emit('edit', 'simple');
      expect(redirectTo).toHaveBeenCalledWith(simpleViewerMock.editBlobPath);
    });

    it('IDE edit redirects to the IDE editor', () => {
      findBlobEdit().vm.$emit('edit', 'ide');
      expect(redirectTo).toHaveBeenCalledWith(simpleViewerMock.ideEditPath);
    });

    it.each`
      loggedIn | canModifyBlob | createMergeRequestIn | forkProject | showForkSuggestion
      ${true}  | ${false}      | ${true}              | ${true}     | ${true}
      ${false} | ${false}      | ${true}              | ${true}     | ${false}
      ${true}  | ${true}       | ${false}             | ${true}     | ${false}
      ${true}  | ${true}       | ${true}              | ${false}    | ${false}
    `(
      'shows/hides a fork suggestion according to a set of conditions',
      async ({
        loggedIn,
        canModifyBlob,
        createMergeRequestIn,
        forkProject,
        showForkSuggestion,
      }) => {
        isLoggedIn.mockReturnValueOnce(loggedIn);
        await createComponent(
          {
            blob: { ...simpleViewerMock, canModifyBlob },
            createMergeRequestIn,
            forkProject,
          },
          mount,
        );

        findBlobEdit().vm.$emit('edit', 'simple');
        await nextTick();

        expect(findForkSuggestion().exists()).toBe(showForkSuggestion);
      },
    );
  });
});
