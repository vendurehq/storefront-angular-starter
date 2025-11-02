# Vendure Angular Storefront

This is an e-commerce storefront application which is designed to be used with the [Vendure ecommerce framework](https://github.com/vendure-ecommerce/vendure) as a back end.

It is a progressive web application (PWA) which also uses Angular Universal for server-side rendering.

The app is built with the [Angular CLI](https://github.com/angular/angular-cli), with the data layer being handled by [Apollo Client](https://github.com/apollographql/apollo-client).

## Development

0. Clone this repo
1. Run `npm install` or `yarn` in the root dir
2. Run `npm start` or `yarn start` to build in development mode.
3. Make sure you have a local Vendure instance running a `http://localhost:3000`.
4. Open `http://localhost:4201` to see the storefront app running.

## Code generation

This project uses [graphql-code-generator](https://www.graphql-code-generator.com/) to generate TypeScript types based on the Vendure GraphQL API. To update the types, first change the `schema` property of [codegen.yml](./codegen.yml) to point to your local Vendure server, and then run the `generate-types` npm script.

## Deployment

To deploy this storefront in a production environment, take the following steps:

1. Open the [environment.prod.ts file](./src/environments/environment.prod.ts) and change the values to match your deployed Vendure server. You also probably want to set the `baseHref` value to `'/'` rather than `'/storefront/'`.
2. Open the [angular.json file](./angular.json) and set the baseHref values to point to root:
    ```diff
      "production": {
    -    "baseHref": "/storefront/",
    -    "deployUrl": "/storefront/", 
    +    "baseHref": "/",
    +    "deployUrl": "/", 
    ```
3. You then need to build for production using the `build:ssr` npm script. This can be done either locally or on your production server, depending on your preferred workflow.
4. The built artifacts will be found in the `dist/` directory. The command to run the storefront as a server-rendered app is `node dist/server/main.js`. This will start a node server running on port 4000. You should configure your webserver to pass requests arriving on port 80 to `localhost:4000`.
5. In the Vender server config, configure the `EmailPlugin` to point to the correct routes used by this storefront:
   ```ts
   EmailPlugin.init({
     // ...
     globalTemplateVars: {
       fromAddress: '"Example_Server" <noreply@example.com>',
       verifyEmailAddressUrl: 'https://your-domain.com/account/verify',
       passwordResetUrl: 'https://your-domain.com/account/reset-password',
       changeEmailAddressUrl: 'https://your-domain.com/account/change-email-address',
     }
   })
   ```

### Deploying the demo

This project is used in the [angular-storefront.vendure.io](https://angular-storefront.vendure.io) demo. There is a [GitHub Actions workflow](./.github/workflows/build.yml) which is triggered whenever a new tag is added. The tag should be of the format `"vX.Y.Z"`. The workflow will run the `build:ssr` script and upload the compiled output to an Amazon S3 bucket, from which the vendure-demo project will pull the artifacts.

1. Update the version in package.json & Dockerfile
2. Commit the changes "Bump version to vX.Y.Z"
3. Create a tag with the same version number:
   ```sh
   git tag -a v1.2.3 -m "v1.2.3"
   ```
4. Push the tag to GitHub:
   ```sh
   git push origin master --follow-tags
   ```

Once the GitHub action workflow has completed and the built artifacts have been successfully uploaded to the S3 bucket, the app can be deployed with `git push dokku master`.

## License

MIT


