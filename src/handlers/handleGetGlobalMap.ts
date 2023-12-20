import type { NextApiRequest, NextApiResponse } from 'next';

import { ApiResponse, GlobalMapRoute } from '@/pages/api/globalMap';

export default async function handleGetGlobalMap(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  try {
    // Adjust the URL as needed
    const response = await fetch('http://3.136.158.250:3002/api/routes/', {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data: GlobalMapRoute[] = await response.json();
    return res.status(200).json({ data });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Unknown error occurred' });
  }
}
