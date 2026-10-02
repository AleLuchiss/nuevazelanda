import { createClient } from "@/lib/supabase/server";
import CommunityTimeline, { type TimelineTrip } from "@/components/timeline/CommunityTimeline";

export const metadata = { title: "Timeline de Viajeros | Kiwi Latino" };

export default async function TimelinePage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("timeline_view")
    .select("*")
    .order("arrival_month", { ascending: true });

  if (error) {
    return <p className="p-8 text-red-600">No pudimos cargar el timeline.</p>;
  }

  return <CommunityTimeline trips={(data ?? []) as TimelineTrip[]} />;
}
