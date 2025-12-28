import { Suspense } from "react";
import EventDetails from "@/components/EventDetails";

const EventDetailsPage = async ({ params }: { params: Promise<{ slug: string }>}) => {
    // We extract the slug promise to pass it down
    const slugPromise = params.then((p) => p.slug);

    return (
        <main>
            <Suspense fallback={<div className="text-white text-center pt-20">Loading Event...</div>}>
                <EventDetails params={slugPromise} />
            </Suspense>
        </main>
    )
}
export default EventDetailsPage;