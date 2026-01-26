require('dotenv').config();

module.exports = {
  SUPERSET_URL: process.env.SUPERSET_URL,
  USERNAME: process.env.SUPERSET_USERNAME,
  PASSWORD: process.env.SUPERSET_PASSWORD
};