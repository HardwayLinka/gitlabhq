module Gitlab
  module Utils
    module StrongMemoize
      # Instead of writing patterns like this:
      #
      #     def trigger_from_token
      #       return @trigger if defined?(@trigger)
      #
      #       @trigger = Ci::Trigger.find_by_token(params[:token].to_s)
      #     end
      #
      # We could write it like:
      #
      #     def trigger_from_token
      #       strong_memoize(:trigger) do
      #         Ci::Trigger.find_by_token(params[:token].to_s)
      #       end
      #     end
      #
      def strong_memoize(name)
        ivar_name = "@#{name}"

        if instance_variable_defined?(ivar_name)
          instance_variable_get(ivar_name)
        else
          instance_variable_set(ivar_name, yield)
        end
      end
    end
  end
end
