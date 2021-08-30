const _ = require('lodash');

module.exports = strapi => {
  return {
    initialize() {
      // Attach validations/sanitizors to api actions
      _.forEach(_.get(strapi, "config.routes", []), value => {
        if (_.get(value.config, 'manipulator')) value.config.policies.push('plugins::route-manipulator.handle');
      });
      // Attach validations/sanitizors to extensions actions
      if (strapi.extensions) {
        _.forEach(strapi.extension, plugin => {
          _.forEach(_.get(plugin, "config.routes", []), value => {
            if (_.get(value.config, 'manipulator')) value.config.policies.push('plugins::route-manipulator.handle');
          });
        });
      }
    },
  };
};