-- Add reply_count column to topics table
ALTER TABLE public.topics ADD COLUMN reply_count INTEGER DEFAULT 0;

-- Create function to increment topic reply count
CREATE OR REPLACE FUNCTION increment_topic_reply_count(topic_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE public.topics
    SET reply_count = reply_count + 1
    WHERE id = topic_id;
END;
$$;

-- Create function to decrement topic reply count
CREATE OR REPLACE FUNCTION decrement_topic_reply_count(topic_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE public.topics
    SET reply_count = GREATEST(reply_count - 1, 0)
    WHERE id = topic_id;
END;
$$;