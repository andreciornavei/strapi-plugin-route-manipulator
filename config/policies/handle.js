"use strict"

const _ = require("lodash")


function findManipulatorSettings(ctx) {
  // ************************************** //
  // PARSE REQUESTED ROUTE TO ORIGINAL PATH //
  // ************************************** //
  let originalPath = ctx.request.url.split("?")[0]
  const params = ctx.params || {}
  // remove the param "0" from route if it exists
  // to prevent broken pregmactch logic replacer
  if (params["0"]) delete params["0"]
  if (Object.keys(params).length > 0) {
    originalPath = originalPath.split("/").map(partValue => {
      for (const partKey in params) {
        if (params[partKey] == partValue) return `(:.*\/|(:.*))`
      }
      return partValue
    }).join("\/")
  }

  // Get all application routes
  let routes = strapi.config.routes
  _.forEach(strapi.plugins, (plugin) => {
    _.forEach(plugin.config.routes, (route) => {
      if (route && route.method && route.path) {
        routes.push(route)
      }
    })
  })

  // **********************************//
  // FIND ROUTE AND RETURN MANUPULATOR //
  // **********************************//
  // define a regex separating params
  const regex = new RegExp(originalPath, 'gm');
  const route = routes.find(route => {
    return (
      route.method == ctx.request.method &&
      route.path.replace(regex, "true") === "true"
    )
  })

  // return manipulator object if it exists
  return _.get(route, "config.manipulator", {})
}

function resolveMultipart(ctx, deepKey) {
  let parts = deepKey.split(".")
  if (ctx.is("multipart")) {
    if (parts[0] == "body" && parts[1] != "data") {
      parts[0] = `body.data`
    } else if (parts[0] == "request" && parts[1] == "body" && parts[2] != "data") {
      parts[1] = `body.data`
    }
  }
  return parts.join(".")
}

function resolveCtxRequestBodyData(ctx) {
  if (ctx.is("multipart") && _.get(ctx, "request.body.data")) {
    if (typeof _.get(ctx, "request.body.data") == "string") {
      _.set(ctx, "request.body.data", JSON.parse(_.get(ctx, "request.body.data")))
    }
  }
}

function revertCtxRequestBodyData(ctx) {
  if (ctx.is("multipart") && _.get(ctx, "request.body.data")) {
    if (typeof _.get(ctx, "request.body.data") != "string") {
      _.set(ctx, "request.body.data", JSON.stringify(_.get(ctx, "request.body.data")))
    }
  }
}

module.exports = async (ctx, next) => {
  const manipulator = findManipulatorSettings(ctx)
  resolveCtxRequestBodyData(ctx)
  // retrieve input setting from manipulator
  // it should inject the object value into context object key
  const input = _.get(manipulator, "input", {})
  for (const input_key in input) {
    const resolvedInputKey = resolveMultipart(ctx, input_key)
    _.set(ctx, resolvedInputKey, input[input_key])
  }
  // retrieve arrange setting from manipulator
  // it should arrange the source data in context
  // to target property in context
  const arrange = _.get(manipulator, "arrange", {})
  for (const source in arrange) {
    const targets = arrange[source] || []
    if (_.isArray(targets)) {
      // if targets is an array os string, proccess it normally
      for (const target of targets) {
        const resolvedInputKey = resolveMultipart(ctx, target)
        _.set(ctx, resolvedInputKey, _.get(ctx, source))
      }
    } else if (_.isObject(targets)) {
      // if it is an object, extract the key and proccess
      for (const target of Object.keys(targets)) {
        // if it contains deepLevel confit, parse deepLevel
        if (_.get(targets[target], "deepLevel")) {
          // retrieve the deep level
          const deepLevel = _.get(targets[target], "deepLevel") || 0
          // explode target in parts
          const parts = target.split(".")
          const deep = []
          // separate the deep objecj for the composed dotted-key
          for (let i = 0; i < deepLevel; i++) deep.push(parts.shift())

          // join the deepLevel and parts in one string again
          const deepJoin = resolveMultipart(ctx, deep.join("."))
          const partsJoin = parts.join(".")

          // create an empty object to the deep level if it does not exists
          _.set(ctx, deepJoin, _.get(ctx, deepJoin, {}))
          // inject the source value to composed dotted-key inside deep level object
          _.get(ctx, deepJoin)[partsJoin] = _.get(ctx, source)
        }
        // else proccess normally
        else _.set(ctx, target, _.get(ctx, source))
      }
    }
  }
  revertCtxRequestBodyData(ctx)
  return await next()
}
