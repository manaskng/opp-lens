import { Suspense } from "react";
import EventDetails from "@/components/EventDetails";

const EventDetailsPage = async ({ params }: { params: Promise<{ slug: string }>}) => {
    // We extract the slug promise to pass it down to allow parallel data fetching
    const slugPromise = params.then((p) => p.slug);

    return (
        <main>
            <Suspense fallback={
                <div className="flex h-screen items-center justify-center text-white">
                    <div className="animate-pulse flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-light-200">Loading Event...</p>
                    </div>
                </div>
            }>
                <EventDetails params={slugPromise} />
            </Suspense>
        </main>
    )
}
export default EventDetailsPage;