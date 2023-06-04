import formidable from 'formidable';
import { NextApiRequest, NextApiResponse } from 'next';

const uploadDocument = async (file: formidable.File): Promise<void> => {
  console.log(file.name)
};

export default async function uploadHandler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    try {
      const form = new formidable.IncomingForm();

      form.parse(req, async (error, fields, files) => {
        if (error) {
          console.error('Error:', error);
          res.status(500).json({ message: 'Internal server error' });
          return reject(error);
        }

        console.log("happens")


        const file = files?.document as formidable.File;

        console.log(file.name);

        if (!file) {
          res.status(400).json({ message: 'No file provided' });
          return reject(new Error('No file provided'));
        }

        console.log(fields)

        await uploadDocument(file);

        res.status(200).json({ message: 'File uploaded successfully' });
        resolve();
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Internal server error' });
      reject(error);
    }
  });
}
