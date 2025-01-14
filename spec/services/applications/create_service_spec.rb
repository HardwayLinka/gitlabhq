# frozen_string_literal: true

require "spec_helper"

RSpec.describe ::Applications::CreateService do
  include TestRequestHelpers

  let(:user) { create(:user) }

  subject { described_class.new(user, params) }

  context 'when scopes are present' do
    let(:params) { attributes_for(:application, scopes: ['read_user']) }

    it 'receive notification and change application count' do
      notification_service = instance_double(NotificationService)
      allow(NotificationService).to receive(:new).and_return(notification_service)

      expect(notification_service).to receive(:application_created).with(user)
      expect { subject.execute(test_request) }.to change { Doorkeeper::Application.count }.by(1)
    end
  end

  context 'when scopes are missing' do
    let(:params) { attributes_for(:application) }

    it { expect { subject.execute(test_request) }.not_to change { Doorkeeper::Application.count } }

    it 'includes blank scopes error message' do
      application = subject.execute(test_request)

      expect(application.errors.full_messages).to include "Scopes can't be blank"
    end
  end
end
