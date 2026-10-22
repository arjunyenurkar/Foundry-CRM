import { NextRequest, NextResponse } from 'next/server';

interface PostOfficeItem {
  Name: string;
  Description: string | null;
  BranchType: string;
  DeliveryStatus: string;
  Circle: string;
  District: string;
  Division: string;
  Region: string;
  State: string;
  Country: string;
  Pincode: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const pincode = searchParams.get('pincode')?.trim();
  const city = searchParams.get('city')?.trim();

  try {
    if (pincode) {
      if (!/^\d{6}$/.test(pincode)) {
        return NextResponse.json({ success: false, error: 'PIN Code must be exactly 6 digits.' }, { status: 400 });
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        return NextResponse.json({ success: false, error: `Upstream error: ${res.status}` }, { status: 502 });
      }

      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0 || data[0].Status !== 'Success' || !Array.isArray(data[0].PostOffice)) {
        return NextResponse.json({ success: true, records: [] });
      }

      const records = data[0].PostOffice.map((po: PostOfficeItem) => ({
        name: po.Name,
        district: po.District,
        state: po.State,
        pincode: po.Pincode
      }));

      return NextResponse.json({ success: true, records });
    }

    if (city) {
      // Clean query name (e.g., "Aurangabad (Chhatrapati Sambhajinagar)" -> "Aurangabad")
      const cleanedCity = city.split('(')[0].trim();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(`https://api.postalpincode.in/postoffice/${encodeURIComponent(cleanedCity)}`, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        return NextResponse.json({ success: false, error: `Upstream error: ${res.status}` }, { status: 502 });
      }

      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0 || data[0].Status !== 'Success' || !Array.isArray(data[0].PostOffice)) {
        return NextResponse.json({ success: true, records: [] });
      }

      const records = data[0].PostOffice.map((po: PostOfficeItem) => ({
        name: po.Name,
        district: po.District,
        state: po.State,
        pincode: po.Pincode
      }));

      return NextResponse.json({ success: true, records });
    }

    return NextResponse.json({ success: false, error: 'Provide either pincode or city query parameter' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.name === 'AbortError' ? 'Location lookup timed out' : (error.message || 'Lookup failed') 
    }, { status: 500 });
  }
}
