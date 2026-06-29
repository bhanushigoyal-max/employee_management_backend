import { getHealthStatus } from '../../src/services/health.service';

describe('Health Service', () => {
  it('should return health status', () => {
    const status = getHealthStatus();
    expect(status).toEqual({
      success: true,
      message: 'Server is up and running!',
    });
  });
});
