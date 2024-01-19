
module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/rh/dashboard',
      handler: 'humanresource.find',
      config: {
        auth: false,
      },
    },
  ],
};
