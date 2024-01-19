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

      const rdvs = await strapi.service("api::rdv.rdv").find({
        fields: ['Date', 'Status'],
        populate: {
          'Humanresource': {
            fields: ['Name', 'Lastname'],
          },
          'Employee': {
            fields: ['Name', 'Lastname'],
          }
        }
      });

      const employees = await strapi.service("api::employee.employee").find({
        fields: ['Name', 'Lastname'],
        populate: {
          'RdvList': {
            fields: ['Date', 'Status'],
          }
        }
      });

      const notes = await strapi.service("api::note.note").find({
        fields: ['Priority'],
        populate: {
          'Rdv': {
            fields: ['Date'],
          },
          'Author': {
            fields: ['Name', 'Lastname'],
          },
          'Employee': {
            fields: ['Name', 'Lastname'],
          }
        }
      });

      const sanitizedResults = await this.sanitizeOutput(humanResources, ctx);
      const sanitizedRdvs = await this.sanitizeOutput(rdvs.results, ctx);
      const sanitizedEmployees = await this.sanitizeOutput(employees.results, ctx);
      const sanitizedNotes = await this.sanitizeOutput(notes.results, ctx);

      const combinedResults = {
        humanResources: sanitizedResults,
        rdvs: sanitizedRdvs,
        employees: sanitizedEmployees,
        notes: sanitizedNotes,
      };

      return this.transformResponse(combinedResults, { pagination });
    },
  })
);
