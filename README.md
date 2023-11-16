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