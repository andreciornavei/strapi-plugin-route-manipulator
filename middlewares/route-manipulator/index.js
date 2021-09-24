const _ = require('lodash');

function insertAt(array, index, ...elementsArray) {
  array.splice(index, 0, ...elementsArray);
}

function appendPolicy(value) {
  // if config contains arranges, then check if it is an object
  // and handle beforePolicy or afterPolicy to attach the handler
  // on the desired policy position accoring business rule
  if (_.get(value, "config.manipulator.arrange")) {
    for (const arrange of Object.values(value.config.manipulator.arrange)) {
      for (const arrangeEntry of Object.values(arrange)) {
        if (_.get(arrangeEntry, "beforePolicy")) {
          const policyIndex = value.config.policies.findIndex(entry => entry == _.get(arrangeEntry, "beforePolicy"))
          if(policyIndex < 0) throw new Error(`[strapi-plugin-route-manipulator] :: beforePolicy (${_.get(arrangeEntry, "afterPolicy")}) not found on policies definition`)
          insertAt(value.config.policies, policyIndex, 'plugins::route-manipulator.handle')
        }
        if (_.get(arrangeEntry, "afterPolicy")) {
          const policyIndex = value.config.policies.findIndex(entry => entry == _.get(arrangeEntry, "afterPolicy"))
          if(policyIndex < 0) throw new Error(`[strapi-plugin-route-manipulator] :: afterPolicy (${_.get(arrangeEntry, "afterPolicy")}) not found on policies definition`)
          insertAt(value.config.policies, policyIndex + 1, 'plugins::route-manipulator.handle')
        }
      }
    }
  }
  value.config.policies.unshift('plugins::route-manipulator.handle');
  value.config.policies.push('plugins::route-manipulator.handle');
}

module.exports = strapi => {
  return {
    initialize() {
      // Attach route-manipulator handler to api actions
      _.forEach(_.get(strapi, "config.routes", []), value => {
        if (_.get(value.config, 'manipulator')) appendPolicy(value)
      });
      // Attach route-manipulator handler to extensions actions
      if (strapi.extensions) {
        _.forEach(strapi.extension, plugin => {
          _.forEach(_.get(plugin, "config.routes", []), value => {
            if (_.get(value.config, 'manipulator')) appendPolicy(value)
          });
        });
      }
    },
  };
};
