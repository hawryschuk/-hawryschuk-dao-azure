var config = {}

config.host = process.env.HOST || "https://test12345.documents.azure.com:443/";
config.authKey = process.env.AUTH_KEY || "lA6y59QWIZAbKFC2iZYD1RV0Q9SbgCa1VbP01bb7uYWBVhg3D7pL92XRAwTlBUdWgj2YuDKApKamLx4345C27w==";
config.databaseId = "ToDoList";
config.collectionId = "Items";

module.exports = config;