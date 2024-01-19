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

      const employeesWithRdv = employees.results.filter(employee => employee.RdvList.length > 0);
      const employeesWithoutRdv = employees.results.filter(employee => employee.RdvList.length === 0);

      const rdvsDone = rdvs.results.filter(rdv => rdv.Status === 'Done').length;
      const rdvsNotDone = rdvs.results.filter(rdv => rdv.Status !== 'Done').length;

      const notePriorities = notes.results.map(note => note.Priority);
      const maxPriority = Math.max(...notePriorities);
      const minPriority = Math.min(...notePriorities);

      const priorityStatus = note => {
        if (note.Priority === maxPriority) {
          return "Urgent";
        } else if (note.Priority === minPriority) {
          return "Neutral";
        } else {
          return "ToWatch";
        }
      };

      const notesWithStatus = notes.results.map(note => ({
        ...note,
        status: priorityStatus(note),
      }));

      const combinedResultsWithCounts = {
        employeesWithRdv: employeesWithRdv.length,
        employeesWithoutRdv: employeesWithoutRdv.length,
        rdvsDone: rdvsDone,
        rdvsNotDone: rdvsNotDone,
        sortedNotes: notesWithStatus.map(note => ({
          Priority: note.Priority,
          status: note.status,
        })),

        humanResources: sanitizedResults,
        rdvs: sanitizedRdvs,
        employees: sanitizedEmployees,
        notes: sanitizedNotes,
      };

      return this.transformResponse(combinedResultsWithCounts, { pagination });
    },
  })
);
