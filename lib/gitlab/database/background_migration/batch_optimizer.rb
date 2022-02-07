# frozen_string_literal: true

module Gitlab
  module Database
    module BackgroundMigration
      # This is an optimizer for throughput of batched migration jobs
      #
      # The underyling mechanic is based on the concept of time efficiency:
      #     time efficiency = job duration / interval
      # Ideally, this is close but lower than 1 - so we're using time efficiently.
      #
      # We aim to land in the 90%-98% range, which gives the database a little breathing room
      # in between.
      #
      # The optimizer is based on calculating the exponential moving average of time efficiencies
      # for the last N jobs. If we're outside the range, we add 10% to or decrease by 20% of the batch size.
      class BatchOptimizer
        # Target time efficiency for a job
        # Time efficiency is defined as: job duration / interval
        TARGET_EFFICIENCY = (0.9..0.95).freeze

        # Lower and upper bound for the batch size
        MIN_BATCH_SIZE = 1_000
        MAX_BATCH_SIZE = 2_000_000

        # Limit for the multiplier of the batch size
        MAX_MULTIPLIER = 1.2

        # When smoothing time efficiency, use this many jobs
        NUMBER_OF_JOBS = 20

        # Smoothing factor for exponential moving average
        EMA_ALPHA = 0.4

        attr_reader :migration, :number_of_jobs, :ema_alpha

        def initialize(migration, number_of_jobs: NUMBER_OF_JOBS, ema_alpha: EMA_ALPHA)
          @migration = migration
          @number_of_jobs = number_of_jobs
          @ema_alpha = ema_alpha
        end

        def optimize!
          return unless Feature.enabled?(:optimize_batched_migrations, type: :ops, default_enabled: :yaml)

          if multiplier = batch_size_multiplier
            max_batch = migration.max_batch_size || MAX_BATCH_SIZE
            migration.batch_size = (migration.batch_size * multiplier).to_i.clamp(MIN_BATCH_SIZE, max_batch)
            migration.save!
          end
        end

        private

        def batch_size_multiplier
          efficiency = migration.smoothed_time_efficiency(number_of_jobs: number_of_jobs, alpha: ema_alpha)

          return if efficiency.nil? || efficiency == 0

          # We hit the range - no change
          return if TARGET_EFFICIENCY.include?(efficiency)

          # Assumption: time efficiency is linear in the batch size
          [TARGET_EFFICIENCY.max / efficiency, MAX_MULTIPLIER].min
        end
      end
    end
  end
end
