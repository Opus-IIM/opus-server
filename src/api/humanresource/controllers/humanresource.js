'use strict';

/**
 * humanresource controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController(
  "api::humanresource.humanresource",
  ({ strapi }) => ({
    async find(ctx) {
      await this.validateQuery(ctx);
      const sanitizedQueryParams = await this.sanitizeQuery(ctx);

      const { results: humanResources, pagination } = await strapi
        .service("api::humanresource.humanresource")
        .find({ ...sanitizedQueryParams, fields: ['Email'] });

      const employees = await strapi.service("api::employee.employee").find({ fields: ['Adress'] });

      const notes = await strapi.service("api::note.note").find({ fields: ['Content'] });

      const sanitizedResults = await this.sanitizeOutput(humanResources, ctx);
      const sanitizedEmployees = await this.sanitizeOutput(employees.results, ctx);
      const sanitizedNotes = await this.sanitizeOutput(notes.results, ctx);

      const combinedResults = {
        humanResources: sanitizedResults,
        employees: sanitizedEmployees,
        notes: sanitizedNotes,
      };

      return this.transformResponse(combinedResults, { pagination });
    },
  })
);
