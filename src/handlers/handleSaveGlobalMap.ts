import type { NextApiRequest, NextApiResponse } from 'next';

import { ApiResponse, GlobalMapRoute } from '@/pages/api/globalMap';

export default async function handlePostGlobalMap(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const data: GlobalMapRoute = req.body;

    const response = await fetch('http://3.136.158.250:3002/api/routes/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const responseData: ApiResponse = await response.json();
    return res.status(200).json(responseData);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Unknown error occurred' });
  }
}
