import { Request, Response } from 'express';
import { Country, State, City } from 'country-state-city';
import { MESSAGES } from '../lang/messages';

export class LocationController {
  /**
   * Retrieves a list of all countries.
   * 
   * @param req - The Express request object.
   * @param res - The Express response object used to send the countries data.
   * @returns void - Sends a JSON response containing an array of countries.
   */
  static getCountries(req: Request, res: Response): void {
    try {
      const countries = Country.getAllCountries().map((country) => ({
        name: country.name,
        isoCode: country.isoCode,
      }));
      res.status(200).json({ success: true, data: countries });
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  }

  /**
   * Retrieves a list of states for a specific country.
   * 
   * @param req - The Express request object, containing `countryCode` in params.
   * @param res - The Express response object used to send the states data.
   * @returns void - Sends a JSON response containing an array of states, or a 404 if none found.
   */
  static getStatesByCountry(req: Request, res: Response): void {
    try {
      const countryCode = req.params.countryCode as string;
      const states = State.getStatesOfCountry(countryCode).map((state) => ({
        name: state.name,
        isoCode: state.isoCode,
        countryCode: state.countryCode,
      }));
      
      if (!states.length) {
         res.status(404).json({ success: false, message: MESSAGES.LOCATION.NO_STATES_FOUND });
         return;
      }
      
      res.status(200).json({ success: true, data: states });
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  }

  /**
   * Retrieves a list of cities for a specific state and country.
   * 
   * @param req - The Express request object, containing `countryCode` and `stateCode` in params.
   * @param res - The Express response object used to send the cities data.
   * @returns void - Sends a JSON response containing an array of cities, or a 404 if none found.
   */
  static getCitiesByState(req: Request, res: Response): void {
    try {
      const countryCode = req.params.countryCode as string;
      const stateCode = req.params.stateCode as string;
      const cities = City.getCitiesOfState(countryCode, stateCode).map((city) => ({
        name: city.name,
        stateCode: city.stateCode,
        countryCode: city.countryCode,
      }));
      
      if (!cities.length) {
         res.status(404).json({ success: false, message: MESSAGES.LOCATION.NO_CITIES_FOUND });
         return;
      }

      res.status(200).json({ success: true, data: cities });
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  }
}
