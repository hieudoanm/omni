export const SAMPLE_OPENAPI = `{
  "openapi": "3.0.0",
  "info": { "title": "Pet Store API", "version": "1.0.0", "description": "A sample Pet Store API" },
  "servers": [{ "url": "https://petstore.example.com/v1" }],
  "paths": {
    "/pets": {
      "get": { "summary": "List all pets", "operationId": "listPets", "tags": ["pets"],
        "parameters": [{ "name": "limit", "in": "query", "schema": { "type": "integer" }, "required": false }],
        "responses": { "200": { "description": "A list of pets" } } },
      "post": { "summary": "Create a pet", "operationId": "createPet", "tags": ["pets"],
        "requestBody": { "required": true, "content": { "application/json": { "schema": { "type": "object", "properties": { "name": { "type": "string" }, "tag": { "type": "string" } } } } } },
        "responses": { "201": { "description": "Pet created" } } }
    },
    "/pets/{petId}": {
      "get": { "summary": "Get a pet by ID", "operationId": "showPetById", "tags": ["pets"],
        "parameters": [{ "name": "petId", "in": "path", "required": true, "schema": { "type": "string" } }],
        "responses": { "200": { "description": "A pet" } } },
      "delete": { "summary": "Delete a pet", "operationId": "deletePet", "tags": ["pets"],
        "parameters": [{ "name": "petId", "in": "path", "required": true, "schema": { "type": "string" } }],
        "responses": { "204": { "description": "Pet deleted" } } }
    }
  }
}`;

export const lineCount = (str: string): number => (str ? str.split('\n').length : 0);
