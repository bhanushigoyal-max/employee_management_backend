import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';

export const s3Client = new S3Client({
  region: (process.env.AWS_REGION || 'ap-south-1').trim().replace(/['"]/g, ''),
  credentials: {
    accessKeyId: (process.env.AWS_ACCESS_KEY_ID || '').trim().replace(/['"]/g, ''),
    secretAccessKey: (process.env.AWS_SECRET_ACCESS_KEY || '').trim().replace(/['"]/g, ''),
  }
});

export class AWSService {
  /**
   * Deletes a file from AWS S3 given its URL.
   * @param fileUrl The URL of the file to delete.
   */
  static async deleteFile(fileUrl: string) {
    try {
      if (!fileUrl) return;
      const bucket = (process.env.AWS_BUCKET_NAME || 'mern-octal').trim().replace(/['"]/g, '');
      
      let key = '';
      if (fileUrl.includes('uploads/')) {
        key = fileUrl.substring(fileUrl.indexOf('uploads/'));
      } else {
        key = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);
      }

      if (key) {
        const command = new DeleteObjectCommand({
          Bucket: bucket,
          Key: key,
        });
        await s3Client.send(command);
      }
    } catch (error) {
      console.error('Error deleting file from AWS S3:', error);
    }
  }
}
