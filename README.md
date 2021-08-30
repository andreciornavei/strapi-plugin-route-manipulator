# strapi-plugin-route-manipulator

## 🚀 &nbsp; _Overview and Motivation_

This plugin was developed to inject data or rearrange data from your context by your `routes.json` file as a declarative mode. By this way, you does not need to create custom policies or controllers to attendee some simple business logic, like inject the authenticated user id to your body payload, or to force some required filter in a specific route for example.

The purpose behind this plugin is help us to keep the code implementation small as possible, giving the freedom to design the application focusing as much as possible on the strapi's native routes and implementations.

This plugin is part of a series of plugins I've been designing to reduce the amount of code and effort in developing strapi applications, focusing as much as possible on routes `[routes.json]`.

You can see other plugins that can help you below:
* [strapi-plugin-tunning](https://www.npmjs.com/package/strapi-plugin-tunning)
* [strapi-plugin-validator](https://www.npmjs.com/package/strapi-plugin-validator)
* [strapi-plugin-route-permission](https://www.npmjs.com/package/strapi-plugin-route-permission)

---

## ⏳ &nbsp; _Installation_

With npm:
```bash
npm install strapi-plugin-route-manipulator
```

With yarn:
```bash
yarn add strapi-plugin-route-manipulator
```

---
## ✨ &nbsp; _Getting Started with example_

### Introduction:
This plugin enable a new attribute on route config, the `manipulator`, this attribute allows you to manipulate data from `ctx` for yourself necessities. The `manipulator`attribute has `two` sub-attributes that can be use for different purpose, the `arrange` and `input`. You can see more about them on the next paragraphs.

### 1 - Arrange:
The arrange property has a simple concept, retrieve a data from a `source context property`, and set it value to another `target context properties`. In resume, `arrange` will access any property from `ctx` and rearrange it value to another place of `ctx` where the value makes sense for the route business logic.

To understand the `arrange` structure, you always will use it as an object, where the `key` is the `source context property` (the origin value you want to arrange) and the `value` is an `array` containing all `target context property` you want to populate with the value.

_On the example below, you can see the manipulator arrange been used to inject the user owner id to the body payload, forcing the relationship between product and user._
```json
{
  "routes": [
    {
      "method": "POST",
      "path": "/products",
      "handler": "product.create",
      "config": {
        "policies": [],
        "manipulator": {
          "arrange": {
            "state.user.id": ["request.body.user"]
          }
        }
      }
    }
  ]
}
```
_On this other example, you can see the manipulator arrange been used to inject the user owner id to the query filter, forcing to retrieve only products that belongs to authenticated user._
```json
{
  "routes": [
    {
      "method": "GET",
      "path": "/products",
      "handler": "product.find",
      "config": {
        "policies": [],
        "manipulator": {
          "arrange": {
            "state.user.id": ["query.user"]
          }
        }
      }
    }
  ]
}
```

### 2 - Input:
The input property also has a simple concept, inject a free value to your `ctx`.

To understand the `input` structure, you always will use it as an object, where the `key` is the target `ctx` property you want to populate, and the `value` is the value you want to inject on the target ctx property.

_On the example below, you can see the manipulator input been used to inject a filter to `ctx.query.status`, forcing only products marked as `published` to return, where the frontend has no power of decision to retrieve all the products from database, preserving your server business rule (the end user does not need to see unpublished products)._
```json
{
  "routes": [
    {
      "method": "GET",
      "path": "/products",
      "handler": "product.find",
      "config": {
        "policies": [],
        "manipulator": {
          "input": {
            "query.status": "published"
          }
        }
      }
    }
  ]
}
```
---

## 🎉 &nbsp;  _Congradulations, You're done._

I hope this plugin helps you in your strapi projects and save a lot of time and code.

---
## 📜 &nbsp; _License_

This project is under the MIT license. See the [LICENSE](./LICENSE) for details.

--- 

💻 &nbsp; Developed by André Ciornavei - [Get in touch!](https://www.linkedin.com/in/andreciornavei/)