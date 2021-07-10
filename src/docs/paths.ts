export const paths = {
  '/user': {
    get: {
      tags: ['User'],
      description: 'List the users',
      responses: {
        200: {
          description: 'Get the users list',
          content: {
            'application/json': {},
          },
        },
      },
    },
  },
  '/student': {
    get: {
      tags: ['Student'],
      description: 'List the students',
      responses: {
        200: {
          description: 'Get the students list',
          content: {
            'application/json': {},
          },
        },
      },
    },
  },
};
