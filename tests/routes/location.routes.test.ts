import request from 'supertest';
import express from 'express';
import locationRoutes from '../../src/routes/location.routes';
import { LocationController } from '../../src/controllers/location.controller';

jest.mock('../../src/controllers/location.controller');

const app = express();
app.use(express.json());
app.use('/locations', locationRoutes);

describe('Location Routes', () => {
  it('GET /locations/countries should route correctly', async () => {
    (LocationController.getCountries as jest.Mock).mockImplementation((req, res) => res.status(200).json([]));
    const response = await request(app).get('/locations/countries');
    expect(response.status).toBe(200);
  });

  it('GET /locations/countries/:countryCode/states should route correctly', async () => {
    (LocationController.getStatesByCountry as jest.Mock).mockImplementation((req, res) => res.status(200).json([]));
    const response = await request(app).get('/locations/countries/US/states');
    expect(response.status).toBe(200);
  });

  it('GET /locations/countries/:countryCode/states/:stateCode/cities should route correctly', async () => {
    (LocationController.getCitiesByState as jest.Mock).mockImplementation((req, res) => res.status(200).json([]));
    const response = await request(app).get('/locations/countries/US/states/CA/cities');
    expect(response.status).toBe(200);
  });
});
