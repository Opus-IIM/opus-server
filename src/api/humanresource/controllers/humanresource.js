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
        .find({ ...sanitizedQueryParams, fields: ['Name', 'Lastname'] });

      const rdvs = await strapi.service("api::rdv.rdv").find({ fields: ['Date'] });

      const notes = await strapi.service("api::note.note").find({ fields: ['Priority'] });

      const sanitizedResults = await this.sanitizeOutput(humanResources, ctx);
      const sanitizedRdvs = await this.sanitizeOutput(rdvs.results, ctx);
      const sanitizedNotes = await this.sanitizeOutput(notes.results, ctx);

      const combinedResults = {
        humanResources: sanitizedResults,
        rdvs: sanitizedRdvs,
        notes: sanitizedNotes,
      };

      return this.transformResponse(combinedResults, { pagination });
    },
  })
);
