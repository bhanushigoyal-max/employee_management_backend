import { Router } from 'express';
import { LocationController } from '../controllers/location.controller';

const router = Router();

/**
 * Location Routes
 * Provides endpoints for retrieving countries, states, and cities
 * for dependent dropdowns in the frontend.
 */

/**
 * @route GET /api/locations/countries
 * @desc Get a list of all available countries
 */
router.get('/countries', LocationController.getCountries);

/**
 * @route GET /api/locations/countries/:countryCode/states
 * @desc Get a list of states for a specific country
 */
router.get('/countries/:countryCode/states', LocationController.getStatesByCountry);

/**
 * @route GET /api/locations/countries/:countryCode/states/:stateCode/cities
 * @desc Get a list of cities for a specific state and country
 */
router.get('/countries/:countryCode/states/:stateCode/cities', LocationController.getCitiesByState);

export default router;
