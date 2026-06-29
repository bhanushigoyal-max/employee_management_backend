import { uploadMiddleware } from '../../src/middleware/upload.middleware';

describe('Upload Middleware', () => {
  it('should export multer instance', () => {
    expect(uploadMiddleware).toBeDefined();
    expect(typeof uploadMiddleware.fields).toBe('function');
  });

  it('should configure storage correctly for AWS S3', () => {
    const storage: any = (uploadMiddleware as any).storage;
    expect(storage).toBeDefined();
    expect(typeof storage._handleFile).toBe('function');
    expect(typeof storage._removeFile).toBe('function');
  });
});
