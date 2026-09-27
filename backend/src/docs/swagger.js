const swaggerJSDoc = require('swagger-jsdoc');

const config = require('../config/env');

const swaggerDefinition = {
  openapi: '3.0.3',

  info: {
    title: 'EVE Healthcare API',
    version: '1.0.0',
    description:
      'REST API for the EVE Healthcare diagnostic testing platform.',
  },

  servers: [
    {
      url: `http://localhost:${config.port}`,
      description: 'Local development server',
    },
  ],

  tags: [
    {
      name: 'Health',
      description: 'API health and test endpoints',
    },
    {
      name: 'Auth',
      description: 'Authentication and user account endpoints',
    },
    {
      name: 'Centres',
      description: 'Diagnostic centre endpoints',
    },
    {
      name: 'Bookings',
      description: 'Diagnostic booking endpoints',
    },
    {
      name: 'Payments',
      description: 'Payment endpoints',
    },
    {
      name: 'Webhooks',
      description: 'Payment webhook endpoints',
    },
    {
      name: 'Logs',
      description: 'Administrative logging endpoints',
    },
  ],

  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description:
          'Supabase access token. Send as: Authorization: Bearer <token>',
      },
    },

    schemas: {
      ErrorResponse: {
        type: 'object',
        required: ['success', 'message'],
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          message: {
            type: 'string',
            example: 'Request failed',
          },
          code: {
            type: 'string',
            nullable: true,
            example: 'VALIDATION_ERROR',
          },
          details: {
            type: 'array',
            nullable: true,
            items: {
              type: 'object',
            },
          },
        },
      },

      SuccessResponse: {
        type: 'object',
        required: ['success', 'message'],
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          message: {
            type: 'string',
            example: 'Request successful',
          },
          data: {
            nullable: true,
          },
          meta: {
            nullable: true,
          },
        },
      },

      PaginationMeta: {
        type: 'object',
        properties: {
          page: {
            type: 'integer',
            example: 1,
          },
          limit: {
            type: 'integer',
            example: 10,
          },
          total: {
            type: 'integer',
            example: 25,
          },
          totalPages: {
            type: 'integer',
            example: 3,
          },
          hasNextPage: {
            type: 'boolean',
            example: true,
          },
          hasPreviousPage: {
            type: 'boolean',
            example: false,
          },
        },
      },
    },
  },

  security: [
    {
      bearerAuth: [],
    },
  ],
};

const swaggerOptions = {
  definition: swaggerDefinition,

  apis: [
    './src/routes/*.js',
    './src/controllers/*.js',
  ],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

module.exports = swaggerSpec;