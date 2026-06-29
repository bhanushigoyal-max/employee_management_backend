import { LocationController } from '../../src/controllers/location.controller';
import { Request, Response } from 'express';
import { Country, State, City } from 'country-state-city';

jest.mock('country-state-city', () => ({
  Country: {
    getAllCountries: jest.fn(),
  },
  State: {
    getStatesOfCountry: jest.fn(),
  },
  City: {
    getCitiesOfState: jest.fn(),
  },
}));

describe('Location Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = {
      params: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('getCountries', () => {
    it('should return 200 with list of countries', () => {
      const mockCountries = [{ name: 'USA', isoCode: 'US' }];
      (Country.getAllCountries as jest.Mock).mockReturnValue(mockCountries);

      LocationController.getCountries(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ success: true, data: mockCountries });
    });

    it('should return 500 if error occurs', () => {
      (Country.getAllCountries as jest.Mock).mockImplementation(() => { throw new Error('Error'); });

      LocationController.getCountries(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ success: false, message: 'Error' });
    });
  });

  describe('getStatesByCountry', () => {
    it('should return 200 with list of states', () => {
      mockRequest.params = { countryCode: 'US' };
      const mockStates = [{ name: 'California', isoCode: 'CA', countryCode: 'US' }];
      (State.getStatesOfCountry as jest.Mock).mockReturnValue(mockStates);

      LocationController.getStatesByCountry(mockRequest as Request, mockResponse as Response);

      expect(State.getStatesOfCountry).toHaveBeenCalledWith('US');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ success: true, data: mockStates });
    });

    it('should return 404 if no states found', () => {
      mockRequest.params = { countryCode: 'XX' };
      (State.getStatesOfCountry as jest.Mock).mockReturnValue([]);

      LocationController.getStatesByCountry(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ success: false, message: 'No states found for this country' });
    });

    it('should return 500 if error occurs', () => {
      (State.getStatesOfCountry as jest.Mock).mockImplementation(() => { throw new Error('Error'); });

      LocationController.getStatesByCountry(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getCitiesByState', () => {
    it('should return 200 with list of cities', () => {
      mockRequest.params = { countryCode: 'US', stateCode: 'CA' };
      const mockCities = [{ name: 'Los Angeles', stateCode: 'CA', countryCode: 'US' }];
      (City.getCitiesOfState as jest.Mock).mockReturnValue(mockCities);

      LocationController.getCitiesByState(mockRequest as Request, mockResponse as Response);

      expect(City.getCitiesOfState).toHaveBeenCalledWith('US', 'CA');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ success: true, data: mockCities });
    });

    it('should return 404 if no cities found', () => {
      mockRequest.params = { countryCode: 'US', stateCode: 'XX' };
      (City.getCitiesOfState as jest.Mock).mockReturnValue([]);

      LocationController.getCitiesByState(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ success: false, message: 'No cities found for this state' });
    });

    it('should return 500 if error occurs', () => {
      (City.getCitiesOfState as jest.Mock).mockImplementation(() => { throw new Error('Error'); });

      LocationController.getCitiesByState(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });
});
