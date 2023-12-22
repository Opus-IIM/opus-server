'use strict';

/**
 * rdv service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::rdv.rdv');
