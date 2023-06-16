import { NextApiRequest, NextApiResponse } from 'next';


const handler = async (req: Request): Promise<Response> => {
  try {
    const formData = await req.json()

    console.log(formData)

    const response = fetch(`http://127.0.0.1:8000/documents/upload`, {
      method: 'POST',
        body: formData
    });

    return response
  }  catch (error) {
    return new Response('Error', { status: 500 });
  }
}

export default handler;
