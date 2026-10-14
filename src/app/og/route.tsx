import { ImageResponse } from 'next/og';

export const runtime = 'edge';

/** Route-specific Open Graph card. Text is passed from the single SEO data source. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = (searchParams.get('title') || 'Pristaine').slice(0, 100);
  const description = (searchParams.get('description') || 'Reliable AI for customer conversations.').slice(0, 180);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '68px 76px',
          background: '#0B1020',
          color: '#F6F8FB',
          fontFamily: 'Arial, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: 540,
            height: 540,
            right: -130,
            top: -210,
            borderRadius: 270,
            background: 'linear-gradient(135deg, #2DD4BF, #4F46E5)',
            opacity: 0.23,
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 28, fontWeight: 700 }}>
          <div style={{ width: 14, height: 14, borderRadius: 7, background: '#2DD4BF' }} />
          Pristaine
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 1010 }}>
          <div style={{ fontSize: title.length > 54 ? 46 : 58, lineHeight: 1.12, fontWeight: 700, letterSpacing: -1.5 }}>
            {title}
          </div>
          <div style={{ fontSize: 26, lineHeight: 1.4, color: '#A9B2C6', maxWidth: 930 }}>
            {description}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 22, color: '#2DD4BF' }}>
          pristaine.com <span style={{ color: '#6B7590' }}>·</span> Reliable AI for customer conversations
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
