-- =====================================================
-- POD Status Auto-Sync Trigger
-- =====================================================
-- This trigger ensures pod_status is always consistent with pod_path
-- regardless of which frontend or code path updates the data.
--
-- LOGIC:
-- - If pod_path contains at least one valid URL → pod_status = 'RECEIVED'
-- - If pod_path is NULL or empty array → pod_status = 'PENDING'

CREATE OR REPLACE FUNCTION sync_pod_status()
RETURNS TRIGGER AS $$
DECLARE
  pod_array JSONB;
  has_pods BOOLEAN;
BEGIN
  -- Initialize
  has_pods := FALSE;

  -- Check if pod_path has content
  IF NEW.pod_path IS NOT NULL AND NEW.pod_path != '' THEN
    BEGIN
      -- Try to parse as JSON array
      pod_array := NEW.pod_path::JSONB;
      
      -- Check if it's a non-empty array
      IF jsonb_typeof(pod_array) = 'array' AND jsonb_array_length(pod_array) > 0 THEN
        has_pods := TRUE;
      END IF;
    EXCEPTION
      WHEN OTHERS THEN
        -- If parsing fails, treat as legacy comma-separated string
        -- If it has content, consider it as having pods
        IF length(trim(NEW.pod_path)) > 0 THEN
          has_pods := TRUE;
        END IF;
    END;
  END IF;

  -- Set pod_status based on pod_path content
  IF has_pods THEN
    NEW.pod_status := 'RECEIVED';
  ELSE
    NEW.pod_status := 'PENDING';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists (for re-running this script)
DROP TRIGGER IF EXISTS trigger_sync_pod_status ON trips;

-- Create trigger that fires BEFORE INSERT OR UPDATE
CREATE TRIGGER trigger_sync_pod_status
  BEFORE INSERT OR UPDATE OF pod_path
  ON trips
  FOR EACH ROW
  EXECUTE FUNCTION sync_pod_status();

-- Log success
DO $$
BEGIN
  RAISE NOTICE 'POD status sync trigger created successfully';
END $$;
