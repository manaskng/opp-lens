import { ImageResponse } from 'next/og';
import connectDB from '@/lib/mongodb';
import Event from '@/database/event.model';

export const alt = 'Event Details';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;

  await connectDB();
  const event = await Event.findOne({ slug });

  // Fallback if event not found
  if (!event) {
    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 40,
            color: 'white',
            background: 'black',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          Event Not Found
        </div>
      ),
      { ...size }
    );
  }

  // Generate the Image
  return new ImageResponse(
    (
      // ROOT CONTAINER (Must have display: flex)
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0d161a',
          position: 'relative', // Allows absolute positioning of children
        }}
      >
        {/* Abstract Background Glow (Absolute) */}
        <div
          style={{
            position: 'absolute',
            top: '-50%',
            left: '20%',
            width: '1000px',
            height: '1000px',
            // Satori supports linear/radial gradients
            background: 'radial-gradient(circle, rgba(89,222,202,0.2) 0%, rgba(0,0,0,0) 70%)',
            display: 'flex',
          }}
        />

        {/* Content Container (Must have display: flex) */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10, // Unitless number
            padding: '0 60px',
            textAlign: 'center',
          }}
        >
          {/* Badge */}
          <div
            style={{
              background: '#59deca',
              color: '#000',
              padding: '10px 25px',
              borderRadius: '50px',
              fontSize: 24,
              fontWeight: 800,
              textTransform: 'uppercase',
              marginBottom: 30,
              display: 'flex',
            }}
          >
            {event.mode || 'Event'}
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: 80,
              fontWeight: 900,
              color: 'white',
              lineHeight: 1.1,
              marginBottom: 30,
              textShadow: '0 4px 20px rgba(0,0,0,0.5)',
              display: 'flex',
            }}
          >
            {event.title}
          </div>

          {/* Details Row */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row', // Explicitly define row
              gap: '40px',
              color: '#bdbdbd',
              fontSize: 30,
              fontWeight: 500,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
               📅 {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
               📍 {event.location}
            </div>
          </div>
        </div>

        {/* Branding Footer (Absolute) */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            color: 'rgba(255,255,255,0.4)',
            fontSize: 24,
            fontWeight: 600,
            display: 'flex',
          }}
        >
          DevEvent Sync
        </div>
      </div>
    ),
    { ...size }
  );
}