# TP_CRUDProject

Le but de ce TP est de réaliser un site Web classique CRUD de gestion d’annonces immobilières.

=== Create project ====

npx express-generator --view=pug nomProjet
npm install
DEBUG=nomProjet:* npm start


=== docker-compose.yml =======
Construire conteneur
   > docker-compose up -d

Stop conteneur
   > docker stop nom_conteneur

Restart conteneur
   > docker restart nom_conteneur


# AUTH DOMAIN AND API_IDENTIFIER
The values of YOUR_AUTH0_DOMAIN and YOUR_API_IDENTIFIER must be replaced by the values from your Auth0 API "Quick Start" page as follows:

The value of AUTH0_DOMAIN is the value of the issuer object property from the code snippet, without the protocol, https://, the quotation marks, and the trailing slash. It follows this format YOUR-AUTH0-TENANT.auth0.com.

The value of API_IDENTIFIER is the value of the audience object property from the code snippet, and it's the same value that you provided as an identifier to your Auth0 API earlier on. Do not include quotation marks.


# Elements .env pour l'authentication
Notre application client
- BASE_URL=http://localhost:3000

Domain donnée par auth0
- AUTH0_DOMAIN=https://dev-kpe14zh2c6kpw5rl.us.auth0.com

ID et session secret donnés par auth0 lors de la creation de notre application
- CLIENT_ID=

Generate the session secret run the command
   > node -e "console.log(crypto.randomBytes(32).toString('hex'))"

and paste the result in SESSION_SECRET in your .env
- SESSION_SECRET=


Seveur api
- AUTH0_AUDIENCE=http://localhost:4500/graphql
- SERVER_URL=http://localhost:4500/graphql

Client secret donnée par auth0
CLIENT_SECRET=