# frozen_string_literal: true

require 'spec_helper'

RSpec.describe 'Admin Jobs', :js, feature_category: :continuous_integration do
  include FilteredSearchHelpers

  before do
    admin = create(:admin)
    sign_in(admin)
    gitlab_enable_admin_mode_sign_in(admin)
  end

  describe 'GET /admin/jobs' do
    let(:pipeline) { create(:ci_pipeline) }

    context 'All tab' do
      context 'when have jobs' do
        it 'shows all jobs', :js do
          create(:ci_build, pipeline: pipeline, status: :pending)
          create(:ci_build, pipeline: pipeline, status: :running)
          create(:ci_build, pipeline: pipeline, status: :success)
          create(:ci_build, pipeline: pipeline, status: :failed)

          visit admin_jobs_path

          wait_for_requests

          expect(page).to have_selector('[data-testid="jobs-all-tab"]')
          expect(page.all('[data-testid="jobs-table-row"]').size).to eq(4)

          click_button 'Cancel all jobs'

          expect(page).to have_button 'Yes, proceed'
          expect(page).to have_content 'Are you sure?'
        end
      end

      context 'when have no jobs' do
        it 'shows a message' do
          visit admin_jobs_path

          wait_for_requests

          expect(page).to have_selector('[data-testid="jobs-all-tab"]')
          expect(page).to have_selector('[data-testid="jobs-empty-state"]')
          expect(page).not_to have_button 'Cancel all jobs'
        end
      end
    end

    context 'Finished tab' do
      context 'when have finished jobs' do
        it 'shows finished jobs' do
          build1 = create(:ci_build, pipeline: pipeline, status: :pending)
          build2 = create(:ci_build, pipeline: pipeline, status: :running)
          build3 = create(:ci_build, pipeline: pipeline, status: :success)

          visit admin_jobs_path

          wait_for_requests

          find_by_testid('jobs-finished-tab').click

          wait_for_requests

          expect(page).to have_selector('[data-testid="jobs-finished-tab"]')
          expect(find_by_testid('job-id-link')).not_to have_content(build1.id)
          expect(find_by_testid('job-id-link')).not_to have_content(build2.id)
          expect(find_by_testid('job-id-link')).to have_content(build3.id)
          expect(page).to have_button 'Cancel all jobs'
        end
      end

      context 'when have no jobs finished' do
        it 'shows a message' do
          create(:ci_build, pipeline: pipeline, status: :running)

          visit admin_jobs_path

          wait_for_requests

          find_by_testid('jobs-finished-tab').click

          wait_for_requests

          expect(page).to have_selector('[data-testid="jobs-finished-tab"]')
          expect(page).to have_content 'No jobs to show'
          expect(page).to have_button 'Cancel all jobs'
        end
      end
    end

    context 'jobs table links' do
      let_it_be(:namespace) { create(:namespace) }
      let_it_be(:project) { create(:project, namespace: namespace) }
      let_it_be(:runner) { create(:ci_runner, :instance) }

      it 'displays correct links' do
        pipeline = create(:ci_pipeline, project: project)
        job = create(:ci_build, pipeline: pipeline, status: :success, runner: runner)

        visit admin_jobs_path

        wait_for_requests

        within_testid('jobs-table') do
          expect(page).to have_link(href: project_job_path(project, job))
          expect(page).to have_link(href: project_pipeline_path(project, pipeline))
          expect(find_by_testid('job-project-link')['href']).to include(project_path(project))
          expect(find_by_testid('job-runner-link')['href']).to include("/admin/runners/#{runner.id}")
        end
      end
    end

    context 'job filtering' do
      it 'filters jobs by status' do
        create(:ci_build, pipeline: pipeline, status: :success)
        create(:ci_build, pipeline: pipeline, status: :failed)

        visit admin_jobs_path

        wait_for_requests

        within_testid('jobs-table') do
          expect(page).to have_selector('[data-testid="jobs-table-row"]', count: 2)
        end

        select_tokens 'Status', 'Failed', submit: true, input_text: 'Filter jobs'

        wait_for_requests

        within_testid('jobs-table') do
          expect(page).to have_selector('[data-testid="jobs-table-row"]', count: 1)
          expect(find_by_testid('ci-badge-text')).to have_content('failed')
        end
      end
    end
  end
end
